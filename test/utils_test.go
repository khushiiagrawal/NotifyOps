package test

import (
	"github-issue-ai-bot/pkg/utils"
	"testing"
)

func TestTruncateText(t *testing.T) {
	result := utils.TruncateText("hello world", 5)
	if result != "he..." {
		t.Errorf("expected 'he...', got '%s'", result)
	}
}

func TestCleanText(t *testing.T) {
	result := utils.CleanText("hello   world\n")
	if result != "hello world" {
		t.Errorf("expected 'hello world', got '%s'", result)
	}
}

func TestExtractRepositoryInfo(t *testing.T) {
	owner, repo := utils.ExtractRepositoryInfo("octocat/Hello-World")
	if owner != "octocat" || repo != "Hello-World" {
		t.Errorf("expected octocat/Hello-World, got %s/%s", owner, repo)
	}
	owner, repo = utils.ExtractRepositoryInfo("invalid")
	if owner != "" || repo != "" {
		t.Errorf("expected empty values for invalid input, got %s/%s", owner, repo)
	}
}

func TestSanitizeSlackText(t *testing.T) {
	input := "Hello & <world>"
	expected := "Hello &amp; &lt;world&gt;"
	if got := utils.SanitizeSlackText(input); got != expected {
		t.Errorf("expected '%s', got '%s'", expected, got)
	}
}

func TestFormatDuration(t *testing.T) {
	if got := utils.FormatDuration(30); got != "less than a minute" {
		t.Errorf("expected 'less than a minute', got '%s'", got)
	}
	if got := utils.FormatDuration(120); got != "2 minutes" {
		t.Errorf("expected '2 minutes', got '%s'", got)
	}
	if got := utils.FormatDuration(7200); got != "2 hours" {
		t.Errorf("expected '2 hours', got '%s'", got)
	}
}

func TestIsValidGitHubUsername(t *testing.T) {
	valid := []string{"octocat", "user-name", "user123"}
	invalid := []string{"", "-start", "end-", "user--name", "user@name", "thisusernameiswaytoolongtobevalidbecauseitisover39characters"}
	for _, u := range valid {
		if !utils.IsValidGitHubUsername(u) {
			t.Errorf("expected valid username: %s", u)
		}
	}
	for _, u := range invalid {
		if utils.IsValidGitHubUsername(u) {
			t.Errorf("expected invalid username: %s", u)
		}
	}
}

func TestTruncateTextEdgeCases(t *testing.T) {
	if got := utils.TruncateText("short", 10); got != "short" {
		t.Errorf("expected 'short', got '%s'", got)
	}
}

func TestCleanTextEdgeCases(t *testing.T) {
	if got := utils.CleanText("   "); got != "" {
		t.Errorf("expected empty string, got '%s'", got)
	}
}
