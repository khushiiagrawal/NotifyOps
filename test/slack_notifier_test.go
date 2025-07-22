package test

import (
	"github-issue-ai-bot/internal/slack"
	"testing"

	"go.uber.org/zap"
)

func TestNewNotifier(t *testing.T) {
	logger, _ := zap.NewDevelopment()
	n := slack.NewNotifier("token", "channel", "secret", logger, nil)
	if n == nil {
		t.Error("expected notifier to be created")
	}
}
