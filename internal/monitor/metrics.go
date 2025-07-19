package monitor

import (
	"net/http"
	"time"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

// Metrics holds all Prometheus metrics
type Metrics struct {
	// HTTP request metrics
	httpRequestsTotal    *prometheus.CounterVec
	httpRequestDuration  *prometheus.HistogramVec
	httpRequestsInFlight *prometheus.GaugeVec

	// GitHub webhook metrics
	githubWebhooksTotal   *prometheus.CounterVec
	githubWebhookDuration *prometheus.HistogramVec
	githubAPIErrors       *prometheus.CounterVec

	// OpenAI API metrics
	openaiRequestsTotal   *prometheus.CounterVec
	openaiRequestDuration *prometheus.HistogramVec
	openaiTokensUsed      *prometheus.CounterVec
	openaiAPIErrors       *prometheus.CounterVec

	// Slack metrics
	slackMessagesSent    *prometheus.CounterVec
	slackMessageDuration *prometheus.HistogramVec
	slackAPIErrors       *prometheus.CounterVec

	// Business logic metrics
	issuesProcessed         *prometheus.CounterVec
	issueProcessingDuration *prometheus.HistogramVec
	issueSummariesGenerated *prometheus.CounterVec
}

// NewMetrics creates and registers all Prometheus metrics
func NewMetrics() *Metrics {
	m := &Metrics{
		// HTTP request metrics
		httpRequestsTotal: prometheus.NewCounterVec(
			prometheus.CounterOpts{
				Name: "http_requests_total",
				Help: "Total number of HTTP requests",
			},
			[]string{"method", "endpoint", "status"},
		),
		httpRequestDuration: prometheus.NewHistogramVec(
			prometheus.HistogramOpts{
				Name:    "http_request_duration_seconds",
				Help:    "HTTP request duration in seconds",
				Buckets: prometheus.DefBuckets,
			},
			[]string{"method", "endpoint"},
		),
		httpRequestsInFlight: prometheus.NewGaugeVec(
			prometheus.GaugeOpts{
				Name: "http_requests_in_flight",
				Help: "Current number of HTTP requests being processed",
			},
			[]string{"method", "endpoint"},
		),

		// GitHub webhook metrics
		githubWebhooksTotal: prometheus.NewCounterVec(
			prometheus.CounterOpts{
				Name: "github_webhooks_total",
				Help: "Total number of GitHub webhooks received",
			},
			[]string{"event_type", "action", "status"},
		),
		githubWebhookDuration: prometheus.NewHistogramVec(
			prometheus.HistogramOpts{
				Name:    "github_webhook_duration_seconds",
				Help:    "GitHub webhook processing duration in seconds",
				Buckets: prometheus.DefBuckets,
			},
			[]string{"event_type", "action"},
		),
		githubAPIErrors: prometheus.NewCounterVec(
			prometheus.CounterOpts{
				Name: "github_api_errors_total",
				Help: "Total number of GitHub API errors",
			},
			[]string{"operation", "error_type"},
		),

		// OpenAI API metrics
		openaiRequestsTotal: prometheus.NewCounterVec(
			prometheus.CounterOpts{
				Name: "openai_requests_total",
				Help: "Total number of OpenAI API requests",
			},
			[]string{"model", "status"},
		),
		openaiRequestDuration: prometheus.NewHistogramVec(
			prometheus.HistogramOpts{
				Name:    "openai_request_duration_seconds",
				Help:    "OpenAI API request duration in seconds",
				Buckets: prometheus.DefBuckets,
			},
			[]string{"model"},
		),
		openaiTokensUsed: prometheus.NewCounterVec(
			prometheus.CounterOpts{
				Name: "openai_tokens_used_total",
				Help: "Total number of OpenAI tokens used",
			},
			[]string{"model", "token_type"},
		),
		openaiAPIErrors: prometheus.NewCounterVec(
			prometheus.CounterOpts{
				Name: "openai_api_errors_total",
				Help: "Total number of OpenAI API errors",
			},
			[]string{"error_type"},
		),

		// Slack metrics
		slackMessagesSent: prometheus.NewCounterVec(
			prometheus.CounterOpts{
				Name: "slack_messages_sent_total",
				Help: "Total number of Slack messages sent",
			},
			[]string{"channel", "message_type", "status"},
		),
		slackMessageDuration: prometheus.NewHistogramVec(
			prometheus.HistogramOpts{
				Name:    "slack_message_duration_seconds",
				Help:    "Slack message sending duration in seconds",
				Buckets: prometheus.DefBuckets,
			},
			[]string{"message_type"},
		),
		slackAPIErrors: prometheus.NewCounterVec(
			prometheus.CounterOpts{
				Name: "slack_api_errors_total",
				Help: "Total number of Slack API errors",
			},
			[]string{"operation", "error_type"},
		),

		// Business logic metrics
		issuesProcessed: prometheus.NewCounterVec(
			prometheus.CounterOpts{
				Name: "issues_processed_total",
				Help: "Total number of issues processed",
			},
			[]string{"repository", "issue_type", "status"},
		),
		issueProcessingDuration: prometheus.NewHistogramVec(
			prometheus.HistogramOpts{
				Name:    "issue_processing_duration_seconds",
				Help:    "Issue processing duration in seconds",
				Buckets: prometheus.DefBuckets,
			},
			[]string{"issue_type"},
		),
		issueSummariesGenerated: prometheus.NewCounterVec(
			prometheus.CounterOpts{
				Name: "issue_summaries_generated_total",
				Help: "Total number of issue summaries generated",
			},
			[]string{"repository", "issue_type"},
		),
	}

	// Register all metrics
	prometheus.MustRegister(
		m.httpRequestsTotal,
		m.httpRequestDuration,
		m.httpRequestsInFlight,
		m.githubWebhooksTotal,
		m.githubWebhookDuration,
		m.githubAPIErrors,
		m.openaiRequestsTotal,
		m.openaiRequestDuration,
		m.openaiTokensUsed,
		m.openaiAPIErrors,
		m.slackMessagesSent,
		m.slackMessageDuration,
		m.slackAPIErrors,
		m.issuesProcessed,
		m.issueProcessingDuration,
		m.issueSummariesGenerated,
	)

	return m
}

// HTTPMiddleware creates middleware for HTTP metrics
func (m *Metrics) HTTPMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		// Track in-flight requests
		m.httpRequestsInFlight.WithLabelValues(r.Method, r.URL.Path).Inc()
		defer m.httpRequestsInFlight.WithLabelValues(r.Method, r.URL.Path).Dec()

		// Create a response writer that captures the status code
		wrapped := &responseWriter{ResponseWriter: w, statusCode: 200}

		next.ServeHTTP(wrapped, r)

		// Record metrics
		duration := time.Since(start).Seconds()
		m.httpRequestsTotal.WithLabelValues(r.Method, r.URL.Path, string(rune(wrapped.statusCode))).Inc()
		m.httpRequestDuration.WithLabelValues(r.Method, r.URL.Path).Observe(duration)
	})
}

// RecordGitHubWebhook records GitHub webhook metrics
func (m *Metrics) RecordGitHubWebhook(eventType, action, status string, duration time.Duration) {
	m.githubWebhooksTotal.WithLabelValues(eventType, action, status).Inc()
	m.githubWebhookDuration.WithLabelValues(eventType, action).Observe(duration.Seconds())
}

// RecordGitHubAPIError records GitHub API error metrics
func (m *Metrics) RecordGitHubAPIError(operation, errorType string) {
	m.githubAPIErrors.WithLabelValues(operation, errorType).Inc()
}

// RecordOpenAIRequest records OpenAI API request metrics
func (m *Metrics) RecordOpenAIRequest(model, status string, duration time.Duration) {
	m.openaiRequestsTotal.WithLabelValues(model, status).Inc()
	m.openaiRequestDuration.WithLabelValues(model).Observe(duration.Seconds())
}

// RecordOpenAITokens records OpenAI token usage metrics
func (m *Metrics) RecordOpenAITokens(model, tokenType string, count int) {
	m.openaiTokensUsed.WithLabelValues(model, tokenType).Add(float64(count))
}

// RecordOpenAIError records OpenAI API error metrics
func (m *Metrics) RecordOpenAIError(errorType string) {
	m.openaiAPIErrors.WithLabelValues(errorType).Inc()
}

// RecordSlackMessage records Slack message metrics
func (m *Metrics) RecordSlackMessage(channel, messageType, status string, duration time.Duration) {
	m.slackMessagesSent.WithLabelValues(channel, messageType, status).Inc()
	m.slackMessageDuration.WithLabelValues(messageType).Observe(duration.Seconds())
}

// RecordSlackError records Slack API error metrics
func (m *Metrics) RecordSlackError(operation, errorType string) {
	m.slackAPIErrors.WithLabelValues(operation, errorType).Inc()
}

// RecordIssueProcessed records issue processing metrics
func (m *Metrics) RecordIssueProcessed(repository, issueType, status string, duration time.Duration) {
	m.issuesProcessed.WithLabelValues(repository, issueType, status).Inc()
	m.issueProcessingDuration.WithLabelValues(issueType).Observe(duration.Seconds())
}

// RecordIssueSummaryGenerated records issue summary generation metrics
func (m *Metrics) RecordIssueSummaryGenerated(repository, issueType string) {
	m.issueSummariesGenerated.WithLabelValues(repository, issueType).Inc()
}

// Handler returns the Prometheus metrics handler
func (m *Metrics) Handler() http.Handler {
	return promhttp.Handler()
}

// responseWriter wraps http.ResponseWriter to capture status code
type responseWriter struct {
	http.ResponseWriter
	statusCode int
}

func (rw *responseWriter) WriteHeader(code int) {
	rw.statusCode = code
	rw.ResponseWriter.WriteHeader(code)
}

func (rw *responseWriter) Write(b []byte) (int, error) {
	return rw.ResponseWriter.Write(b)
}
