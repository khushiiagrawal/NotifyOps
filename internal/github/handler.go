package github

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/google/go-github/v57/github"
	"go.uber.org/zap"
)

// IssueData contains all the data needed for AI summarization
type IssueData struct {
	Issue      *github.Issue
	Comments   []*github.IssueComment
	Commits    []*github.RepositoryCommit
	Files      []*github.CommitFile
	Repository *github.Repository
	EventType  string
	Action     string
}

// Handler handles GitHub webhook events
type Handler struct {
	client         *github.Client
	webhookSecret  string
	logger         *zap.Logger
	metrics        MetricsRecorder
	issueProcessor IssueProcessor
}

// MetricsRecorder interface for recording metrics
type MetricsRecorder interface {
	RecordGitHubWebhook(eventType, action, status string, duration time.Duration)
	RecordGitHubAPIError(operation, errorType string)
}

// IssueProcessor interface for processing issue data
type IssueProcessor interface {
	ProcessIssue(issueData *IssueData)
}

// NewHandler creates a new GitHub handler
func NewHandler(accessToken, webhookSecret string, logger *zap.Logger, metrics MetricsRecorder) *Handler {
	client := github.NewClient(nil).WithAuthToken(accessToken)

	return &Handler{
		client:         client,
		webhookSecret:  webhookSecret,
		logger:         logger,
		metrics:        metrics,
		issueProcessor: nil,
	}
}

// HandleWebhook processes incoming GitHub webhook events
func (h *Handler) HandleWebhook(w http.ResponseWriter, r *http.Request) {
	start := time.Now()

	// Read the request body
	body, err := io.ReadAll(r.Body)
	if err != nil {
		h.logger.Error("Failed to read request body", zap.Error(err))
		http.Error(w, "Failed to read request body", http.StatusBadRequest)
		return
	}

	// Verify webhook signature
	if !h.verifySignature(body, r.Header.Get("X-Hub-Signature-256")) {
		h.logger.Error("Invalid webhook signature")
		http.Error(w, "Invalid signature", http.StatusUnauthorized)
		return
	}

	// Parse the webhook event
	eventType := r.Header.Get("X-GitHub-Event")
	deliveryID := r.Header.Get("X-GitHub-Delivery")

	h.logger.Info("Received GitHub webhook",
		zap.String("event_type", eventType),
		zap.String("delivery_id", deliveryID),
	)

	// Handle different event types
	var issueData *IssueData
	var status string

	switch eventType {
	case "issues":
		issueData, status, err = h.handleIssuesEvent(body)
	case "issue_comment":
		issueData, status, err = h.handleIssueCommentEvent(body)
	default:
		h.logger.Info("Unsupported event type", zap.String("event_type", eventType))
		w.WriteHeader(http.StatusOK)
		return
	}

	if err != nil {
		h.logger.Error("Failed to process webhook",
			zap.String("event_type", eventType),
			zap.Error(err))
		status = "error"
		http.Error(w, "Failed to process webhook", http.StatusInternalServerError)
	} else {
		w.WriteHeader(http.StatusOK)
	}

	// Record metrics
	duration := time.Since(start)
	h.metrics.RecordGitHubWebhook(eventType, issueData.Action, status, duration)

	// If we have issue data, process it further
	if issueData != nil && err == nil {
		go h.processIssueData(issueData)
	}
}

// SetIssueProcessor sets the issue processor
func (h *Handler) SetIssueProcessor(processor IssueProcessor) {
	h.issueProcessor = processor
}

// handleIssuesEvent processes GitHub issues events
func (h *Handler) handleIssuesEvent(body []byte) (*IssueData, string, error) {
	var event github.IssuesEvent
	if err := json.Unmarshal(body, &event); err != nil {
		return nil, "error", fmt.Errorf("failed to unmarshal issues event: %w", err)
	}

	// Only process certain actions
	if event.Action == nil || !h.shouldProcessAction(*event.Action) {
		return nil, "skipped", nil
	}

	issueData, err := h.enrichIssueData(context.Background(), event.GetIssue(), *event.Action, "issues")
	if err != nil {
		return nil, "error", err
	}

	return issueData, "success", nil
}

// handleIssueCommentEvent processes GitHub issue comment events
func (h *Handler) handleIssueCommentEvent(body []byte) (*IssueData, string, error) {
	var event github.IssueCommentEvent
	if err := json.Unmarshal(body, &event); err != nil {
		return nil, "error", fmt.Errorf("failed to unmarshal issue comment event: %w", err)
	}

	// Only process certain actions
	if event.Action == nil || !h.shouldProcessAction(*event.Action) {
		return nil, "skipped", nil
	}

	issueData, err := h.enrichIssueData(context.Background(), event.GetIssue(), *event.Action, "issue_comment")
	if err != nil {
		return nil, "error", err
	}

	return issueData, "success", nil
}

// shouldProcessAction determines if we should process a specific action
func (h *Handler) shouldProcessAction(action string) bool {
	processableActions := []string{
		"opened", "edited", "reopened", "closed", "created", "updated",
	}

	for _, a := range processableActions {
		if action == a {
			return true
		}
	}
	return false
}

// enrichIssueData fetches additional data for an issue
func (h *Handler) enrichIssueData(ctx context.Context, issue *github.Issue, action, eventType string) (*IssueData, error) {
	if issue == nil {
		return nil, fmt.Errorf("issue is nil")
	}

	// Extract repository information
	repoOwner := issue.GetRepository().GetOwner().GetLogin()
	repoName := issue.GetRepository().GetName()

	// Fetch comments
	comments, err := h.fetchIssueComments(ctx, repoOwner, repoName, issue.GetNumber())
	if err != nil {
		h.metrics.RecordGitHubAPIError("fetch_comments", "api_error")
		h.logger.Error("Failed to fetch issue comments", zap.Error(err))
		// Continue without comments
	}

	// Fetch related commits
	commits, err := h.fetchRelatedCommits(ctx, repoOwner, repoName, issue.GetNumber())
	if err != nil {
		h.metrics.RecordGitHubAPIError("fetch_commits", "api_error")
		h.logger.Error("Failed to fetch related commits", zap.Error(err))
		// Continue without commits
	}

	// Fetch commit files
	var files []*github.CommitFile
	if len(commits) > 0 {
		files, err = h.fetchCommitFiles(ctx, repoOwner, repoName, commits[0].GetSHA())
		if err != nil {
			h.metrics.RecordGitHubAPIError("fetch_files", "api_error")
			h.logger.Error("Failed to fetch commit files", zap.Error(err))
			// Continue without files
		}
	}

	return &IssueData{
		Issue:      issue,
		Comments:   comments,
		Commits:    commits,
		Files:      files,
		Repository: issue.GetRepository(),
		EventType:  eventType,
		Action:     action,
	}, nil
}

// fetchIssueComments fetches comments for an issue
func (h *Handler) fetchIssueComments(ctx context.Context, owner, repo string, issueNumber int) ([]*github.IssueComment, error) {
	comments, _, err := h.client.Issues.ListComments(ctx, owner, repo, issueNumber, &github.IssueListCommentsOptions{
		ListOptions: github.ListOptions{PerPage: 100},
	})
	return comments, err
}

// fetchRelatedCommits fetches commits related to an issue
func (h *Handler) fetchRelatedCommits(ctx context.Context, owner, repo string, issueNumber int) ([]*github.RepositoryCommit, error) {
	// Search for commits that reference this issue
	query := fmt.Sprintf("repo:%s/%s issue:%d", owner, repo, issueNumber)
	commits, _, err := h.client.Search.Commits(ctx, query, &github.SearchOptions{
		ListOptions: github.ListOptions{PerPage: 10},
	})
	if err != nil {
		return nil, err
	}

	// Convert search results to repository commits
	var repoCommits []*github.RepositoryCommit
	for _, commit := range commits.Commits {
		repoCommit, _, err := h.client.Repositories.GetCommit(ctx, owner, repo, commit.GetSHA(), nil)
		if err != nil {
			continue // Skip commits we can't fetch
		}
		repoCommits = append(repoCommits, repoCommit)
	}

	return repoCommits, nil
}

// fetchCommitFiles fetches files changed in a commit
func (h *Handler) fetchCommitFiles(ctx context.Context, owner, repo, sha string) ([]*github.CommitFile, error) {
	commit, _, err := h.client.Repositories.GetCommit(ctx, owner, repo, sha, nil)
	if err != nil {
		return nil, err
	}
	return commit.Files, nil
}

// verifySignature verifies the GitHub webhook signature
func (h *Handler) verifySignature(payload []byte, signature string) bool {
	if h.webhookSecret == "" {
		return true // Skip verification if no secret is configured
	}

	if !strings.HasPrefix(signature, "sha256=") {
		return false
	}

	expectedSignature := signature[7:] // Remove "sha256=" prefix

	// Create HMAC
	mac := hmac.New(sha256.New, []byte(h.webhookSecret))
	mac.Write(payload)
	actualSignature := hex.EncodeToString(mac.Sum(nil))

	return hmac.Equal([]byte(actualSignature), []byte(expectedSignature))
}

// processIssueData processes the enriched issue data
func (h *Handler) processIssueData(issueData *IssueData) {
	if h.issueProcessor != nil {
		h.issueProcessor.ProcessIssue(issueData)
	} else {
		h.logger.Info("Issue data ready for processing (no processor set)",
			zap.String("repository", issueData.Repository.GetFullName()),
			zap.Int("issue_number", issueData.Issue.GetNumber()),
			zap.String("action", issueData.Action),
			zap.Int("comments_count", len(issueData.Comments)),
			zap.Int("commits_count", len(issueData.Commits)),
		)
	}
}
