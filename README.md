# GitHub Issue AI Bot

An intelligent GitHub Issue Notification System that uses AI to summarize issues and deliver actionable insights to Slack. Built with Go, featuring real-time webhook processing, OpenAI integration, and comprehensive monitoring with Prometheus and Grafana.

## 🚀 Features

- **AI-Powered Summarization**: Uses OpenAI GPT to generate contextual summaries of GitHub issues
- **Real-time Processing**: Processes GitHub webhooks in real-time for instant notifications
- **Rich Context**: Fetches issue comments, related commits, and code changes for comprehensive analysis
- **Interactive Slack Integration**: Sends beautiful Slack messages with interactive buttons (Assign, Close, Request Fix)
- **Comprehensive Monitoring**: Prometheus metrics and Grafana dashboards for observability
- **Containerized**: Fully containerized with Docker and Docker Compose
- **Production Ready**: Includes health checks, graceful shutdown, and proper error handling

## 🏗️ Architecture

```
GitHub Webhook → Go Service → OpenAI API → Slack
                     ↓
              Prometheus Metrics
                     ↓
              Grafana Dashboards
```

### Components

- **GitHub Handler**: Processes webhooks, fetches issue data, comments, and commits
- **AI Summarizer**: Generates intelligent summaries using OpenAI GPT
- **Slack Notifier**: Sends formatted messages with interactive actions
- **Metrics Collector**: Exports Prometheus metrics for monitoring
- **Configuration Manager**: Handles environment variables and settings

## 📋 Prerequisites

- Go 1.21+
- Docker and Docker Compose
- GitHub Personal Access Token
- OpenAI API Key
- Slack Bot Token and Signing Secret

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd github-issue-ai-bot
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```bash
# GitHub Configuration
GITHUB_WEBHOOK_SECRET=your_webhook_secret_here
GITHUB_ACCESS_TOKEN=your_github_personal_access_token

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
LOG_LEVEL=info
```

### 3. GitHub Setup

1. **Create a Personal Access Token**:
   - Go to GitHub Settings → Developer settings → Personal access tokens
   - Generate a new token with `repo` and `read:org` scopes

2. **Create a Webhook**:
   - Go to your repository Settings → Webhooks
   - Add webhook with URL: `https://your-domain.com/webhook/github`
   - Set content type to `application/json`
   - Select events: `Issues` and `Issue comments`
   - Generate and save the webhook secret

### 4. Slack Setup

1. **Create a Slack App**:
   - Go to [api.slack.com/apps](https://api.slack.com/apps)
   - Create a new app
   - Add bot token scopes: `chat:write`, `channels:read`
   - Install the app to your workspace

2. **Configure Interactive Components**:
   - Go to Interactive Components
   - Set request URL to: `https://your-domain.com/webhook/slack`

3. **Get Required Tokens**:
   - Copy the Bot User OAuth Token
   - Copy the Signing Secret

### 5. OpenAI Setup

1. **Get API Key**:
   - Go to [platform.openai.com](https://platform.openai.com)
   - Create an account and get your API key

## 🚀 Running the Application

### Option 1: Docker Compose (Recommended)

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f github-issue-ai-bot

# Stop services
docker-compose down
```

### Option 2: Local Development

```bash
# Install dependencies
go mod download

# Run the application
go run cmd/server/main.go
```

### Option 3: Build and Run

```bash
# Build the binary
go build -o github-issue-ai-bot cmd/server/main.go

# Run the binary
./github-issue-ai-bot
```

## 📊 Monitoring

### Access Points

- **Application**: http://localhost:8080
- **Health Check**: http://localhost:8080/health
- **Metrics**: http://localhost:8080/metrics
- **Prometheus**: http://localhost:9091
- **Grafana**: http://localhost:3000 (admin/admin)

### Key Metrics

- **HTTP Requests**: Request count, duration, and status codes
- **GitHub Webhooks**: Webhook processing metrics
- **OpenAI API**: Request count, token usage, and errors
- **Slack Messages**: Message sending metrics
- **Issue Processing**: Processing time and success rates

### Grafana Dashboards

The application includes pre-configured Grafana dashboards for:
- System Overview
- GitHub Webhook Performance
- OpenAI API Usage
- Slack Message Delivery
- Issue Processing Analytics

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GITHUB_WEBHOOK_SECRET` | GitHub webhook secret | Required |
| `GITHUB_ACCESS_TOKEN` | GitHub personal access token | Required |
| `GITHUB_BASE_URL` | GitHub API base URL | `https://api.github.com` |
| `OPENAI_API_KEY` | OpenAI API key | Required |
| `OPENAI_MODEL` | OpenAI model to use | `gpt-4` |
| `OPENAI_MAX_TOKENS` | Maximum tokens for response | `2000` |
| `OPENAI_TEMPERATURE` | AI response temperature | `0.7` |
| `SLACK_BOT_TOKEN` | Slack bot token | Required |
| `SLACK_SIGNING_SECRET` | Slack signing secret | Required |
| `SLACK_CHANNEL_ID` | Target Slack channel ID | Required |
| `SERVER_PORT` | HTTP server port | `8080` |
| `LOG_LEVEL` | Logging level | `info` |

### Configuration File

You can also use a `config.yaml` file:

```yaml
server:
  port: "8080"
  read_timeout: "30s"
  write_timeout: "30s"
  idle_timeout: "60s"

github:
  webhook_secret: "your_secret"
  access_token: "your_token"
  base_url: "https://api.github.com"

openai:
  api_key: "your_key"
  model: "gpt-4"
  max_tokens: 2000
  temperature: 0.7

slack:
  bot_token: "your_token"
  signing_secret: "your_secret"
  channel_id: "your_channel"

monitor:
  metrics_port: "9090"
  metrics_path: "/metrics"

log_level: "info"
```

## 🔍 API Endpoints

### Health Check
```
GET /health
```

### Metrics
```
GET /metrics
```

### GitHub Webhook
```
POST /webhook/github
```

### Slack Interactive Messages
```
POST /webhook/slack
```

## 🧪 Testing

### Manual Testing

1. **Test Health Endpoint**:
   ```bash
   curl http://localhost:8080/health
   ```

2. **Test Metrics Endpoint**:
   ```bash
   curl http://localhost:8080/metrics
   ```

3. **Test GitHub Webhook** (using ngrok for local development):
   ```bash
   # Install ngrok
   ngrok http 8080
   
   # Use the ngrok URL in your GitHub webhook configuration
   ```

### Unit Tests

```bash
# Run all tests
go test ./...

# Run tests with coverage
go test -cover ./...

# Run specific package tests
go test ./internal/github
```

## 🚀 Deployment

### Docker Deployment

```bash
# Build image
docker build -t github-issue-ai-bot .

# Run container
docker run -d \
  --name github-issue-ai-bot \
  -p 8080:8080 \
  -p 9090:9090 \
  --env-file .env \
  github-issue-ai-bot
```

### Kubernetes Deployment

See the `k8s/` directory for Kubernetes manifests.

### Production Considerations

1. **SSL/TLS**: Use a reverse proxy (nginx, traefik) with SSL certificates
2. **Load Balancing**: Deploy multiple instances behind a load balancer
3. **Database**: Consider adding a database for persistent storage
4. **Caching**: Add Redis for caching frequently accessed data
5. **Logging**: Configure centralized logging (ELK stack, Fluentd)
6. **Monitoring**: Set up alerting rules in Prometheus/Grafana

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: Create an issue in the GitHub repository
- **Documentation**: Check the inline code comments and this README
- **Community**: Join our Slack channel for discussions

## 🔄 Roadmap

- [ ] Support for GitHub Pull Requests
- [ ] Advanced AI models and fine-tuning
- [ ] Multi-channel notifications (Discord, Teams, etc.)
- [ ] Issue trend analysis and reporting
- [ ] Automated issue triage and assignment
- [ ] Integration with Jira and other project management tools
- [ ] Advanced filtering and routing rules
- [ ] User preference management
- [ ] Mobile app for notifications 