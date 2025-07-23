package github

import (
	"bytes"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/google/go-github/v57/github"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"go.uber.org/zap"
)

// MockMetricsRecorder is a mock implementation of MetricsRecorder
type MockMetricsRecorder struct {
	mock.Mock
}

func (m *MockMetricsRecorder) RecordGitHubWebhook(eventType, action, status string, duration time.Duration) {
	m.Called(eventType, action, status, duration)
}

func (m *MockMetricsRecorder) RecordGitHubAPIError(operation, errorType string) {
	m.Called(operation, errorType)
}

// generateSignature generates a valid GitHub webhook signature
func generateSignature(secret string, payload []byte) string {
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write(payload)
	expectedMAC := mac.Sum(nil)
	return "sha256=" + hex.EncodeToString(expectedMAC)
}

// TestHandleWebhook tests the webhook handler
func TestHandleWebhook(t *testing.T) {
	// Create a test logger
	logger, _ := zap.NewDevelopment()
	defer logger.Sync()

	// Create mock metrics
	mockMetrics := &MockMetricsRecorder{}

	// Create a mock GitHub client
	mockClient := github.NewClient(nil)

	// Create handler
	handler := &Handler{
		client:         mockClient,
		webhookSecret:  "test-secret",
		logger:         logger,
		metrics:        mockMetrics,
		issueProcessor: nil,
	}

	// Test cases
	tests := []struct {
		name           string
		eventType      string
		payload        interface{}
		expectedStatus int
	}{
		{
			name:      "Valid issues event",
			eventType: "issues",
			payload: github.IssuesEvent{
				Action: github.String("opened"),
				Issue: &github.Issue{
					Number: github.Int(123),
					Title:  github.String("Test Issue"),
					Repository: &github.Repository{
						FullName: github.String("test/repo"),
						Owner: &github.User{
							Login: github.String("test"),
						},
						Name: github.String("repo"),
					},
				},
			},
			expectedStatus: http.StatusOK,
		},
		{
			name:           "Unsupported event type",
			eventType:      "push",
			payload:        map[string]interface{}{},
			expectedStatus: http.StatusOK,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Reset mock for each test case
			mockMetrics = &MockMetricsRecorder{}
			handler.metrics = mockMetrics

			// Create request payload
			payload, _ := json.Marshal(tt.payload)

			// Create request
			req := httptest.NewRequest("POST", "/webhook/github", bytes.NewBuffer(payload))
			req.Header.Set("X-GitHub-Event", tt.eventType)
			req.Header.Set("X-Hub-Signature-256", generateSignature("test-secret", payload))

			// Create response recorder
			w := httptest.NewRecorder()

			// Set up mock expectations based on event type
			if tt.eventType == "issues" {
				mockMetrics.On("RecordGitHubWebhook", tt.eventType, mock.Anything, mock.Anything, mock.Anything).Return()
				mockMetrics.On("RecordGitHubAPIError", "fetch_comments", "api_error").Return()
				mockMetrics.On("RecordGitHubAPIError", "fetch_commits", "api_error").Return()
			}
			// For unsupported events, no metrics are recorded since handler returns early

			// Call handler
			handler.HandleWebhook(w, req)

			// Assert response
			assert.Equal(t, tt.expectedStatus, w.Code)

			// Verify mock calls
			mockMetrics.AssertExpectations(t)
		})
	}
}

// TestShouldProcessAction tests the action filtering logic
func TestShouldProcessAction(t *testing.T) {
	handler := &Handler{}

	tests := []struct {
		action        string
		shouldProcess bool
	}{
		{"opened", true},
		{"edited", true},
		{"reopened", true},
		{"closed", true},
		{"created", true},
		{"updated", true},
		{"deleted", false},
		{"assigned", false},
		{"unassigned", false},
		{"labeled", false},
		{"unlabeled", false},
	}

	for _, tt := range tests {
		t.Run(tt.action, func(t *testing.T) {
			result := handler.shouldProcessAction(tt.action)
			assert.Equal(t, tt.shouldProcess, result)
		})
	}
}

// TestVerifySignature tests webhook signature verification
func TestVerifySignature(t *testing.T) {
	handler := &Handler{
		webhookSecret: "test-secret",
	}

	payload := []byte(`{"test": "data"}`)

	// Test with valid signature
	validSignature := generateSignature("test-secret", payload)
	result := handler.verifySignature(payload, validSignature)
	assert.True(t, result, "Should accept valid signature")

	// Test with invalid signature
	invalidSignature := generateSignature("wrong-secret", payload)
	result = handler.verifySignature(payload, invalidSignature)
	assert.False(t, result, "Should reject invalid signature")

	// Test with empty secret (should accept any signature)
	handler.webhookSecret = ""
	result = handler.verifySignature(payload, "sha256=test")
	assert.True(t, result, "Should accept any signature when secret is empty")

	// Test with invalid signature format (reset secret first)
	handler.webhookSecret = "test-secret"
	result = handler.verifySignature(payload, "invalid-signature")
	assert.False(t, result, "Should reject invalid signature format")
}

// TestExtractRepositoryInfo tests repository info extraction
func TestExtractRepositoryInfo(t *testing.T) {
	tests := []struct {
		fullName string
		owner    string
		repo     string
	}{
		{"owner/repo", "owner", "repo"},
		{"test/project", "test", "project"},
		{"invalid", "", ""},
		{"", "", ""},
		{"owner/repo/subdir", "owner", "repo/subdir"},
	}

	for _, tt := range tests {
		t.Run(tt.fullName, func(t *testing.T) {
			owner, repo := extractRepositoryInfo(tt.fullName)
			assert.Equal(t, tt.owner, owner)
			assert.Equal(t, tt.repo, repo)
		})
	}
}

// Helper function to extract repository info (for testing)
func extractRepositoryInfo(fullName string) (owner, repo string) {
	parts := strings.Split(fullName, "/")
	if len(parts) >= 2 {
		return parts[0], strings.Join(parts[1:], "/")
	}
	return "", ""
}
