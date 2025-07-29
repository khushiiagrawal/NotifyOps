# NotifyOps

<img src="logo.png" height="400" width="400" />

### An intelligent GitHub Issue Notification System that uses AI to summarize issues and deliver actionable insights to Slack. Built with Go, featuring real-time webhook processing, OpenAI integration, and comprehensive monitoring with Prometheus and Grafana.

## Features

- **AI-Powered Summarization**: Uses OpenAI GPT to generate contextual summaries of GitHub issues
- **Real-time Processing**: Processes GitHub webhooks in real-time for instant notifications
- **Rich Context**: Fetches issue comments, related commits, and code changes for comprehensive analysis
- **Interactive Slack Integration**: Sends beautiful Slack messages with interactive buttons (Assign, Close, Request Fix)
- **Comprehensive Monitoring**: Prometheus metrics and Grafana dashboards for observability
- **Containerized**: Fully containerized with Docker and Docker Compose
- **Production Ready**: Includes health checks, graceful shutdown, and proper error handling

## Architecture

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

## Project Structure

```
NotifyOps/
├── cmd/                          # Application entry points
│   └── server/                   # Main server application
│       └── main.go              # Server entry point and initialization
├── internal/                     # Internal application packages
│   ├── ai/                      # AI/OpenAI integration
│   │   ├── prompts.go           # AI prompt styles and configurations
│   │   └── summarizer.go        # OpenAI API integration and summarization
│   ├── config/                  # Configuration management
│   │   └── config.go            # Environment variables and app configuration
│   ├── github/                  # GitHub API integration
│   │   ├── handler.go           # GitHub webhook processing and API calls
│   │   └── handler_test.go      # GitHub handler unit tests
│   ├── monitor/                 # Monitoring and metrics
│   │   └── metrics.go           # Prometheus metrics collection
│   └── slack/                   # Slack integration
│       └── notifier.go          # Slack message formatting and sending
├── pkg/                         # Public packages (reusable)
│   └── utils/                   # Utility functions
│       └── text.go              # Text processing utilities
├── web/                         # Next.js web application
│   ├── app/                     # Next.js app directory
│   │   ├── globals.css          # Global styles
│   │   ├── layout.tsx           # Root layout component
│   │   └── page.tsx             # Home page component
│   ├── components/              # React components
│   │   ├── ui/                  # Reusable UI components
│   │   ├── sections/            # Page sections
│   │   └── ...                  # Other components
│   ├── package.json             # Node.js dependencies
│   └── Dockerfile               # Web app container
├── k8s/                         # Kubernetes deployment manifests
│   ├── apps/                    # Application deployments
│   │   ├── grafana/             # Grafana deployment
│   │   ├── notifyops/           # Main app deployment
│   │   ├── prometheus/          # Prometheus deployment
│   │   └── web/                 # Web app deployment
│   ├── base/                    # Base configurations
│   │   ├── namespace.yaml       # Kubernetes namespace
│   │   ├── rbac.yaml            # Role-based access control
│   │   └── configmaps.yaml      # Configuration maps
│   ├── monitoring/              # Monitoring configurations
│   │   ├── grafana-dashboard.yaml # Grafana dashboard configs
│   │   └── prometheus-rules.yaml  # Prometheus alerting rules
│   └── scripts/                 # Kubernetes deployment scripts
│       ├── deploy.sh            # Deployment script
│       ├── setup.sh             # Cluster setup script
│       └── cleanup.sh           # Cleanup script
├── grafana/                     # Grafana configuration
│   ├── dashboard.json           # Dashboard definitions
│   └── datasources.yml          # Data source configurations
├── test/                        # Test files
│   ├── ai_summarizer_test.go    # AI summarizer tests
│   ├── config_test.go           # Configuration tests
│   ├── monitor_metrics_test.go  # Metrics tests
│   ├── server_test.go           # Server tests
│   ├── slack_notifier_test.go   # Slack notifier tests
│   └── utils_test.go            # Utility function tests
├── scripts/                     # Utility scripts
│   └── setup.sh                 # Environment setup script
├── prometheus_data/             # Prometheus data storage
├── .gitignore
├── .github/                     # GitHub workflows and templates
├── docker-compose.yml           # Docker Compose configuration
├── Dockerfile                   # Main application container
├── go.mod
├── go.sum
├── Makefile                     # Build and deployment commands
├── OWNERS
├── prometheus.yml               # Prometheus configuration
├── logo.png
└── README.md
```

### Key Files Explained

**Core Application:**

- `cmd/server/main.go` - Application entry point, server initialization, and routing
- `internal/config/config.go` - Environment variable loading and configuration management
- `internal/github/handler.go` - GitHub webhook processing and API integration
- `internal/ai/summarizer.go` - OpenAI API integration for issue summarization
- `internal/slack/notifier.go` - Slack message formatting and sending
- `internal/monitor/metrics.go` - Prometheus metrics collection and export

**Configuration:**

- `docker-compose.yml` - Multi-service container orchestration
- `Dockerfile` - Main application container definition
- `prometheus.yml` - Prometheus monitoring configuration
- `grafana/dashboard.json` - Grafana dashboard definitions
- `grafana/datasources.yml` - Grafana data source configuration

**Deployment:**

- `k8s/` - Complete Kubernetes deployment manifests
- `Makefile` - Build, test, and deployment commands
- `scripts/setup.sh` - Environment setup and initialization

**Web Application:**

- `web/` - Next.js frontend application
- `web/app/page.tsx` - Landing page component
- `web/components/` - Reusable React components

**Testing:**

- `test/` - Unit tests for all major components
- `web/tests/` - Frontend application tests

## Prerequisites

- Go 1.21+
- Docker and Docker Compose
- GitHub Personal Access Token
- OpenAI API Key
- Slack Bot Token and Signing Secret

## Quick Start

### 1. Clone and Setup

```bash
git clone <repository-url>
cd NotifyOps
```

### 2. Environment Configuration

Create a `.env` file:

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

### 3. Run with Docker Compose

```bash
# Start all services
make docker-run

# View logs
make docker-logs

# Stop services
make docker-stop
```

### 4. Access Points

- **Application**: http://localhost:8080
- **Health Check**: http://localhost:8080/health
- **Metrics**: http://localhost:8080/metrics
- **Prometheus**: http://localhost:9091
- **Grafana**: http://localhost:3000 (admin/admin)

## Setup Instructions

### GitHub Setup

1. **Create Personal Access Token**:
   - Go to GitHub Settings → Developer settings → Personal access tokens
   - Generate token with `repo` and `read:org` scopes

2. **Create Webhook**:
   - Go to repository Settings → Webhooks
   - Add webhook URL: `https://your-domain.com/webhook/github`
   - Set content type to `application/json`
   - Select events: `Issues` and `Issue comments`
   - Generate and save webhook secret

### Slack Setup

1. **Create Slack App**:
   - Go to [api.slack.com/apps](https://api.slack.com/apps)
   - Create new app
   - Add bot token scopes: `chat:write`, `channels:read`
   - Install app to workspace

2. **Configure Interactive Components**:
   - Go to Interactive Components
   - Set request URL: `https://your-domain.com/webhook/slack`

3. **Get Required Tokens**:
   - Copy Bot User OAuth Token
   - Copy Signing Secret

### OpenAI Setup

1. **Get API Key**:
   - Go to [platform.openai.com](https://platform.openai.com)
   - Create account and get API key

## AI Prompt Styles

The bot supports multiple AI personalities for different analysis styles:

| Style                | Focus             | Best For                            |
| -------------------- | ----------------- | ----------------------------------- |
| `master_analyst`     | Technical Impact  | Comprehensive technical analysis    |
| `senior_developer`   | Code Quality      | Development-focused analysis        |
| `devops_engineer`    | Operations        | Infrastructure and deployment focus |
| `product_manager`    | Business Value    | User experience and ROI analysis    |
| `security_expert`    | Security          | Security vulnerability assessment   |
| `executive_summary`  | Business Impact   | High-level executive summaries      |
| `quick_triage`       | Rapid Assessment  | Fast issue triage                   |
| `startup_focused`    | Business Growth   | Early-stage company needs           |
| `enterprise_focused` | Enterprise        | Large organization requirements     |
| `security_critical`  | Critical Security | High-security environments          |

### Setting Prompt Styles

**Environment Variable:**

```bash
export OPENAI_PROMPT_STYLE=security_expert
```

**Runtime API:**

```bash
# List available styles
curl http://localhost:8080/api/prompt-styles

# Change style
curl -X POST http://localhost:8080/api/prompt-style \
  -H "Content-Type: application/json" \
  -d '{"style": "product_manager"}'
```

## Configuration

### Environment Variables

| Variable                | Description                  | Default                  |
| ----------------------- | ---------------------------- | ------------------------ |
| `GITHUB_WEBHOOK_SECRET` | GitHub webhook secret        | Required                 |
| `GITHUB_ACCESS_TOKEN`   | GitHub personal access token | Required                 |
| `GITHUB_BASE_URL`       | GitHub API base URL          | `https://api.github.com` |
| `OPENAI_API_KEY`        | OpenAI API key               | Required                 |
| `OPENAI_MODEL`          | OpenAI model to use          | `gpt-4`                  |
| `OPENAI_MAX_TOKENS`     | Maximum tokens for response  | `2000`                   |
| `OPENAI_TEMPERATURE`    | AI response temperature      | `0.7`                    |
| `OPENAI_PROMPT_STYLE`   | AI prompt style/personality  | `master_analyst`         |
| `SLACK_BOT_TOKEN`       | Slack bot token              | Required                 |
| `SLACK_SIGNING_SECRET`  | Slack signing secret         | Required                 |
| `SLACK_CHANNEL_ID`      | Target Slack channel ID      | Required                 |
| `SERVER_PORT`           | HTTP server port             | `8080`                   |
| `LOG_LEVEL`             | Logging level                | `info`                   |

## API Endpoints

- `GET /health` - Health check
- `GET /metrics` - Prometheus metrics
- `POST /webhook/github` - GitHub webhook handler
- `POST /webhook/slack` - Slack interactive messages
- `GET /api/prompt-styles` - List available prompt styles
- `POST /api/prompt-style` - Change prompt style

## Development

### Local Development

```bash
# Install dependencies
make deps

# Run locally
make run

# Run tests
make test

# Build binary
make build
```

### Docker Development

```bash
# Build image
make docker-build

# Run with Docker Compose
make docker-run

# View logs
make docker-logs
```

## Monitoring

### Key Metrics

- **HTTP Requests**: Request count, duration, and status codes
- **GitHub Webhooks**: Webhook processing metrics
- **OpenAI API**: Request count, token usage, and errors
- **Slack Messages**: Message sending metrics
- **Issue Processing**: Processing time and success rates

### Grafana Dashboards

Pre-configured dashboards for:

- System Overview
- GitHub Webhook Performance
- OpenAI API Usage
- Slack Message Delivery
- Issue Processing Analytics

## Testing

### Manual Testing

```bash
# Test health endpoint
curl http://localhost:8080/health

# Test metrics endpoint
curl http://localhost:8080/metrics
```

### Unit Tests

```bash
# Run all tests
make test

# Run tests with coverage
make test-coverage
```

## Deployment

### Docker Deployment

```bash
# Build image
docker build -t notifyops .

# Run container
docker run -d \
  --name notifyops \
  -p 8080:8080 \
  -p 9090:9090 \
  --env-file .env \
  notifyops
```

### Kubernetes Deployment

See the `k8s/` directory for Kubernetes manifests.

### Production Considerations

1. **SSL/TLS**: Use reverse proxy with SSL certificates
2. **Load Balancing**: Deploy multiple instances behind load balancer
3. **Database**: Consider adding database for persistent storage
4. **Caching**: Add Redis for caching frequently accessed data
5. **Logging**: Configure centralized logging (ELK stack, Fluentd)
6. **Monitoring**: Set up alerting rules in Prometheus/Grafana

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

- **Issues**: Create an issue in the GitHub repository
- **Documentation**: Check the inline code comments and this README

# Contributors

<center>
<a href="https://github.com/Arpit529Srivastava/NotifyOps/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=Arpit529Srivastava/NotifyOps" />
</a>
</center>

## Roadmap

- [ ] Support for GitHub Pull Requests
- [ ] Advanced AI models and fine-tuning
- [ ] Multi-channel notifications (Discord, Teams, etc.)
- [ ] Issue trend analysis and reporting
- [ ] Automated issue triage and assignment
- [ ] Integration with Jira and other project management tools
- [ ] Advanced filtering and routing rules
- [ ] User preference management
- [ ] Mobile app for notifications
