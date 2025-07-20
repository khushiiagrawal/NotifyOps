package ai

// PredefinedPromptStyles provides ready-to-use prompt styles
var PredefinedPromptStyles = map[string]PromptStyle{
	"master_analyst": {
		Personality:   "MASTER ANALYST",
		AnalysisFocus: "technical_impact",
		Tone:          "professional",
		DetailLevel:   "comprehensive",
		CustomFields:  make(map[string]string),
	},

	"senior_developer": {
		Personality:   "SENIOR DEVELOPER",
		AnalysisFocus: "technical_impact",
		Tone:          "friendly",
		DetailLevel:   "moderate",
		CustomFields:  make(map[string]string),
	},

	"devops_engineer": {
		Personality:   "DEVOPS ENGINEER",
		AnalysisFocus: "technical_impact",
		Tone:          "professional",
		DetailLevel:   "moderate",
		CustomFields:  make(map[string]string),
	},

	"product_manager": {
		Personality:   "PRODUCT MANAGER",
		AnalysisFocus: "business_value",
		Tone:          "friendly",
		DetailLevel:   "moderate",
		CustomFields:  make(map[string]string),
	},

	"security_expert": {
		Personality:   "SECURITY EXPERT",
		AnalysisFocus: "security_focus",
		Tone:          "urgent",
		DetailLevel:   "comprehensive",
		CustomFields:  make(map[string]string),
	},

	"executive_summary": {
		Personality:   "MASTER ANALYST",
		AnalysisFocus: "business_value",
		Tone:          "professional",
		DetailLevel:   "executive",
		CustomFields:  make(map[string]string),
	},

	"quick_triage": {
		Personality:   "SENIOR DEVELOPER",
		AnalysisFocus: "technical_impact",
		Tone:          "concise",
		DetailLevel:   "concise",
		CustomFields:  make(map[string]string),
	},

	"performance_focused": {
		Personality:   "DEVOPS ENGINEER",
		AnalysisFocus: "performance_optimization",
		Tone:          "professional",
		DetailLevel:   "moderate",
		CustomFields:  make(map[string]string),
	},

	"educational": {
		Personality:   "SENIOR DEVELOPER",
		AnalysisFocus: "technical_impact",
		Tone:          "educational",
		DetailLevel:   "comprehensive",
		CustomFields:  make(map[string]string),
	},

	"startup_focused": {
		Personality:   "PRODUCT MANAGER",
		AnalysisFocus: "business_value",
		Tone:          "friendly",
		DetailLevel:   "moderate",
		CustomFields: map[string]string{
			"Company Stage": "Early-stage startup",
			"Focus":         "Rapid iteration and user feedback",
			"Constraints":   "Limited resources and tight timelines",
		},
	},

	"enterprise_focused": {
		Personality:   "MASTER ANALYST",
		AnalysisFocus: "technical_impact",
		Tone:          "professional",
		DetailLevel:   "comprehensive",
		CustomFields: map[string]string{
			"Company Stage": "Enterprise organization",
			"Focus":         "Stability, compliance, and scalability",
			"Constraints":   "Complex approval processes and legacy systems",
		},
	},

	"security_critical": {
		Personality:   "SECURITY EXPERT",
		AnalysisFocus: "security_focus",
		Tone:          "urgent",
		DetailLevel:   "comprehensive",
		CustomFields: map[string]string{
			"Security Level": "Critical security environment",
			"Compliance":     "Strict regulatory requirements",
			"Response Time":  "Immediate action required",
		},
	},
}

// GetPromptStyle returns a predefined prompt style by name
func GetPromptStyle(name string) (PromptStyle, bool) {
	style, exists := PredefinedPromptStyles[name]
	return style, exists
}

// ListPromptStyles returns all available prompt style names
func ListPromptStyles() []string {
	var styles []string
	for name := range PredefinedPromptStyles {
		styles = append(styles, name)
	}
	return styles
}

// CreateCustomPromptStyle creates a custom prompt style
func CreateCustomPromptStyle(personality, analysisFocus, tone, detailLevel string, customFields map[string]string) PromptStyle {
	return PromptStyle{
		Personality:   personality,
		AnalysisFocus: analysisFocus,
		Tone:          tone,
		DetailLevel:   detailLevel,
		CustomFields:  customFields,
	}
}
