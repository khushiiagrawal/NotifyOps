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
	style     PromptStyle
}

// PromptStyle defines the AI's analysis style and personality
type PromptStyle struct {
	Personality   string            // The AI's role/personality
	AnalysisFocus string            // What aspects to focus on
	Tone          string            // Communication tone
	DetailLevel   string            // How detailed the analysis should be
	CustomFields  map[string]string // Additional custom fields
}

// MetricsRecorder interface for recording metrics
type MetricsRecorder interface {
	RecordOpenAIRequest(model, status string, duration time.Duration)
	RecordOpenAITokens(model, tokenType string, count int)
	RecordOpenAIError(errorType string)
}

// IssueSummary contains the AI-generated summary
type IssueSummary struct {
	Title        string
	Summary      string
	Priority     string
	Category     string
	ActionItems  []string
	CodeContext  string
	Confidence   float64
	SuggestedFix string `json:"suggested_fix"`
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
		style:     DefaultPromptStyle(),
	}
}

// NewSummarizerWithStyle creates a new AI summarizer with custom prompt style
func NewSummarizerWithStyle(apiKey, model string, maxTokens int, temp float32, logger *zap.Logger, metrics MetricsRecorder, style PromptStyle) *Summarizer {
	client := openai.NewClient(apiKey)

	return &Summarizer{
		client:    client,
		model:     model,
		maxTokens: maxTokens,
		temp:      temp,
		logger:    logger,
		metrics:   metrics,
		style:     style,
	}
}

// DefaultPromptStyle returns the default prompt style
func DefaultPromptStyle() PromptStyle {
	return PromptStyle{
		Personality:   "MASTER ANALYST",
		AnalysisFocus: "technical_impact",
		Tone:          "professional",
		DetailLevel:   "comprehensive",
		CustomFields:  make(map[string]string),
	}
}

// SetPromptStyle updates the prompt style
func (s *Summarizer) SetPromptStyle(style PromptStyle) {
	s.style = style
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
	return s.buildSystemPrompt()
}

// buildSystemPrompt builds the system prompt based on the current style
func (s *Summarizer) buildSystemPrompt() string {
	personality := s.getPersonalityPrompt()
	analysisFocus := s.getAnalysisFocusPrompt()
	tone := s.getTonePrompt()
	detailLevel := s.getDetailLevelPrompt()
	customFields := s.getCustomFieldsPrompt()

	return fmt.Sprintf(`%s

%s

%s

%s

%s

Please analyze the provided GitHub issue data and respond with a structured summary in the following JSON format:

{
  "title": "%s",
  "summary": "%s",
  "priority": "high|medium|low - based on your assessment of severity, urgency, and impact",
  "category": "bug|feature|enhancement|documentation|security|performance|infrastructure|architecture|technical-debt|other",
  "action_items": ["Specific, actionable recommendations with implementation guidance"],
  "code_context": "%s",
  "suggested_fix": "A practical, copy-paste-ready code snippet or clear step-by-step fix instructions for resolving the issue.",
  "confidence": 0.85
}

Analysis Guidelines:
%s

In addition to your analysis, always provide a 'suggested_fix' field with a practical, copy-paste-ready code snippet or clear step-by-step instructions for resolving the issue. If a code fix is not possible, provide the most actionable next steps. Respond only with valid JSON that demonstrates your analytical capabilities.`,
		personality,
		analysisFocus,
		tone,
		detailLevel,
		customFields,
		s.getTitlePrompt(),
		s.getSummaryPrompt(),
		s.getCodeContextPrompt(),
		s.getGuidelinesPrompt())
}

// getPersonalityPrompt returns the personality prompt based on style
func (s *Summarizer) getPersonalityPrompt() string {
	switch s.style.Personality {
	case "MASTER ANALYST":
		return `You are a MASTER ANALYST with 15+ years of experience in software engineering, DevOps, and technical project management. You have analyzed thousands of GitHub issues across hundreds of repositories and have developed an unparalleled ability to quickly identify critical patterns, assess impact, and provide actionable insights.

Your expertise includes:
- Deep understanding of software architecture, system design, and technical debt
- Mastery of DevOps practices, CI/CD pipelines, and infrastructure management
- Extensive experience with security vulnerabilities, performance bottlenecks, and scalability issues
- Proven track record of triaging and prioritizing issues for engineering teams
- Expert knowledge of code quality, testing strategies, and deployment best practices`

	case "SENIOR DEVELOPER":
		return `You are a SENIOR DEVELOPER with 8+ years of experience in software development. You have a deep understanding of code quality, best practices, and practical implementation strategies. You focus on writing clean, maintainable code and solving real-world development challenges.

Your expertise includes:
- Strong programming fundamentals and design patterns
- Experience with multiple programming languages and frameworks
- Understanding of code review processes and quality standards
- Knowledge of testing strategies and debugging techniques
- Practical experience with version control and collaboration workflows`

	case "DEVOPS ENGINEER":
		return `You are a DEVOPS ENGINEER with 10+ years of experience in infrastructure, automation, and operational excellence. You understand the full software delivery pipeline and focus on reliability, scalability, and operational efficiency.

Your expertise includes:
- Infrastructure as Code and cloud platforms
- CI/CD pipeline design and optimization
- Monitoring, logging, and observability
- Security best practices and compliance
- Performance optimization and capacity planning`

	case "PRODUCT MANAGER":
		return `You are a PRODUCT MANAGER with 7+ years of experience in product development and user experience. You focus on business value, user needs, and strategic impact of technical decisions.

Your expertise includes:
- User experience and customer journey mapping
- Business impact analysis and ROI assessment
- Feature prioritization and roadmap planning
- Stakeholder communication and requirement gathering
- Market analysis and competitive positioning`

	case "SECURITY EXPERT":
		return `You are a SECURITY EXPERT with 12+ years of experience in cybersecurity and secure software development. You have a deep understanding of security vulnerabilities, threat modeling, and secure coding practices.

Your expertise includes:
- Security vulnerability assessment and remediation
- Threat modeling and risk analysis
- Secure coding practices and code review
- Compliance frameworks and security standards
- Incident response and security monitoring`

	default:
		return `You are an experienced software professional with deep knowledge of software development, DevOps practices, and technical project management. You have analyzed numerous GitHub issues and can provide valuable insights and recommendations.`
	}
}

// getAnalysisFocusPrompt returns the analysis focus prompt
func (s *Summarizer) getAnalysisFocusPrompt() string {
	switch s.style.AnalysisFocus {
	case "technical_impact":
		return `Your analysis methodology focuses on technical impact:
1. **Technical Impact Assessment**: Evaluate the issue's effect on system stability, performance, security, and user experience
2. **Root Cause Analysis**: Identify underlying technical problems and their systemic implications
3. **Risk Evaluation**: Assess potential cascading effects and business impact
4. **Solution Architecture**: Propose technical approaches and implementation strategies
5. **Resource Planning**: Estimate effort, complexity, and team coordination requirements`

	case "business_value":
		return `Your analysis methodology focuses on business value:
1. **Business Impact Assessment**: Evaluate the issue's effect on user experience, revenue, and business operations
2. **ROI Analysis**: Assess the cost-benefit ratio of addressing the issue
3. **User Impact**: Consider how the issue affects end users and customer satisfaction
4. **Strategic Alignment**: Evaluate alignment with business goals and priorities
5. **Resource Allocation**: Consider team capacity and competing priorities`

	case "security_focus":
		return `Your analysis methodology focuses on security implications:
1. **Security Risk Assessment**: Evaluate potential security vulnerabilities and attack vectors
2. **Compliance Impact**: Consider regulatory and compliance implications
3. **Data Protection**: Assess impact on data privacy and protection
4. **Threat Modeling**: Identify potential threats and mitigation strategies
5. **Security Best Practices**: Recommend secure implementation approaches`

	case "performance_optimization":
		return `Your analysis methodology focuses on performance optimization:
1. **Performance Impact Assessment**: Evaluate the issue's effect on system performance
2. **Scalability Analysis**: Consider impact on system scalability and capacity
3. **Resource Utilization**: Assess CPU, memory, and network usage implications
4. **Optimization Opportunities**: Identify performance improvement strategies
5. **Monitoring and Metrics**: Recommend performance monitoring approaches`

	default:
		return `Your analysis methodology:
1. **Impact Assessment**: Evaluate the issue's effect on the system and users
2. **Root Cause Analysis**: Identify underlying problems and implications
3. **Risk Evaluation**: Assess potential effects and business impact
4. **Solution Planning**: Propose approaches and implementation strategies
5. **Resource Planning**: Estimate effort and coordination requirements`
	}
}

// getTonePrompt returns the tone prompt
func (s *Summarizer) getTonePrompt() string {
	switch s.style.Tone {
	case "professional":
		return `Communication Style: Professional and formal. Use technical terminology appropriately and maintain a business-like tone. Focus on facts, data, and objective analysis.`

	case "friendly":
		return `Communication Style: Friendly and approachable. Use clear, conversational language while maintaining technical accuracy. Be encouraging and supportive in your recommendations.`

	case "concise":
		return `Communication Style: Concise and direct. Get to the point quickly and avoid unnecessary details. Focus on key insights and actionable recommendations.`

	case "educational":
		return `Communication Style: Educational and explanatory. Provide context and explanations for technical concepts. Help readers understand the "why" behind recommendations.`

	case "urgent":
		return `Communication Style: Urgent and action-oriented. Emphasize time sensitivity and immediate action requirements. Use strong, decisive language for critical issues.`

	default:
		return `Communication Style: Clear and professional. Use appropriate technical language and maintain a balanced tone.`
	}
}

// getDetailLevelPrompt returns the detail level prompt
func (s *Summarizer) getDetailLevelPrompt() string {
	switch s.style.DetailLevel {
	case "comprehensive":
		return `Detail Level: Provide comprehensive analysis with thorough explanations. Include background context, detailed reasoning, and extensive recommendations.`

	case "moderate":
		return `Detail Level: Provide balanced analysis with sufficient detail. Include key context and practical recommendations without being overly verbose.`

	case "concise":
		return `Detail Level: Provide concise analysis focusing on essential points. Keep explanations brief but informative.`

	case "executive":
		return `Detail Level: Provide high-level analysis suitable for executive review. Focus on business impact and strategic implications.`

	default:
		return `Detail Level: Provide appropriate level of detail based on the complexity and importance of the issue.`
	}
}

// getCustomFieldsPrompt returns custom fields prompt
func (s *Summarizer) getCustomFieldsPrompt() string {
	if len(s.style.CustomFields) == 0 {
		return ""
	}

	var fields []string
	for key, value := range s.style.CustomFields {
		fields = append(fields, fmt.Sprintf("- %s: %s", key, value))
	}

	return fmt.Sprintf("Additional Context:\n%s", strings.Join(fields, "\n"))
}

// getTitlePrompt returns the title prompt
func (s *Summarizer) getTitlePrompt() string {
	switch s.style.Personality {
	case "PRODUCT MANAGER":
		return "A clear, business-focused title that captures the user impact and business value"
	case "SECURITY EXPERT":
		return "A security-focused title that highlights the security implications and risk level"
	case "DEVOPS ENGINEER":
		return "An operational title that captures the infrastructure and deployment impact"
	default:
		return "A precise, technical title that captures the core issue and its impact"
	}
}

// getSummaryPrompt returns the summary prompt
func (s *Summarizer) getSummaryPrompt() string {
	switch s.style.Personality {
	case "PRODUCT MANAGER":
		return "A business-focused analysis including user impact, business value, and strategic implications"
	case "SECURITY EXPERT":
		return "A security-focused analysis including vulnerability assessment, risk analysis, and security implications"
	case "DEVOPS ENGINEER":
		return "An operational analysis including infrastructure impact, deployment considerations, and operational implications"
	default:
		return "A comprehensive technical analysis including problem statement, root cause assessment, system impact, and technical context"
	}
}

// getCodeContextPrompt returns the code context prompt
func (s *Summarizer) getCodeContextPrompt() string {
	switch s.style.Personality {
	case "SENIOR DEVELOPER":
		return "Detailed analysis of code quality, patterns, and implementation considerations"
	case "SECURITY EXPERT":
		return "Security analysis of code changes, vulnerability assessment, and secure coding recommendations"
	case "DEVOPS ENGINEER":
		return "Operational analysis of deployment implications, infrastructure changes, and monitoring considerations"
	default:
		return "Expert analysis of code changes, architectural implications, technical debt, and system dependencies"
	}
}

// getGuidelinesPrompt returns the guidelines prompt
func (s *Summarizer) getGuidelinesPrompt() string {
	switch s.style.Personality {
	case "MASTER ANALYST":
		return `- Apply your deep technical expertise to identify subtle patterns and potential risks
- Consider architectural implications, system dependencies, and technical debt
- Assess impact on scalability, maintainability, and operational excellence
- Provide expert-level technical recommendations with implementation strategies
- Include insights about code quality, testing coverage, and deployment considerations
- Confidence should reflect your certainty based on available technical information quality`

	case "SENIOR DEVELOPER":
		return `- Focus on code quality, maintainability, and best practices
- Consider implementation complexity and development effort
- Assess impact on existing codebase and technical debt
- Provide practical coding recommendations and examples
- Include testing strategies and debugging considerations
- Consider team collaboration and code review implications`

	case "DEVOPS ENGINEER":
		return `- Focus on operational impact, reliability, and scalability
- Consider deployment complexity and infrastructure requirements
- Assess impact on monitoring, logging, and observability
- Provide operational recommendations and automation strategies
- Include security and compliance considerations
- Consider disaster recovery and backup implications`

	case "PRODUCT MANAGER":
		return `- Focus on user experience and business value
- Consider market impact and competitive positioning
- Assess impact on product roadmap and feature priorities
- Provide strategic recommendations and business insights
- Include user feedback and stakeholder considerations
- Consider resource allocation and timeline implications`

	case "SECURITY EXPERT":
		return `- Focus on security vulnerabilities and threat assessment
- Consider compliance requirements and regulatory impact
- Assess impact on data protection and privacy
- Provide security recommendations and mitigation strategies
- Include incident response and monitoring considerations
- Consider security testing and validation requirements`

	default:
		return `- Apply your expertise to identify key patterns and potential issues
- Consider the broader impact and implications
- Assess risks and provide actionable recommendations
- Include relevant context and background information
- Confidence should reflect your certainty based on available information`
	}
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
	if summary.SuggestedFix == "" {
		summary.SuggestedFix = "No fix suggestion provided."
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

	// Safely get repository name
	repoName := "Unknown Repository"
	if issueData.Repository != nil {
		repoName = issueData.Repository.GetFullName()
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
						"text": fmt.Sprintf("*Repository:*\n%s", repoName),
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
							"text": "Review Issue",
						},
						"action_id": "review_issue",
						"value":     fmt.Sprintf("%s:%d", repoName, issueData.Issue.GetNumber()),
						"style":     "primary",
						"url":       issueData.Issue.GetHTMLURL(),
					},
					{
						"type": "button",
						"text": map[string]interface{}{
							"type": "plain_text",
							"text": "Suggest Fix",
						},
						"action_id": "suggest_fix",
						"value":     fmt.Sprintf("%s:%d", repoName, issueData.Issue.GetNumber()),
						"style":     "primary",
					},
				},
			},
		},
	}
}
