package config

import (
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/spf13/viper"
)

// Config holds all configuration for the application
type Config struct {
	Server   ServerConfig
	GitHub   GitHubConfig
	OpenAI   OpenAIConfig
	Slack    SlackConfig
	Monitor  MonitorConfig
	LogLevel string
}

// ServerConfig holds server-related configuration
type ServerConfig struct {
	Port         string
	ReadTimeout  time.Duration
	WriteTimeout time.Duration
	IdleTimeout  time.Duration
}

// GitHubConfig holds GitHub-related configuration
type GitHubConfig struct {
	WebhookSecret string
	AccessToken   string
	BaseURL       string
}

// OpenAIConfig holds OpenAI-related configuration
type OpenAIConfig struct {
	APIKey      string
	Model       string
	MaxTokens   int
	Temperature float64
}

// SlackConfig holds Slack-related configuration
type SlackConfig struct {
	BotToken      string
	SigningSecret string
	ChannelID     string
}

// MonitorConfig holds monitoring-related configuration
type MonitorConfig struct {
	MetricsPort string
	MetricsPath string
}

// Load loads configuration from environment variables and files
func Load() (*Config, error) {
	viper.SetConfigName("config")
	viper.SetConfigType("yaml")
	viper.AddConfigPath(".")
	viper.AddConfigPath("./config")
	viper.AddConfigPath("/etc/github-issue-ai-bot")

	// Set defaults
	setDefaults()

	// Read config file if it exists
	if err := viper.ReadInConfig(); err != nil {
		if _, ok := err.(viper.ConfigFileNotFoundError); !ok {
			return nil, fmt.Errorf("error reading config file: %w", err)
		}
	}

	// Environment variables override config file
	viper.AutomaticEnv()

	config := &Config{
		Server: ServerConfig{
			Port:         getEnv("SERVER_PORT", "8080"),
			ReadTimeout:  getDurationEnv("SERVER_READ_TIMEOUT", 30*time.Second),
			WriteTimeout: getDurationEnv("SERVER_WRITE_TIMEOUT", 30*time.Second),
			IdleTimeout:  getDurationEnv("SERVER_IDLE_TIMEOUT", 60*time.Second),
		},
		GitHub: GitHubConfig{
			WebhookSecret: getEnv("GITHUB_WEBHOOK_SECRET", ""),
			AccessToken:   getEnv("GITHUB_ACCESS_TOKEN", ""),
			BaseURL:       getEnv("GITHUB_BASE_URL", "https://api.github.com"),
		},
		OpenAI: OpenAIConfig{
			APIKey:      getEnv("OPENAI_API_KEY", ""),
			Model:       getEnv("OPENAI_MODEL", "gpt-4"),
			MaxTokens:   getIntEnv("OPENAI_MAX_TOKENS", 2000),
			Temperature: getFloatEnv("OPENAI_TEMPERATURE", 0.7),
		},
		Slack: SlackConfig{
			BotToken:      getEnv("SLACK_BOT_TOKEN", ""),
			SigningSecret: getEnv("SLACK_SIGNING_SECRET", ""),
			ChannelID:     getEnv("SLACK_CHANNEL_ID", ""),
		},
		Monitor: MonitorConfig{
			MetricsPort: getEnv("METRICS_PORT", "9090"),
			MetricsPath: getEnv("METRICS_PATH", "/metrics"),
		},
		LogLevel: getEnv("LOG_LEVEL", "info"),
	}

	return config, nil
}

// Validate checks if the configuration is valid
func (c *Config) Validate() error {
	if c.GitHub.WebhookSecret == "" {
		return fmt.Errorf("GITHUB_WEBHOOK_SECRET is required")
	}
	if c.GitHub.AccessToken == "" {
		return fmt.Errorf("GITHUB_ACCESS_TOKEN is required")
	}
	if c.OpenAI.APIKey == "" {
		return fmt.Errorf("OPENAI_API_KEY is required")
	}
	if c.Slack.BotToken == "" {
		return fmt.Errorf("SLACK_BOT_TOKEN is required")
	}
	if c.Slack.SigningSecret == "" {
		return fmt.Errorf("SLACK_SIGNING_SECRET is required")
	}
	if c.Slack.ChannelID == "" {
		return fmt.Errorf("SLACK_CHANNEL_ID is required")
	}
	return nil
}

func setDefaults() {
	viper.SetDefault("server.port", "8080")
	viper.SetDefault("server.read_timeout", "30s")
	viper.SetDefault("server.write_timeout", "30s")
	viper.SetDefault("server.idle_timeout", "60s")
	viper.SetDefault("openai.model", "gpt-4")
	viper.SetDefault("openai.max_tokens", 2000)
	viper.SetDefault("openai.temperature", 0.7)
	viper.SetDefault("monitor.metrics_port", "9090")
	viper.SetDefault("monitor.metrics_path", "/metrics")
	viper.SetDefault("log_level", "info")
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getIntEnv(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}

func getFloatEnv(key string, defaultValue float64) float64 {
	if value := os.Getenv(key); value != "" {
		if floatValue, err := strconv.ParseFloat(value, 64); err == nil {
			return floatValue
		}
	}
	return defaultValue
}

func getDurationEnv(key string, defaultValue time.Duration) time.Duration {
	if value := os.Getenv(key); value != "" {
		if duration, err := time.ParseDuration(value); err == nil {
			return duration
		}
	}
	return defaultValue
}
