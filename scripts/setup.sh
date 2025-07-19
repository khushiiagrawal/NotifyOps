#!/bin/bash

# GitHub Issue AI Bot Setup Script
# This script helps you set up the GitHub Issue AI Bot

set -e

echo "🚀 GitHub Issue AI Bot Setup"
echo "=============================="

# Check if required tools are installed
check_requirements() {
    echo "Checking requirements..."
    
    # Check Go
    if ! command -v go &> /dev/null; then
        echo "❌ Go is not installed. Please install Go 1.21+"
        exit 1
    fi
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker is not installed. Please install Docker"
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        echo "❌ Docker Compose is not installed. Please install Docker Compose"
        exit 1
    fi
    
    echo "✅ All requirements are met"
}

# Create environment file
create_env_file() {
    echo "Creating environment file..."
    
    if [ -f .env ]; then
        echo "⚠️  .env file already exists. Backing up to .env.backup"
        cp .env .env.backup
    fi
    
    cat > .env << 'EOF'
# GitHub Configuration
GITHUB_WEBHOOK_SECRET=your_webhook_secret_here
GITHUB_ACCESS_TOKEN=your_github_personal_access_token
GITHUB_BASE_URL=https://api.github.com

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4
OPENAI_MAX_TOKENS=2000
OPENAI_TEMPERATURE=0.7

# Slack Configuration
SLACK_BOT_TOKEN=xoxb-your-slack-bot-token
SLACK_SIGNING_SECRET=your_slack_signing_secret
SLACK_CHANNEL_ID=C1234567890

# Server Configuration
SERVER_PORT=8080
SERVER_READ_TIMEOUT=30s
SERVER_WRITE_TIMEOUT=30s
SERVER_IDLE_TIMEOUT=60s

# Monitoring Configuration
METRICS_PORT=9090
METRICS_PATH=/metrics

# Logging
LOG_LEVEL=info
EOF

    echo "✅ Environment file created: .env"
    echo "⚠️  Please update the .env file with your actual credentials"
}

# Download dependencies
download_deps() {
    echo "Downloading Go dependencies..."
    go mod download
    go mod tidy
    echo "✅ Dependencies downloaded"
}

# Build the application
build_app() {
    echo "Building the application..."
    go build -o bin/github-issue-ai-bot cmd/server/main.go
    echo "✅ Application built successfully"
}

# Test the build
test_build() {
    echo "Testing the build..."
    if [ -f bin/github-issue-ai-bot ]; then
        echo "✅ Build test passed"
    else
        echo "❌ Build test failed"
        exit 1
    fi
}

# Show next steps
show_next_steps() {
    echo ""
    echo "🎉 Setup completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Update the .env file with your actual credentials:"
    echo "   - GITHUB_WEBHOOK_SECRET: From your GitHub repository webhook settings"
    echo "   - GITHUB_ACCESS_TOKEN: Your GitHub personal access token"
    echo "   - OPENAI_API_KEY: Your OpenAI API key"
    echo "   - SLACK_BOT_TOKEN: Your Slack bot token"
    echo "   - SLACK_SIGNING_SECRET: Your Slack signing secret"
    echo "   - SLACK_CHANNEL_ID: Your target Slack channel ID"
    echo ""
    echo "2. Run the application:"
    echo "   - Local development: make run"
    echo "   - Docker: make docker-run"
    echo ""
    echo "3. Access the services:"
    echo "   - Application: http://localhost:8080"
    echo "   - Health check: http://localhost:8080/health"
    echo "   - Metrics: http://localhost:8080/metrics"
    echo "   - Prometheus: http://localhost:9091"
    echo "   - Grafana: http://localhost:3000 (admin/admin)"
    echo ""
    echo "4. Set up GitHub webhook:"
    echo "   - Go to your repository Settings → Webhooks"
    echo "   - Add webhook with URL: https://your-domain.com/webhook/github"
    echo "   - Select events: Issues and Issue comments"
    echo ""
    echo "5. Set up Slack app:"
    echo "   - Go to api.slack.com/apps"
    echo "   - Configure Interactive Components with URL: https://your-domain.com/webhook/slack"
    echo ""
    echo "For more information, see the README.md file"
}

# Main setup function
main() {
    check_requirements
    create_env_file
    download_deps
    build_app
    test_build
    show_next_steps
}

# Run setup
main 