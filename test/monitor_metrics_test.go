package test

import (
	"github-issue-ai-bot/internal/monitor"
	"testing"
)

func TestNewMetrics(t *testing.T) {
	m := monitor.NewMetrics()
	if m == nil {
		t.Error("expected metrics to be created")
	}
}
