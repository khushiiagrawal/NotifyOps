package test

import (
	"github-issue-ai-bot/internal/ai"
	"testing"
)

func TestDefaultPromptStyle(t *testing.T) {
	style := ai.DefaultPromptStyle()
	if style.Personality == "" {
		t.Error("expected non-empty personality")
	}
}
