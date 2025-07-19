package utils

import (
	"fmt"
	"regexp"
	"strconv"
	"strings"
	"unicode"
)

// TruncateText truncates text to a maximum length and adds ellipsis if needed
func TruncateText(text string, maxLength int) string {
	if len(text) <= maxLength {
		return text
	}
	return text[:maxLength-3] + "..."
}

// CleanText removes extra whitespace and normalizes text
func CleanText(text string) string {
	// Remove extra whitespace
	text = regexp.MustCompile(`\s+`).ReplaceAllString(text, " ")
	// Trim leading and trailing whitespace
	text = strings.TrimSpace(text)
	return text
}

// ExtractRepositoryInfo extracts owner and repo name from a full repository name
func ExtractRepositoryInfo(fullName string) (owner, repo string) {
	parts := strings.Split(fullName, "/")
	if len(parts) == 2 {
		return parts[0], parts[1]
	}
	return "", ""
}

// SanitizeSlackText sanitizes text for Slack by escaping special characters
func SanitizeSlackText(text string) string {
	// Escape Slack special characters
	replacements := map[string]string{
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
	}

	for old, new := range replacements {
		text = strings.ReplaceAll(text, old, new)
	}

	return text
}

// FormatDuration formats a duration in a human-readable format
func FormatDuration(seconds float64) string {
	if seconds < 60 {
		return "less than a minute"
	} else if seconds < 3600 {
		minutes := int(seconds / 60)
		return fmt.Sprintf("%d minute%s", minutes, pluralSuffix(minutes))
	} else {
		hours := int(seconds / 3600)
		return fmt.Sprintf("%d hour%s", hours, pluralSuffix(hours))
	}
}

// pluralSuffix returns "s" if count is not 1, otherwise returns empty string
func pluralSuffix(count int) string {
	if count == 1 {
		return ""
	}
	return "s"
}

// IsValidGitHubUsername checks if a string is a valid GitHub username
func IsValidGitHubUsername(username string) bool {
	if len(username) == 0 || len(username) > 39 {
		return false
	}

	// GitHub usernames can only contain alphanumeric characters and single hyphens
	// They cannot start or end with a hyphen
	if strings.HasPrefix(username, "-") || strings.HasSuffix(username, "-") {
		return false
	}

	// Check for consecutive hyphens
	if strings.Contains(username, "--") {
		return false
	}

	// Check for valid characters
	for _, r := range username {
		if !unicode.IsLetter(r) && !unicode.IsDigit(r) && r != '-' {
			return false
		}
	}

	return true
}

// ExtractIssueNumber extracts issue number from various formats
func ExtractIssueNumber(text string) (int, bool) {
	// Match patterns like "#123", "issue #123", "Issue 123", etc.
	patterns := []string{
		`#(\d+)`,
		`issue\s*#?(\d+)`,
		`Issue\s*#?(\d+)`,
	}

	for _, pattern := range patterns {
		re := regexp.MustCompile(pattern)
		matches := re.FindStringSubmatch(text)
		if len(matches) > 1 {
			if num, err := strconv.Atoi(matches[1]); err == nil {
				return num, true
			}
		}
	}

	return 0, false
}

// FormatFileSize formats file size in human-readable format
func FormatFileSize(bytes int64) string {
	const unit = 1024
	if bytes < unit {
		return fmt.Sprintf("%d B", bytes)
	}
	div, exp := int64(unit), 0
	for n := bytes / unit; n >= unit; n /= unit {
		div *= unit
		exp++
	}
	return fmt.Sprintf("%.1f %cB", float64(bytes)/float64(div), "KMGTPE"[exp])
}

// ContainsAny checks if the text contains any of the given substrings
func ContainsAny(text string, substrings ...string) bool {
	text = strings.ToLower(text)
	for _, substr := range substrings {
		if strings.Contains(text, strings.ToLower(substr)) {
			return true
		}
	}
	return false
}
