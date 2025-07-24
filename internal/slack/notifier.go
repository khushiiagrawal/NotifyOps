package slack

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/slack-go/slack"
	"go.uber.org/zap"

	"github-issue-ai-bot/internal/ai"
	gh "github-issue-ai-bot/internal/github"
)

// Notifier handles Slack messaging
type Notifier struct {
	client        *slack.Client
	channelID     string
	signingSecret string
	logger        *zap.Logger
	metrics       MetricsRecorder
	summarizer    *ai.Summarizer
	githubHandler *gh.Handler
}

// MetricsRecorder interface for recording metrics
type MetricsRecorder interface {
	RecordSlackMessage(channel, messageType, status string, duration time.Duration)
	RecordSlackError(operation, errorType string)
}

// NewNotifier creates a new Slack notifier
func NewNotifier(botToken, channelID, signingSecret string, logger *zap.Logger, metrics MetricsRecorder, summarizer *ai.Summarizer, githubHandler *gh.Handler) *Notifier {
	client := slack.New(botToken)

	return &Notifier{
		client:        client,
		channelID:     channelID,
		signingSecret: signingSecret,
		logger:        logger,
		metrics:       metrics,
		summarizer:    summarizer,
		githubHandler: githubHandler,
	}
}

// SendIssueSummary sends an issue summary to Slack
func (n *Notifier) SendIssueSummary(ctx context.Context, message map[string]interface{}) error {
	start := time.Now()

	// Convert message to Slack blocks
	blocks, err := n.convertToSlackBlocks(message)
	if err != nil {
		n.metrics.RecordSlackError("convert_blocks", "json_error")
		n.logger.Error("Failed to convert message to Slack blocks", zap.Error(err))
		return fmt.Errorf("failed to convert message to Slack blocks: %w", err)
	}

	// Send message to Slack
	_, _, err = n.client.PostMessageContext(
		ctx,
		n.channelID,
		slack.MsgOptionBlocks(blocks...),
		slack.MsgOptionText("GitHub Issue Update", false), // Fallback text
	)

	duration := time.Since(start)

	if err != nil {
		n.metrics.RecordSlackMessage(n.channelID, "issue_summary", "error", duration)
		n.metrics.RecordSlackError("send_message", "api_error")
		n.logger.Error("Failed to send Slack message", zap.Error(err))
		return fmt.Errorf("failed to send Slack message: %w", err)
	}

	n.metrics.RecordSlackMessage(n.channelID, "issue_summary", "success", duration)
	n.logger.Info("Successfully sent issue summary to Slack",
		zap.String("channel", n.channelID),
	)

	return nil
}

// convertToSlackBlocks converts a message map to Slack blocks
func (n *Notifier) convertToSlackBlocks(message map[string]interface{}) ([]slack.Block, error) {
	blocksData, ok := message["blocks"]
	if !ok {
		return nil, fmt.Errorf("invalid message format: missing blocks")
	}

	// Debug: Log the message structure
	n.logger.Info("Converting Slack message",
		zap.Any("message", message),
		zap.Any("blocks_data", blocksData),
		zap.String("blocks_type", fmt.Sprintf("%T", blocksData)),
	)

	var blocks []slack.Block

	// Handle different types of blocks data
	switch v := blocksData.(type) {
	case []interface{}:
		for i, blockData := range v {
			n.logger.Info("Processing block", zap.Int("index", i), zap.Any("block", blockData))
			block, err := n.convertBlock(blockData)
			if err != nil {
				return nil, fmt.Errorf("failed to convert block %d: %w", i, err)
			}
			blocks = append(blocks, block)
		}
	case []map[string]interface{}:
		for i, blockData := range v {
			n.logger.Info("Processing block", zap.Int("index", i), zap.Any("block", blockData))
			block, err := n.convertBlock(blockData)
			if err != nil {
				return nil, fmt.Errorf("failed to convert block %d: %w", i, err)
			}
			blocks = append(blocks, block)
		}
	default:
		return nil, fmt.Errorf("invalid blocks format: expected []interface{} or []map[string]interface{}, got %T", blocksData)
	}

	return blocks, nil
}

// convertBlock converts a single block to Slack block
func (n *Notifier) convertBlock(blockData interface{}) (slack.Block, error) {
	blockMap, ok := blockData.(map[string]interface{})
	if !ok {
		return nil, fmt.Errorf("invalid block format")
	}

	blockType, ok := blockMap["type"].(string)
	if !ok {
		return nil, fmt.Errorf("missing block type")
	}

	switch blockType {
	case "header":
		return n.convertHeaderBlock(blockMap)
	case "section":
		return n.convertSectionBlock(blockMap)
	case "actions":
		return n.convertActionsBlock(blockMap)
	default:
		return nil, fmt.Errorf("unsupported block type: %s", blockType)
	}
}

// convertHeaderBlock converts a header block
func (n *Notifier) convertHeaderBlock(blockMap map[string]interface{}) (slack.Block, error) {
	textData, ok := blockMap["text"].(map[string]interface{})
	if !ok {
		return nil, fmt.Errorf("invalid header block: missing text")
	}

	text, ok := textData["text"].(string)
	if !ok {
		return nil, fmt.Errorf("invalid header block: missing text content")
	}

	return slack.NewHeaderBlock(slack.NewTextBlockObject("plain_text", text, false, false)), nil
}

// convertSectionBlock converts a section block
func (n *Notifier) convertSectionBlock(blockMap map[string]interface{}) (slack.Block, error) {
	// Handle text section
	if textData, ok := blockMap["text"].(map[string]interface{}); ok {
		text, ok := textData["text"].(string)
		if !ok {
			return nil, fmt.Errorf("invalid section block: missing text content")
		}

		textType, ok := textData["type"].(string)
		if !ok {
			textType = "mrkdwn"
		}

		var textObj *slack.TextBlockObject
		if textType == "plain_text" {
			textObj = slack.NewTextBlockObject("plain_text", text, false, false)
		} else {
			textObj = slack.NewTextBlockObject("mrkdwn", text, false, false)
		}

		return slack.NewSectionBlock(textObj, nil, nil), nil
	}

	// Handle fields section
	if fieldsData, ok := blockMap["fields"]; ok {
		var fields []*slack.TextBlockObject

		// Handle different types of fields data
		switch v := fieldsData.(type) {
		case []interface{}:
			for _, fieldData := range v {
				fieldMap, ok := fieldData.(map[string]interface{})
				if !ok {
					continue
				}

				text, ok := fieldMap["text"].(string)
				if !ok {
					continue
				}

				textType, ok := fieldMap["type"].(string)
				if !ok {
					textType = "mrkdwn"
				}

				var textObj *slack.TextBlockObject
				if textType == "plain_text" {
					textObj = slack.NewTextBlockObject("plain_text", text, false, false)
				} else {
					textObj = slack.NewTextBlockObject("mrkdwn", text, false, false)
				}

				fields = append(fields, textObj)
			}
		case []map[string]interface{}:
			for _, fieldMap := range v {
				text, ok := fieldMap["text"].(string)
				if !ok {
					continue
				}

				textType, ok := fieldMap["type"].(string)
				if !ok {
					textType = "mrkdwn"
				}

				var textObj *slack.TextBlockObject
				if textType == "plain_text" {
					textObj = slack.NewTextBlockObject("plain_text", text, false, false)
				} else {
					textObj = slack.NewTextBlockObject("mrkdwn", text, false, false)
				}

				fields = append(fields, textObj)
			}
		}

		if len(fields) > 0 {
			return slack.NewSectionBlock(nil, fields, nil), nil
		}
	}

	return nil, fmt.Errorf("invalid section block: missing text or fields")
}

// convertActionsBlock converts an actions block
func (n *Notifier) convertActionsBlock(blockMap map[string]interface{}) (slack.Block, error) {
	elementsData, ok := blockMap["elements"]
	if !ok {
		return nil, fmt.Errorf("actions block missing elements")
	}

	var elements []slack.BlockElement

	switch v := elementsData.(type) {
	case []interface{}:
		for _, elem := range v {
			elemMap, ok := elem.(map[string]interface{})
			if !ok {
				continue
			}
			if elemMap["type"] == "button" {
				textMap, _ := elemMap["text"].(map[string]interface{})
				text := ""
				if textMap != nil {
					text, _ = textMap["text"].(string)
				}
				style, _ := elemMap["style"].(string)
				actionID, _ := elemMap["action_id"].(string)
				value, _ := elemMap["value"].(string)
				url, _ := elemMap["url"].(string)

				btn := slack.NewButtonBlockElement(actionID, value, slack.NewTextBlockObject("plain_text", text, false, false))
				if style == "primary" {
					btn.Style = slack.StylePrimary
				} else if style == "danger" {
					btn.Style = slack.StyleDanger
				}
				if url != "" {
					btn.URL = url
				}
				elements = append(elements, btn)
			}
		}
	case []map[string]interface{}:
		for _, elemMap := range v {
			if elemMap["type"] == "button" {
				textMap, _ := elemMap["text"].(map[string]interface{})
				text := ""
				if textMap != nil {
					text, _ = textMap["text"].(string)
				}
				style, _ := elemMap["style"].(string)
				actionID, _ := elemMap["action_id"].(string)
				value, _ := elemMap["value"].(string)
				url, _ := elemMap["url"].(string)

				btn := slack.NewButtonBlockElement(actionID, value, slack.NewTextBlockObject("plain_text", text, false, false))
				if style == "primary" {
					btn.Style = slack.StylePrimary
				} else if style == "danger" {
					btn.Style = slack.StyleDanger
				}
				if url != "" {
					btn.URL = url
				}
				elements = append(elements, btn)
			}
		}
	}

	if len(elements) == 0 {
		return slack.NewSectionBlock(
			slack.NewTextBlockObject("mrkdwn", "*No interactive buttons available*", false, false),
			nil, nil,
		), nil
	}

	return slack.NewActionBlock("actions", elements...), nil
}

// TODO: Implement action element conversion with updated Slack SDK

// HandleInteractiveMessage handles Slack interactive messages (button clicks)
func (n *Notifier) HandleInteractiveMessage(w http.ResponseWriter, r *http.Request) {
	n.logger.Info("Received Slack interactive message request")

	// Parse the payload from Slack
	if err := r.ParseForm(); err != nil {
		n.logger.Error("Failed to parse form", zap.Error(err))
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	payload := r.PostFormValue("payload")
	if payload == "" {
		n.logger.Error("Missing payload in Slack interactive request")
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	n.logger.Info("Parsed Slack payload", zap.String("payload_length", fmt.Sprintf("%d", len(payload))))

	var callback slack.InteractionCallback
	if err := json.Unmarshal([]byte(payload), &callback); err != nil {
		n.logger.Error("Failed to unmarshal Slack payload", zap.Error(err))
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	n.logger.Info("Successfully parsed Slack callback",
		zap.String("type", string(callback.Type)),
		zap.String("channel_id", callback.Channel.ID),
		zap.String("user_id", callback.User.ID),
		zap.String("message_ts", callback.Message.Timestamp))

	// Find the action
	if len(callback.ActionCallback.BlockActions) == 0 {
		n.logger.Error("No actions in Slack interactive payload")
		w.WriteHeader(http.StatusOK)
		return
	}
	action := callback.ActionCallback.BlockActions[0]

	n.logger.Info("Processing Slack action",
		zap.String("action_id", action.ActionID),
		zap.String("action_value", action.Value),
		zap.String("action_type", string(action.Type)))

	if action.ActionID == "review_issue" {
		n.logger.Info("Processing review_issue action")
		// Post a reply in the thread
		_, _, err := n.client.PostMessage(
			callback.Channel.ID,
			slack.MsgOptionText(":mag: Review thread started! (AI insights coming soon)", false),
			slack.MsgOptionTS(callback.Message.Timestamp),
		)
		if err != nil {
			n.logger.Error("Failed to post review thread reply", zap.Error(err))
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		n.logger.Info("Successfully posted review thread reply")
		w.WriteHeader(http.StatusOK)
		return
	}

	if action.ActionID == "suggest_fix" {
		n.logger.Info("Processing suggest_fix action")
		// Parse repo and issue number from action.Value (format: repoName:issueNumber)
		parts := strings.SplitN(action.Value, ":", 2)
		if len(parts) != 2 {
			n.logger.Error("Failed to parse repo and issue number",
				zap.String("value", action.Value),
				zap.Int("parts_count", len(parts)))
			n.client.PostMessage(
				callback.Channel.ID,
				slack.MsgOptionText(":warning: Could not parse issue information.", false),
				slack.MsgOptionTS(callback.Message.Timestamp),
			)
			w.WriteHeader(http.StatusOK)
			return
		}

		repo := parts[0]
		number, err := strconv.Atoi(parts[1])
		if err != nil {
			n.logger.Error("Failed to parse issue number",
				zap.String("value", action.Value),
				zap.String("number_part", parts[1]),
				zap.Error(err))
			n.client.PostMessage(
				callback.Channel.ID,
				slack.MsgOptionText(":warning: Could not parse issue number.", false),
				slack.MsgOptionTS(callback.Message.Timestamp),
			)
			w.WriteHeader(http.StatusOK)
			return
		}

		n.logger.Info("Parsed issue info", zap.String("repo", repo), zap.Int("number", number))

		ctx := context.Background()
		// Fetch enriched issue data
		n.logger.Info("Fetching enriched issue data")
		issueData, err := n.githubHandler.FetchEnrichedIssueData(ctx, repo, number)
		if err != nil {
			n.logger.Error("Failed to fetch issue data for suggest_fix", zap.Error(err))
			n.client.PostMessage(
				callback.Channel.ID,
				slack.MsgOptionText(":warning: Could not fetch issue data for fix suggestion.", false),
				slack.MsgOptionTS(callback.Message.Timestamp),
			)
			w.WriteHeader(http.StatusOK)
			return
		}
		n.logger.Info("Successfully fetched issue data")

		// Call AI summarizer
		n.logger.Info("Calling AI summarizer for fix suggestion")
		summary, err := n.summarizer.SummarizeIssue(ctx, issueData)
		if err != nil {
			n.logger.Error("AI summarizer failed for suggest_fix", zap.Error(err))
			n.client.PostMessage(
				callback.Channel.ID,
				slack.MsgOptionText(":warning: AI could not generate a fix suggestion.", false),
				slack.MsgOptionTS(callback.Message.Timestamp),
			)
			w.WriteHeader(http.StatusOK)
			return
		}
		n.logger.Info("Successfully generated AI summary with fix suggestion")

		// Extract suggested_fix
		suggestedFix := summary.SuggestedFix
		n.logger.Info("Extracted suggested fix", zap.String("fix_length", fmt.Sprintf("%d", len(suggestedFix))))

		// Post the suggested fix in the thread
		msg := fmt.Sprintf(":wrench: *Suggested Fix:*\n```\n%s\n```", suggestedFix)
		n.logger.Info("Posting fix suggestion to thread")
		_, _, err = n.client.PostMessage(
			callback.Channel.ID,
			slack.MsgOptionText(msg, false),
			slack.MsgOptionTS(callback.Message.Timestamp),
		)
		if err != nil {
			n.logger.Error("Failed to post fix suggestion to thread", zap.Error(err))
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		n.logger.Info("Successfully posted fix suggestion to thread - REPLY SENT")
		w.WriteHeader(http.StatusOK)
		return
	}

	n.logger.Info("Unhandled Slack action", zap.String("action_id", action.ActionID))
	w.WriteHeader(http.StatusOK)
}
