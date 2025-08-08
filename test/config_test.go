package test

import (
	"os"
	"testing"
	"time"

	"github-issue-ai-bot/internal/config"
)

func TestConfigDefaults(t *testing.T) {
	// Save original environment
	originalEnv := make(map[string]string)
	for _, key := range []string{
		"SERVER_PORT", "GITHUB_WEBHOOK_SECRET", "GITHUB_ACCESS_TOKEN",
		"OPENAI_API_KEY", "SLACK_BOT_TOKEN", "SLACK_SIGNING_SECRET", "SLACK_CHANNEL_ID",
	} {
		if val := os.Getenv(key); val != "" {
			originalEnv[key] = val
		}
	}

	// Clean up environment
	defer func() {
		for key := range originalEnv {
			os.Unsetenv(key)
		}
		for key, val := range originalEnv {
			os.Setenv(key, val)
		}
	}()

	// Test with minimal required environment variables
	os.Setenv("GITHUB_WEBHOOK_SECRET", "test-secret")
	os.Setenv("GITHUB_ACCESS_TOKEN", "test-token")
	os.Setenv("OPENAI_API_KEY", "test-openai-key")
	os.Setenv("SLACK_BOT_TOKEN", "test-slack-token")
	os.Setenv("SLACK_SIGNING_SECRET", "test-signing-secret")
	os.Setenv("SLACK_CHANNEL_ID", "test-channel")

	cfg, err := config.Load()
	if err != nil {
		t.Fatalf("Failed to load config: %v", err)
	}

	// Test server defaults
	if cfg.Server.Port != "8080" {
		t.Errorf("Expected default port 8080, got %s", cfg.Server.Port)
	}
	if cfg.Server.ReadTimeout != 30*time.Second {
		t.Errorf("Expected default read timeout 30s, got %v", cfg.Server.ReadTimeout)
	}
	if cfg.Server.WriteTimeout != 30*time.Second {
		t.Errorf("Expected default write timeout 30s, got %v", cfg.Server.WriteTimeout)
	}
	if cfg.Server.IdleTimeout != 60*time.Second {
		t.Errorf("Expected default idle timeout 60s, got %v", cfg.Server.IdleTimeout)
	}

	// Test GitHub defaults
	if cfg.GitHub.WebhookSecret != "test-secret" {
		t.Errorf("Expected webhook secret 'test-secret', got %s", cfg.GitHub.WebhookSecret)
	}
	if cfg.GitHub.AccessToken != "test-token" {
		t.Errorf("Expected access token 'test-token', got %s", cfg.GitHub.AccessToken)
	}
	if cfg.GitHub.BaseURL != "https://api.github.com" {
		t.Errorf("Expected base URL 'https://api.github.com', got %s", cfg.GitHub.BaseURL)
	}

	// Test OpenAI defaults
	if cfg.OpenAI.APIKey != "test-openai-key" {
		t.Errorf("Expected API key 'test-openai-key', got %s", cfg.OpenAI.APIKey)
	}
	if cfg.OpenAI.Model != "gpt-4" {
		t.Errorf("Expected model 'gpt-4', got %s", cfg.OpenAI.Model)
	}
	if cfg.OpenAI.MaxTokens != 2000 {
		t.Errorf("Expected max tokens 2000, got %d", cfg.OpenAI.MaxTokens)
	}
	if cfg.OpenAI.Temperature != 0.7 {
		t.Errorf("Expected temperature 0.7, got %f", cfg.OpenAI.Temperature)
	}
	if cfg.OpenAI.PromptStyle != "master_analyst" {
		t.Errorf("Expected prompt style 'master_analyst', got %s", cfg.OpenAI.PromptStyle)
	}

	// Test Slack defaults
	if cfg.Slack.BotToken != "test-slack-token" {
		t.Errorf("Expected bot token 'test-slack-token', got %s", cfg.Slack.BotToken)
	}
	if cfg.Slack.SigningSecret != "test-signing-secret" {
		t.Errorf("Expected signing secret 'test-signing-secret', got %s", cfg.Slack.SigningSecret)
	}
	if cfg.Slack.ChannelID != "test-channel" {
		t.Errorf("Expected channel ID 'test-channel', got %s", cfg.Slack.ChannelID)
	}

	// Test monitor defaults
	if cfg.Monitor.MetricsPort != "9090" {
		t.Errorf("Expected metrics port '9090', got %s", cfg.Monitor.MetricsPort)
	}
	if cfg.Monitor.MetricsPath != "/metrics" {
		t.Errorf("Expected metrics path '/metrics', got %s", cfg.Monitor.MetricsPath)
	}

	// Test log level default
	if cfg.LogLevel != "info" {
		t.Errorf("Expected log level 'info', got %s", cfg.LogLevel)
	}
}

func TestConfigValidation(t *testing.T) {
	// Save original environment
	originalEnv := make(map[string]string)
	for _, key := range []string{
		"GITHUB_WEBHOOK_SECRET", "GITHUB_ACCESS_TOKEN", "OPENAI_API_KEY",
		"SLACK_BOT_TOKEN", "SLACK_SIGNING_SECRET", "SLACK_CHANNEL_ID",
	} {
		if val := os.Getenv(key); val != "" {
			originalEnv[key] = val
		}
	}

	// Clean up environment
	defer func() {
		for key := range originalEnv {
			os.Unsetenv(key)
		}
		for key, val := range originalEnv {
			os.Setenv(key, val)
		}
	}()

	// Test validation with missing required fields
	cfg := &config.Config{}
	if err := cfg.Validate(); err == nil {
		t.Error("Expected validation error for missing required fields")
	}

	// Test validation with all required fields
	cfg = &config.Config{
		GitHub: config.GitHubConfig{
			WebhookSecret: "test-secret",
			AccessToken:   "test-token",
		},
		OpenAI: config.OpenAIConfig{
			APIKey: "test-openai-key",
		},
		Slack: config.SlackConfig{
			BotToken:      "test-slack-token",
			SigningSecret: "test-signing-secret",
			ChannelID:     "test-channel",
		},
	}

	if err := cfg.Validate(); err != nil {
		t.Errorf("Expected no validation error, got %v", err)
	}
}

func TestConfigEnvironmentOverrides(t *testing.T) {
	// Save original environment
	originalEnv := make(map[string]string)
	for _, key := range []string{
		"SERVER_PORT", "GITHUB_WEBHOOK_SECRET", "GITHUB_ACCESS_TOKEN",
		"OPENAI_API_KEY", "SLACK_BOT_TOKEN", "SLACK_SIGNING_SECRET", "SLACK_CHANNEL_ID",
		"OPENAI_MODEL", "OPENAI_MAX_TOKENS", "OPENAI_TEMPERATURE", "OPENAI_PROMPT_STYLE",
		"LOG_LEVEL", "METRICS_PORT", "METRICS_PATH",
	} {
		if val := os.Getenv(key); val != "" {
			originalEnv[key] = val
		}
	}

	// Clean up environment
	defer func() {
		for key := range originalEnv {
			os.Unsetenv(key)
		}
		for key, val := range originalEnv {
			os.Setenv(key, val)
		}
	}()

	// Set required environment variables
	os.Setenv("GITHUB_WEBHOOK_SECRET", "test-secret")
	os.Setenv("GITHUB_ACCESS_TOKEN", "test-token")
	os.Setenv("OPENAI_API_KEY", "test-openai-key")
	os.Setenv("SLACK_BOT_TOKEN", "test-slack-token")
	os.Setenv("SLACK_SIGNING_SECRET", "test-signing-secret")
	os.Setenv("SLACK_CHANNEL_ID", "test-channel")

	// Test environment overrides
	os.Setenv("SERVER_PORT", "9090")
	os.Setenv("OPENAI_MODEL", "gpt-3.5-turbo")
	os.Setenv("OPENAI_MAX_TOKENS", "1000")
	os.Setenv("OPENAI_TEMPERATURE", "0.5")
	os.Setenv("OPENAI_PROMPT_STYLE", "senior_developer")
	os.Setenv("LOG_LEVEL", "debug")
	os.Setenv("METRICS_PORT", "8080")
	os.Setenv("METRICS_PATH", "/prometheus")

	cfg, err := config.Load()
	if err != nil {
		t.Fatalf("Failed to load config: %v", err)
	}

	// Verify overrides
	if cfg.Server.Port != "9090" {
		t.Errorf("Expected port '9090', got %s", cfg.Server.Port)
	}
	if cfg.OpenAI.Model != "gpt-3.5-turbo" {
		t.Errorf("Expected model 'gpt-3.5-turbo', got %s", cfg.OpenAI.Model)
	}
	if cfg.OpenAI.MaxTokens != 1000 {
		t.Errorf("Expected max tokens 1000, got %d", cfg.OpenAI.MaxTokens)
	}
	if cfg.OpenAI.Temperature != 0.5 {
		t.Errorf("Expected temperature 0.5, got %f", cfg.OpenAI.Temperature)
	}
	if cfg.OpenAI.PromptStyle != "senior_developer" {
		t.Errorf("Expected prompt style 'senior_developer', got %s", cfg.OpenAI.PromptStyle)
	}
	if cfg.LogLevel != "debug" {
		t.Errorf("Expected log level 'debug', got %s", cfg.LogLevel)
	}
	if cfg.Monitor.MetricsPort != "8080" {
		t.Errorf("Expected metrics port '8080', got %s", cfg.Monitor.MetricsPort)
	}
	if cfg.Monitor.MetricsPath != "/prometheus" {
		t.Errorf("Expected metrics path '/prometheus', got %s", cfg.Monitor.MetricsPath)
	}
}

func TestConfigDurationParsing(t *testing.T) {
	// Save original environment
	originalEnv := make(map[string]string)
	for _, key := range []string{
		"SERVER_READ_TIMEOUT", "SERVER_WRITE_TIMEOUT", "SERVER_IDLE_TIMEOUT",
		"GITHUB_WEBHOOK_SECRET", "GITHUB_ACCESS_TOKEN", "OPENAI_API_KEY",
		"SLACK_BOT_TOKEN", "SLACK_SIGNING_SECRET", "SLACK_CHANNEL_ID",
	} {
		if val := os.Getenv(key); val != "" {
			originalEnv[key] = val
		}
	}

	// Clean up environment
	defer func() {
		for key := range originalEnv {
			os.Unsetenv(key)
		}
		for key, val := range originalEnv {
			os.Setenv(key, val)
		}
	}()

	// Set required environment variables
	os.Setenv("GITHUB_WEBHOOK_SECRET", "test-secret")
	os.Setenv("GITHUB_ACCESS_TOKEN", "test-token")
	os.Setenv("OPENAI_API_KEY", "test-openai-key")
	os.Setenv("SLACK_BOT_TOKEN", "test-slack-token")
	os.Setenv("SLACK_SIGNING_SECRET", "test-signing-secret")
	os.Setenv("SLACK_CHANNEL_ID", "test-channel")

	// Test duration parsing
	os.Setenv("SERVER_READ_TIMEOUT", "45s")
	os.Setenv("SERVER_WRITE_TIMEOUT", "60s")
	os.Setenv("SERVER_IDLE_TIMEOUT", "120s")

	cfg, err := config.Load()
	if err != nil {
		t.Fatalf("Failed to load config: %v", err)
	}

	if cfg.Server.ReadTimeout != 45*time.Second {
		t.Errorf("Expected read timeout 45s, got %v", cfg.Server.ReadTimeout)
	}
	if cfg.Server.WriteTimeout != 60*time.Second {
		t.Errorf("Expected write timeout 60s, got %v", cfg.Server.WriteTimeout)
	}
	if cfg.Server.IdleTimeout != 120*time.Second {
		t.Errorf("Expected idle timeout 120s, got %v", cfg.Server.IdleTimeout)
	}
}

func TestConfigInvalidValues(t *testing.T) {
	// Save original environment
	originalEnv := make(map[string]string)
	for _, key := range []string{
		"OPENAI_MAX_TOKENS", "OPENAI_TEMPERATURE", "SERVER_READ_TIMEOUT",
		"GITHUB_WEBHOOK_SECRET", "GITHUB_ACCESS_TOKEN", "OPENAI_API_KEY",
		"SLACK_BOT_TOKEN", "SLACK_SIGNING_SECRET", "SLACK_CHANNEL_ID",
	} {
		if val := os.Getenv(key); val != "" {
			originalEnv[key] = val
		}
	}

	// Clean up environment
	defer func() {
		for key := range originalEnv {
			os.Unsetenv(key)
		}
		for key, val := range originalEnv {
			os.Setenv(key, val)
		}
	}()

	// Set required environment variables
	os.Setenv("GITHUB_WEBHOOK_SECRET", "test-secret")
	os.Setenv("GITHUB_ACCESS_TOKEN", "test-token")
	os.Setenv("OPENAI_API_KEY", "test-openai-key")
	os.Setenv("SLACK_BOT_TOKEN", "test-slack-token")
	os.Setenv("SLACK_SIGNING_SECRET", "test-signing-secret")
	os.Setenv("SLACK_CHANNEL_ID", "test-channel")

	// Test invalid values (should fall back to defaults)
	os.Setenv("OPENAI_MAX_TOKENS", "invalid")
	os.Setenv("OPENAI_TEMPERATURE", "invalid")
	os.Setenv("SERVER_READ_TIMEOUT", "invalid")

	cfg, err := config.Load()
	if err != nil {
		t.Fatalf("Failed to load config: %v", err)
	}

	// Should fall back to defaults
	if cfg.OpenAI.MaxTokens != 2000 {
		t.Errorf("Expected default max tokens 2000, got %d", cfg.OpenAI.MaxTokens)
	}
	if cfg.OpenAI.Temperature != 0.7 {
		t.Errorf("Expected default temperature 0.7, got %f", cfg.OpenAI.Temperature)
	}
	if cfg.Server.ReadTimeout != 30*time.Second {
		t.Errorf("Expected default read timeout 30s, got %v", cfg.Server.ReadTimeout)
	}
}
