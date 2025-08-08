package test

import (
	"testing"

	"github-issue-ai-bot/pkg/utils"
)

func TestTruncateText(t *testing.T) {
	tests := []struct {
		name     string
		text     string
		maxLen   int
		expected string
	}{
		{"short text", "hello", 10, "hello"},
		{"exact length", "hello", 5, "hello"},
		{"long text", "hello world", 5, "he..."},
		{"empty text", "", 5, ""},
		{"zero max length", "hello", 0, "..."},
		{"negative max length", "hello", -1, "..."},
		{"unicode text", "こんにちは", 3, "こ..."},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := utils.TruncateText(tt.text, tt.maxLen)
			if result != tt.expected {
				t.Errorf("TruncateText(%q, %d) = %q, want %q", tt.text, tt.maxLen, result, tt.expected)
			}
		})
	}
}

func TestCleanText(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected string
	}{
		{"normal text", "hello world", "hello world"},
		{"extra spaces", "hello   world", "hello world"},
		{"newlines", "hello\nworld", "hello world"},
		{"tabs", "hello\tworld", "hello world"},
		{"mixed whitespace", "hello \t\n world", "hello world"},
		{"leading trailing", "  hello world  ", "hello world"},
		{"empty string", "", ""},
		{"only whitespace", "   \t\n   ", ""},
		{"unicode spaces", "hello\u00A0world", "hello world"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := utils.CleanText(tt.input)
			if result != tt.expected {
				t.Errorf("CleanText(%q) = %q, want %q", tt.input, result, tt.expected)
			}
		})
	}
}

func TestExtractRepositoryInfo(t *testing.T) {
	tests := []struct {
		name          string
		fullName      string
		expectedOwner string
		expectedRepo  string
	}{
		{"valid repo", "octocat/Hello-World", "octocat", "Hello-World"},
		{"valid repo with numbers", "user123/repo-456", "user123", "repo-456"},
		{"valid repo with underscores", "user_name/repo_name", "user_name", "repo_name"},
		{"valid repo with dots", "user.name/repo.name", "user.name", "repo.name"},
		{"invalid format", "invalid", "", ""},
		{"empty string", "", "", ""},
		{"too many parts", "owner/repo/extra", "", ""},
		{"single part", "repo", "", ""},
		{"with spaces", "owner /repo", "", ""},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			owner, repo := utils.ExtractRepositoryInfo(tt.fullName)
			if owner != tt.expectedOwner || repo != tt.expectedRepo {
				t.Errorf("ExtractRepositoryInfo(%q) = (%q, %q), want (%q, %q)",
					tt.fullName, owner, repo, tt.expectedOwner, tt.expectedRepo)
			}
		})
	}
}

func TestSanitizeSlackText(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected string
	}{
		{"no special chars", "hello world", "hello world"},
		{"ampersand", "hello & world", "hello &amp; world"},
		{"less than", "hello < world", "hello &lt; world"},
		{"greater than", "hello > world", "hello &gt; world"},
		{"multiple special chars", "hello & <world>", "hello &amp; &lt;world&gt;"},
		{"empty string", "", ""},
		{"only special chars", "&<>", "&amp;&lt;&gt;"},
		{"unicode text", "こんにちは & world", "こんにちは &amp; world"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := utils.SanitizeSlackText(tt.input)
			if result != tt.expected {
				t.Errorf("SanitizeSlackText(%q) = %q, want %q", tt.input, result, tt.expected)
			}
		})
	}
}

func TestFormatDuration(t *testing.T) {
	tests := []struct {
		name     string
		seconds  float64
		expected string
	}{
		{"less than minute", 30, "less than a minute"},
		{"exactly minute", 60, "1 minute"},
		{"multiple minutes", 120, "2 minutes"},
		{"fractional minutes", 90, "1 minute"},
		{"exactly hour", 3600, "1 hour"},
		{"multiple hours", 7200, "2 hours"},
		{"fractional hours", 5400, "1 hour"},
		{"zero seconds", 0, "less than a minute"},
		{"negative seconds", -30, "less than a minute"},
		{"very large seconds", 86400, "24 hours"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := utils.FormatDuration(tt.seconds)
			if result != tt.expected {
				t.Errorf("FormatDuration(%f) = %q, want %q", tt.seconds, result, tt.expected)
			}
		})
	}
}

func TestIsValidGitHubUsername(t *testing.T) {
	validUsernames := []string{
		"octocat",
		"user-name",
		"user123",
		"user_name",
		"user.name",
		"a",
		"a" + string(make([]rune, 38)), // 39 characters
		"user-name-123",
		"USER",
		"User",
	}

	invalidUsernames := []string{
		"",
		"a" + string(make([]rune, 39)), // 40 characters
		"-start",
		"end-",
		"user--name",
		"user@name",
		"user name",
		"user.name.",
		".user",
		"user-name-",
		"-user-name",
		"user--name",
		"user_name_",
		"user_name-",
		"user-name_",
		"user@domain.com",
		"user+tag",
		"user#tag",
		"user$tag",
		"user%tag",
		"user^tag",
		"user&tag",
		"user*tag",
		"user(tag",
		"user)tag",
		"user[tag",
		"user]tag",
		"user{tag",
		"user}tag",
		"user|tag",
		"user\\tag",
		"user/tag",
		"user:tag",
		"user;tag",
		"user'tag",
		"user\"tag",
		"user,tag",
		"user<tag",
		"user>tag",
		"user?tag",
		"user!tag",
		"user~tag",
		"user`tag",
		"user=tag",
		"user+tag",
		"user@tag",
		"user#tag",
		"user$tag",
		"user%tag",
		"user^tag",
		"user&tag",
		"user*tag",
		"user(tag",
		"user)tag",
		"user[tag",
		"user]tag",
		"user{tag",
		"user}tag",
		"user|tag",
		"user\\tag",
		"user/tag",
		"user:tag",
		"user;tag",
		"user'tag",
		"user\"tag",
		"user,tag",
		"user<tag",
		"user>tag",
		"user?tag",
		"user!tag",
		"user~tag",
		"user`tag",
		"user=tag",
	}

	for _, username := range validUsernames {
		t.Run("valid_"+username, func(t *testing.T) {
			if !utils.IsValidGitHubUsername(username) {
				t.Errorf("Expected valid username: %s", username)
			}
		})
	}

	for _, username := range invalidUsernames {
		t.Run("invalid_"+username, func(t *testing.T) {
			if utils.IsValidGitHubUsername(username) {
				t.Errorf("Expected invalid username: %s", username)
			}
		})
	}
}

func TestExtractIssueNumber(t *testing.T) {
	tests := []struct {
		name     string
		text     string
		expected int
		found    bool
	}{
		{"simple hash", "#123", 123, true},
		{"hash with text", "issue #123", 123, true},
		{"capitalized", "Issue #123", 123, true},
		{"without hash", "issue 123", 123, true},
		{"with text after", "issue #123 is important", 123, true},
		{"with text before", "check issue #123", 123, true},
		{"multiple numbers", "issue #123 and #456", 123, true},
		{"no issue number", "hello world", 0, false},
		{"empty string", "", 0, false},
		{"invalid number", "issue #abc", 0, false},
		{"zero number", "issue #0", 0, true},
		{"large number", "issue #999999", 999999, true},
		{"with punctuation", "issue #123!", 123, true},
		{"with parentheses", "(issue #123)", 123, true},
		{"with brackets", "[issue #123]", 123, true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, found := utils.ExtractIssueNumber(tt.text)
			if found != tt.found {
				t.Errorf("ExtractIssueNumber(%q) found = %v, want %v", tt.text, found, tt.found)
			}
			if found && result != tt.expected {
				t.Errorf("ExtractIssueNumber(%q) = %d, want %d", tt.text, result, tt.expected)
			}
		})
	}
}

func TestFormatFileSize(t *testing.T) {
	tests := []struct {
		name     string
		bytes    int64
		expected string
	}{
		{"zero bytes", 0, "0 B"},
		{"one byte", 1, "1 B"},
		{"bytes", 1023, "1023 B"},
		{"one kilobyte", 1024, "1.0 KB"},
		{"kilobytes", 1536, "1.5 KB"},
		{"megabytes", 1048576, "1.0 MB"},
		{"gigabytes", 1073741824, "1.0 GB"},
		{"terabytes", 1099511627776, "1.0 TB"},
		{"petabytes", 1125899906842624, "1.0 PB"},
		{"exabytes", 1152921504606846976, "1.0 EB"},
		{"negative bytes", -1024, "-1.0 KB"},
		{"large number", 1234567890, "1.1 GB"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := utils.FormatFileSize(tt.bytes)
			if result != tt.expected {
				t.Errorf("FormatFileSize(%d) = %q, want %q", tt.bytes, result, tt.expected)
			}
		})
	}
}

func TestContainsAny(t *testing.T) {
	tests := []struct {
		name       string
		text       string
		substrings []string
		expected   bool
	}{
		{"contains one", "hello world", []string{"world"}, true},
		{"contains multiple", "hello world", []string{"hello", "world"}, true},
		{"case insensitive", "Hello World", []string{"hello", "world"}, true},
		{"does not contain", "hello world", []string{"goodbye"}, false},
		{"empty text", "", []string{"hello"}, false},
		{"empty substrings", "hello", []string{}, false},
		{"empty text and substrings", "", []string{}, false},
		{"partial match", "hello world", []string{"lo wo"}, true},
		{"exact match", "hello", []string{"hello"}, true},
		{"unicode text", "こんにちは", []string{"こん"}, true},
		{"unicode substring", "hello こんにちは world", []string{"こんにちは"}, true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := utils.ContainsAny(tt.text, tt.substrings...)
			if result != tt.expected {
				t.Errorf("ContainsAny(%q, %v) = %v, want %v", tt.text, tt.substrings, result, tt.expected)
			}
		})
	}
}

func TestTruncateTextEdgeCases(t *testing.T) {
	tests := []struct {
		name     string
		text     string
		maxLen   int
		expected string
	}{
		{"short text", "short", 10, "short"},
		{"empty text", "", 5, ""},
		{"zero max length", "hello", 0, "..."},
		{"negative max length", "hello", -1, "..."},
		{"max length 3", "hello", 3, "..."},
		{"max length 4", "hello", 4, "h..."},
		{"unicode edge case", "こんにちは", 2, "こ..."},
		{"unicode exact", "こん", 2, "こん"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := utils.TruncateText(tt.text, tt.maxLen)
			if result != tt.expected {
				t.Errorf("TruncateText(%q, %d) = %q, want %q", tt.text, tt.maxLen, result, tt.expected)
			}
		})
	}
}

func TestCleanTextEdgeCases(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected string
	}{
		{"only spaces", "   ", ""},
		{"only tabs", "\t\t\t", ""},
		{"only newlines", "\n\n\n", ""},
		{"mixed whitespace", " \t\n ", ""},
		{"single space", " ", ""},
		{"single tab", "\t", ""},
		{"single newline", "\n", ""},
		{"unicode spaces", "\u00A0\u2000\u2001", ""},
		{"zero width spaces", "\u200B\uFEFF", ""},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := utils.CleanText(tt.input)
			if result != tt.expected {
				t.Errorf("CleanText(%q) = %q, want %q", tt.input, result, tt.expected)
			}
		})
	}
}

func TestFormatDurationEdgeCases(t *testing.T) {
	tests := []struct {
		name     string
		seconds  float64
		expected string
	}{
		{"zero", 0, "less than a minute"},
		{"negative", -30, "less than a minute"},
		{"very small", 0.5, "less than a minute"},
		{"exactly 59.9", 59.9, "less than a minute"},
		{"exactly 60", 60, "1 minute"},
		{"exactly 3600", 3600, "1 hour"},
		{"very large", 999999999, "277777 hours"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if tt.name == "infinity" {
				t.Skip("Skipping infinity test as it would panic")
			}
			result := utils.FormatDuration(tt.seconds)
			if result != tt.expected {
				t.Errorf("FormatDuration(%f) = %q, want %q", tt.seconds, result, tt.expected)
			}
		})
	}
}

func TestExtractIssueNumberEdgeCases(t *testing.T) {
	tests := []struct {
		name     string
		text     string
		expected int
		found    bool
	}{
		{"very large number", "issue #999999999", 999999999, true},
		{"zero", "issue #0", 0, true},
		{"negative", "issue #-123", 0, false},
		{"decimal", "issue #123.45", 0, false},
		{"hex", "issue #1a2b3c", 0, false},
		{"octal", "issue #0777", 777, true},
		{"with dots", "issue #123.456", 0, false},
		{"with commas", "issue #1,234", 0, false},
		{"with spaces in number", "issue # 123", 0, false},
		{"multiple hashes", "issue #123 #456", 123, true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, found := utils.ExtractIssueNumber(tt.text)
			if found != tt.found {
				t.Errorf("ExtractIssueNumber(%q) found = %v, want %v", tt.text, found, tt.found)
			}
			if found && result != tt.expected {
				t.Errorf("ExtractIssueNumber(%q) = %d, want %d", tt.text, result, tt.expected)
			}
		})
	}
}
