package slack

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/slack-go/slack"
	"go.uber.org/zap"
)

// Notifier handles Slack messaging
type Notifier struct {
	client        *slack.Client
	channelID     string
	signingSecret string
	logger        *zap.Logger
	metrics       MetricsRecorder
}

// MetricsRecorder interface for recording metrics
type MetricsRecorder interface {
	RecordSlackMessage(channel, messageType, status string, duration time.Duration)
	RecordSlackError(operation, errorType string)
}

// NewNotifier creates a new Slack notifier
func NewNotifier(botToken, channelID, signingSecret string, logger *zap.Logger, metrics MetricsRecorder) *Notifier {
	client := slack.New(botToken)

	return &Notifier{
		client:        client,
		channelID:     channelID,
		signingSecret: signingSecret,
		logger:        logger,
		metrics:       metrics,
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
	// For now, return a simple section block instead of actions
	// TODO: Implement proper action block conversion with updated Slack SDK
	return slack.NewSectionBlock(
		slack.NewTextBlockObject("mrkdwn", "*Interactive buttons not yet implemented*", false, false),
		nil, nil,
	), nil
}

// TODO: Implement action element conversion with updated Slack SDK

// HandleInteractiveMessage handles Slack interactive messages (button clicks)
// TODO: Implement interactive message handling with updated Slack SDK
func (n *Notifier) HandleInteractiveMessage(w http.ResponseWriter, r *http.Request) {
	n.logger.Info("Interactive message handling not yet implemented")
	w.WriteHeader(http.StatusOK)
}
