package test

import (
	"github-issue-ai-bot/internal/config"
	"testing"
)

func TestConfigDefaults(t *testing.T) {
	cfg, err := config.Load()
	if err != nil {
		t.Skip("skipping: config file or env not set up")
	}
	if cfg.Server.Port == "" {
		t.Error("expected default port to be set")
	}
}
