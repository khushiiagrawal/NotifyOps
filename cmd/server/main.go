package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"

	"github-issue-ai-bot/internal/ai"
	"github-issue-ai-bot/internal/config"
	"github-issue-ai-bot/internal/github"
	"github-issue-ai-bot/internal/monitor"
	"github-issue-ai-bot/internal/slack"
)

func main() {
	// Initialize logger
	logger, err := zap.NewProduction()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Failed to initialize logger: %v\n", err)
		os.Exit(1)
	}
	defer logger.Sync()

	logger.Info("Starting GitHub Issue AI Bot")

	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		logger.Fatal("Failed to load configuration", zap.Error(err))
	}

	// Validate configuration
	if err := cfg.Validate(); err != nil {
		logger.Fatal("Invalid configuration", zap.Error(err))
	}

	// Initialize metrics
	metrics := monitor.NewMetrics()

	// Initialize GitHub handler
	githubHandler := github.NewHandler(
		cfg.GitHub.AccessToken,
		cfg.GitHub.WebhookSecret,
		logger,
		metrics,
	)

	// Initialize AI summarizer with prompt style
	var summarizer *ai.Summarizer

	// Check if a predefined prompt style is specified
	if promptStyle, exists := ai.GetPromptStyle(cfg.OpenAI.PromptStyle); exists {
		summarizer = ai.NewSummarizerWithStyle(
			cfg.OpenAI.APIKey,
			cfg.OpenAI.Model,
			cfg.OpenAI.MaxTokens,
			float32(cfg.OpenAI.Temperature),
			logger,
			metrics,
			promptStyle,
		)
		logger.Info("Using predefined prompt style", zap.String("style", cfg.OpenAI.PromptStyle))
	} else {
		summarizer = ai.NewSummarizer(
			cfg.OpenAI.APIKey,
			cfg.OpenAI.Model,
			cfg.OpenAI.MaxTokens,
			float32(cfg.OpenAI.Temperature),
			logger,
			metrics,
		)
		logger.Info("Using default prompt style")
	}

	// Initialize Slack notifier
	slackNotifier := slack.NewNotifier(
		cfg.Slack.BotToken,
		cfg.Slack.ChannelID,
		cfg.Slack.SigningSecret,
		logger,
		metrics,
		summarizer,
		githubHandler,
	)

	// Set up Gin router
	gin.SetMode(gin.ReleaseMode)
	router := gin.New()
	router.Use(gin.Recovery())

	// Add metrics middleware
	router.Use(func(c *gin.Context) {
		metrics.HTTPMiddleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			c.Next()
		})).ServeHTTP(c.Writer, c.Request)
	})

	// Health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": "healthy",
			"time":   time.Now().UTC(),
		})
	})

	// Metrics endpoint
	router.GET(cfg.Monitor.MetricsPath, gin.WrapH(metrics.Handler()))

	// Prompt styles endpoint
	router.GET("/api/prompt-styles", func(c *gin.Context) {
		styles := ai.ListPromptStyles()
		c.JSON(http.StatusOK, gin.H{
			"available_styles": styles,
			"current_style":    cfg.OpenAI.PromptStyle,
		})
	})

	// Change prompt style endpoint
	router.POST("/api/prompt-style", func(c *gin.Context) {
		var request struct {
			Style string `json:"style" binding:"required"`
		}

		if err := c.ShouldBindJSON(&request); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
			return
		}

		if promptStyle, exists := ai.GetPromptStyle(request.Style); exists {
			summarizer.SetPromptStyle(promptStyle)
			logger.Info("Changed prompt style", zap.String("style", request.Style))
			c.JSON(http.StatusOK, gin.H{
				"message": "Prompt style changed successfully",
				"style":   request.Style,
			})
		} else {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":            "Invalid prompt style",
				"available_styles": ai.ListPromptStyles(),
			})
		}
	})

	// GitHub webhook endpoint
	router.POST("/webhook/github", func(c *gin.Context) {
		githubHandler.HandleWebhook(c.Writer, c.Request)
	})

	// Slack interactive messages endpoint
	router.POST("/webhook/slack", func(c *gin.Context) {
		slackNotifier.HandleInteractiveMessage(c.Writer, c.Request)
	})

	// Create issue processor
	issueProcessor := NewIssueProcessor(githubHandler, summarizer, slackNotifier, logger, metrics)

	// Set up the issue processing callback
	githubHandler.SetIssueProcessor(issueProcessor)

	// Create HTTP server
	server := &http.Server{
		Addr:         ":" + cfg.Server.Port,
		Handler:      router,
		ReadTimeout:  cfg.Server.ReadTimeout,
		WriteTimeout: cfg.Server.WriteTimeout,
		IdleTimeout:  cfg.Server.IdleTimeout,
	}

	// Start server in a goroutine
	go func() {
		logger.Info("Starting HTTP server", zap.String("port", cfg.Server.Port))
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Fatal("Failed to start server", zap.Error(err))
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	logger.Info("Shutting down server...")

	// Create a deadline for server shutdown
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Attempt graceful shutdown
	if err := server.Shutdown(ctx); err != nil {
		logger.Fatal("Server forced to shutdown", zap.Error(err))
	}

	logger.Info("Server exited")
}

// IssueProcessor handles the processing of GitHub issues
type IssueProcessor struct {
	githubHandler *github.Handler
	summarizer    *ai.Summarizer
	slackNotifier *slack.Notifier
	logger        *zap.Logger
	metrics       *monitor.Metrics
}

// NewIssueProcessor creates a new issue processor
func NewIssueProcessor(
	githubHandler *github.Handler,
	summarizer *ai.Summarizer,
	slackNotifier *slack.Notifier,
	logger *zap.Logger,
	metrics *monitor.Metrics,
) *IssueProcessor {
	return &IssueProcessor{
		githubHandler: githubHandler,
		summarizer:    summarizer,
		slackNotifier: slackNotifier,
		logger:        logger,
		metrics:       metrics,
	}
}

// ProcessIssue processes a GitHub issue
func (p *IssueProcessor) ProcessIssue(issueData *github.IssueData) {
	start := time.Now()

	p.logger.Info("Processing issue",
		zap.String("repository", issueData.Repository.GetFullName()),
		zap.Int("issue_number", issueData.Issue.GetNumber()),
		zap.String("action", issueData.Action),
	)

	// Generate AI summary
	summary, err := p.summarizer.SummarizeIssue(context.Background(), issueData)
	if err != nil {
		p.logger.Error("Failed to generate summary", zap.Error(err))
		p.metrics.RecordIssueProcessed(issueData.Repository.GetFullName(), "issue", "error", time.Since(start))
		return
	}

	// Generate Slack message
	slackMessage := p.summarizer.GenerateSlackMessage(issueData, summary)

	// Send to Slack
	if err := p.slackNotifier.SendIssueSummary(context.Background(), slackMessage); err != nil {
		p.logger.Error("Failed to send Slack message", zap.Error(err))
		p.metrics.RecordIssueProcessed(issueData.Repository.GetFullName(), "issue", "error", time.Since(start))
		return
	}

	// Record successful processing
	duration := time.Since(start)
	p.metrics.RecordIssueProcessed(issueData.Repository.GetFullName(), "issue", "success", duration)
	p.metrics.RecordIssueSummaryGenerated(issueData.Repository.GetFullName(), "issue")

	p.logger.Info("Successfully processed issue",
		zap.String("repository", issueData.Repository.GetFullName()),
		zap.Int("issue_number", issueData.Issue.GetNumber()),
		zap.String("priority", summary.Priority),
		zap.String("category", summary.Category),
		zap.Duration("processing_time", duration),
	)
}
