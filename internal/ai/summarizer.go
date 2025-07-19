package ai

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	openai "github.com/sashabaranov/go-openai"
	"go.uber.org/zap"

	gh "github-issue-ai-bot/internal/github"
)

// Summarizer handles AI-powered issue summarization
type Summarizer struct {
	client    *openai.Client
	model     string
	maxTokens int
	temp      float32
	logger    *zap.Logger
	metrics   MetricsRecorder
}

// MetricsRecorder interface for recording metrics
type MetricsRecorder interface {
	RecordOpenAIRequest(model, status string, duration time.Duration)
	RecordOpenAITokens(model, tokenType string, count int)
	RecordOpenAIError(errorType string)
}

// IssueSummary contains the AI-generated summary
type IssueSummary struct {
	Title       string
	Summary     string
	Priority    string
	Category    string
	ActionItems []string
	CodeContext string
	Confidence  float64
}

// NewSummarizer creates a new AI summarizer
func NewSummarizer(apiKey, model string, maxTokens int, temp float32, logger *zap.Logger, metrics MetricsRecorder) *Summarizer {
	client := openai.NewClient(apiKey)

	return &Summarizer{
		client:    client,
		model:     model,
		maxTokens: maxTokens,
		temp:      temp,
		logger:    logger,
		metrics:   metrics,
	}
}

// SummarizeIssue generates an AI summary of a GitHub issue
func (s *Summarizer) SummarizeIssue(ctx context.Context, issueData *gh.IssueData) (*IssueSummary, error) {
	start := time.Now()

	// Build the prompt
	prompt := s.buildPrompt(issueData)

	// Call OpenAI API
	resp, err := s.client.CreateChatCompletion(
		ctx,
		openai.ChatCompletionRequest{
			Model: s.model,
			Messages: []openai.ChatCompletionMessage{
				{
					Role:    openai.ChatMessageRoleSystem,
					Content: s.getSystemPrompt(),
				},
				{
					Role:    openai.ChatMessageRoleUser,
					Content: prompt,
				},
			},
			MaxTokens:   s.maxTokens,
			Temperature: s.temp,
		},
	)

	duration := time.Since(start)

	if err != nil {
		s.metrics.RecordOpenAIRequest(s.model, "error", duration)
		s.metrics.RecordOpenAIError("api_error")
		s.logger.Error("OpenAI API error", zap.Error(err))
		return nil, fmt.Errorf("failed to generate summary: %w", err)
	}

	// Record successful request
	s.metrics.RecordOpenAIRequest(s.model, "success", duration)

	// Record token usage
	if resp.Usage.PromptTokens > 0 {
		s.metrics.RecordOpenAITokens(s.model, "prompt", resp.Usage.PromptTokens)
		s.metrics.RecordOpenAITokens(s.model, "completion", resp.Usage.CompletionTokens)
		s.metrics.RecordOpenAITokens(s.model, "total", resp.Usage.TotalTokens)
	}

	// Parse the response
	summary, err := s.parseSummaryResponse(resp.Choices[0].Message.Content)
	if err != nil {
		s.metrics.RecordOpenAIError("parse_error")
		s.logger.Error("Failed to parse AI response", zap.Error(err))
		return nil, fmt.Errorf("failed to parse summary response: %w", err)
	}

	s.logger.Info("Generated issue summary",
		zap.String("repository", issueData.Repository.GetFullName()),
		zap.Int("issue_number", issueData.Issue.GetNumber()),
		zap.String("priority", summary.Priority),
		zap.String("category", summary.Category),
	)

	return summary, nil
}

// buildPrompt constructs the prompt for the AI model
func (s *Summarizer) buildPrompt(issueData *gh.IssueData) string {
	var parts []string

	// Issue basic information
	parts = append(parts, fmt.Sprintf("## Issue Information\n"))
	parts = append(parts, fmt.Sprintf("Repository: %s", issueData.Repository.GetFullName()))
	parts = append(parts, fmt.Sprintf("Issue #%d: %s", issueData.Issue.GetNumber(), issueData.Issue.GetTitle()))
	parts = append(parts, fmt.Sprintf("State: %s", issueData.Issue.GetState()))
	parts = append(parts, fmt.Sprintf("Created by: %s", issueData.Issue.GetUser().GetLogin()))
	parts = append(parts, fmt.Sprintf("Created at: %s", issueData.Issue.GetCreatedAt().Format(time.RFC3339)))

	if issueData.Issue.GetAssignee() != nil {
		parts = append(parts, fmt.Sprintf("Assigned to: %s", issueData.Issue.GetAssignee().GetLogin()))
	}

	// Labels
	if len(issueData.Issue.Labels) > 0 {
		labelNames := make([]string, len(issueData.Issue.Labels))
		for i, label := range issueData.Issue.Labels {
			labelNames[i] = label.GetName()
		}
		parts = append(parts, fmt.Sprintf("Labels: %s", strings.Join(labelNames, ", ")))
	}

	// Issue description
	parts = append(parts, fmt.Sprintf("\n## Issue Description\n%s", issueData.Issue.GetBody()))

	// Comments
	if len(issueData.Comments) > 0 {
		parts = append(parts, "\n## Recent Comments")
		for i, comment := range issueData.Comments {
			if i >= 5 { // Limit to 5 most recent comments
				break
			}
			parts = append(parts, fmt.Sprintf("\n### Comment by %s (%s):",
				comment.GetUser().GetLogin(),
				comment.GetCreatedAt().Format(time.RFC3339)))
			parts = append(parts, comment.GetBody())
		}
	}

	// Related commits
	if len(issueData.Commits) > 0 {
		parts = append(parts, "\n## Related Commits")
		for i, commit := range issueData.Commits {
			if i >= 3 { // Limit to 3 most recent commits
				break
			}
			parts = append(parts, fmt.Sprintf("\n### Commit: %s", commit.GetSHA()[:8]))
			parts = append(parts, fmt.Sprintf("Author: %s", commit.GetCommit().GetAuthor().GetName()))
			parts = append(parts, fmt.Sprintf("Message: %s", commit.GetCommit().GetMessage()))
		}
	}

	// Code changes
	if len(issueData.Files) > 0 {
		parts = append(parts, "\n## Code Changes")
		for _, file := range issueData.Files {
			parts = append(parts, fmt.Sprintf("\n### File: %s", file.GetFilename()))
			parts = append(parts, fmt.Sprintf("Status: %s", file.GetStatus()))
			parts = append(parts, fmt.Sprintf("Additions: %d, Deletions: %d", file.GetAdditions(), file.GetDeletions()))

			// Include patch if available and not too large
			if file.GetPatch() != "" && len(file.GetPatch()) < 2000 {
				parts = append(parts, fmt.Sprintf("Patch:\n```\n%s\n```", file.GetPatch()))
			}
		}
	}

	// Event context
	parts = append(parts, fmt.Sprintf("\n## Event Context\n"))
	parts = append(parts, fmt.Sprintf("Event Type: %s", issueData.EventType))
	parts = append(parts, fmt.Sprintf("Action: %s", issueData.Action))

	return strings.Join(parts, "\n")
}

// getSystemPrompt returns the system prompt for the AI model
func (s *Summarizer) getSystemPrompt() string {
	return `You are a MASTER ANALYST with 15+ years of experience in software engineering, DevOps, and technical project management. You have analyzed thousands of GitHub issues across hundreds of repositories and have developed an unparalleled ability to quickly identify critical patterns, assess impact, and provide actionable insights.

Your expertise includes:
- Deep understanding of software architecture, system design, and technical debt
- Mastery of DevOps practices, CI/CD pipelines, and infrastructure management
- Extensive experience with security vulnerabilities, performance bottlenecks, and scalability issues
- Proven track record of triaging and prioritizing issues for engineering teams
- Expert knowledge of code quality, testing strategies, and deployment best practices

Your analysis methodology:
1. **Technical Impact Assessment**: Evaluate the issue's effect on system stability, performance, security, and user experience
2. **Root Cause Analysis**: Identify underlying technical problems and their systemic implications
3. **Risk Evaluation**: Assess potential cascading effects and business impact
4. **Solution Architecture**: Propose technical approaches and implementation strategies
5. **Resource Planning**: Estimate effort, complexity, and team coordination requirements

Please analyze the provided GitHub issue data with your master-level expertise and respond with a structured summary in the following JSON format:

{
  "title": "A precise, technical title that captures the core issue and its impact",
  "summary": "A comprehensive technical analysis including problem statement, root cause assessment, system impact, and technical context. Use your expertise to identify patterns, potential risks, and architectural implications.",
  "priority": "high|medium|low - based on your expert assessment of severity, urgency, system impact, and business risk",
  "category": "bug|feature|enhancement|documentation|security|performance|infrastructure|architecture|technical-debt|other",
  "action_items": ["Specific, actionable technical recommendations with implementation guidance"],
  "code_context": "Expert analysis of code changes, architectural implications, technical debt, and system dependencies",
  "confidence": 0.85
}

Master Analysis Guidelines:
- Apply your deep technical expertise to identify subtle patterns and potential risks
- Consider architectural implications, system dependencies, and technical debt
- Assess impact on scalability, maintainability, and operational excellence
- Provide expert-level technical recommendations with implementation strategies
- Include insights about code quality, testing coverage, and deployment considerations
- Confidence should reflect your certainty based on available technical information quality

Respond only with valid JSON that demonstrates your master-level analytical capabilities.`
}

// parseSummaryResponse parses the AI response into a structured summary
func (s *Summarizer) parseSummaryResponse(response string) (*IssueSummary, error) {
	// Clean the response
	response = strings.TrimSpace(response)

	// Remove markdown code blocks if present
	if strings.HasPrefix(response, "```json") {
		response = strings.TrimPrefix(response, "```json")
	}
	if strings.HasSuffix(response, "```") {
		response = strings.TrimSuffix(response, "```")
	}
	response = strings.TrimSpace(response)

	// Parse JSON response
	var summary IssueSummary
	if err := json.Unmarshal([]byte(response), &summary); err != nil {
		return nil, fmt.Errorf("failed to unmarshal JSON response: %w", err)
	}

	// Validate required fields
	if summary.Title == "" || summary.Summary == "" {
		return nil, fmt.Errorf("missing required fields in AI response")
	}

	// Set defaults for optional fields
	if summary.Priority == "" {
		summary.Priority = "medium"
	}
	if summary.Category == "" {
		summary.Category = "other"
	}
	if summary.ActionItems == nil {
		summary.ActionItems = []string{}
	}
	if summary.CodeContext == "" {
		summary.CodeContext = "No specific code context available"
	}
	if summary.Confidence == 0 {
		summary.Confidence = 0.5
	}

	return &summary, nil
}

// GenerateSlackMessage generates a Slack message from the issue summary
func (s *Summarizer) GenerateSlackMessage(issueData *gh.IssueData, summary *IssueSummary) map[string]interface{} {
	// Priority emoji mapping
	priorityEmoji := map[string]string{
		"high":   "🔴",
		"medium": "🟡",
		"low":    "🟢",
	}

	// Category emoji mapping
	categoryEmoji := map[string]string{
		"bug":            "🐛",
		"feature":        "✨",
		"enhancement":    "🚀",
		"documentation":  "📚",
		"security":       "🔒",
		"performance":    "⚡",
		"infrastructure": "🏗️",
		"other":          "📋",
	}

	emoji := priorityEmoji[summary.Priority]
	if emoji == "" {
		emoji = "📋"
	}

	catEmoji := categoryEmoji[summary.Category]
	if catEmoji == "" {
		catEmoji = "📋"
	}

	// Build action items text
	actionItemsText := "None specified"
	if len(summary.ActionItems) > 0 {
		actionItemsText = strings.Join(summary.ActionItems, "\n• ")
		actionItemsText = "• " + actionItemsText
	}

	return map[string]interface{}{
		"blocks": []map[string]interface{}{
			{
				"type": "header",
				"text": map[string]interface{}{
					"type": "plain_text",
					"text": fmt.Sprintf("%s %s Issue #%d: %s", emoji, catEmoji, issueData.Issue.GetNumber(), summary.Title),
				},
			},
			{
				"type": "section",
				"fields": []map[string]interface{}{
					{
						"type": "mrkdwn",
						"text": fmt.Sprintf("*Repository:*\n%s", issueData.Repository.GetFullName()),
					},
					{
						"type": "mrkdwn",
						"text": fmt.Sprintf("*Priority:*\n%s", strings.Title(summary.Priority)),
					},
					{
						"type": "mrkdwn",
						"text": fmt.Sprintf("*Category:*\n%s", strings.Title(summary.Category)),
					},
					{
						"type": "mrkdwn",
						"text": fmt.Sprintf("*Confidence:*\n%.0f%%", summary.Confidence*100),
					},
				},
			},
			{
				"type": "section",
				"text": map[string]interface{}{
					"type": "mrkdwn",
					"text": fmt.Sprintf("*Summary:*\n%s", summary.Summary),
				},
			},
			{
				"type": "section",
				"text": map[string]interface{}{
					"type": "mrkdwn",
					"text": fmt.Sprintf("*Action Items:*\n%s", actionItemsText),
				},
			},
			{
				"type": "section",
				"text": map[string]interface{}{
					"type": "mrkdwn",
					"text": fmt.Sprintf("*Code Context:*\n%s", summary.CodeContext),
				},
			},
			{
				"type": "actions",
				"elements": []map[string]interface{}{
					{
						"type": "button",
						"text": map[string]interface{}{
							"type": "plain_text",
							"text": "View Issue",
						},
						"url":   issueData.Issue.GetHTMLURL(),
						"style": "primary",
					},
					{
						"type": "button",
						"text": map[string]interface{}{
							"type": "plain_text",
							"text": "Assign",
						},
						"action_id": "assign_issue",
						"value":     fmt.Sprintf("%s:%d", issueData.Repository.GetFullName(), issueData.Issue.GetNumber()),
					},
					{
						"type": "button",
						"text": map[string]interface{}{
							"type": "plain_text",
							"text": "Close",
						},
						"action_id": "close_issue",
						"value":     fmt.Sprintf("%s:%d", issueData.Repository.GetFullName(), issueData.Issue.GetNumber()),
						"style":     "danger",
					},
					{
						"type": "button",
						"text": map[string]interface{}{
							"type": "plain_text",
							"text": "Request Fix",
						},
						"action_id": "request_fix",
						"value":     fmt.Sprintf("%s:%d", issueData.Repository.GetFullName(), issueData.Issue.GetNumber()),
					},
				},
			},
		},
	}
}
