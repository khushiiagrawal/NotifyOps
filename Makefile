.PHONY: help build run test clean docker-build docker-run docker-stop docker-logs deps lint fmt

# Default target
help:
	@echo "Available commands:"
	@echo "  build        - Build the application"
	@echo "  run          - Run the application locally"
	@echo "  test         - Run tests"
	@echo "  clean        - Clean build artifacts"
	@echo "  deps         - Download dependencies"
	@echo "  lint         - Run linter"
	@echo "  fmt          - Format code"
	@echo "  docker-build - Build Docker image"
	@echo "  docker-run   - Run with Docker Compose"
	@echo "  docker-stop  - Stop Docker Compose services"
	@echo "  docker-logs  - View Docker logs"

# Build the application
build:
	@echo "Building application..."
	go build -o bin/github-issue-ai-bot cmd/server/main.go

# Run the application locally
run:
	@echo "Running application..."
	go run cmd/server/main.go

# Run tests
test:
	@echo "Running tests..."
	go test -v ./...

# Run tests with coverage
test-coverage:
	@echo "Running tests with coverage..."
	go test -v -coverprofile=coverage.out ./...
	go tool cover -html=coverage.out -o coverage.html
	@echo "Coverage report generated: coverage.html"

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	rm -rf bin/
	rm -f coverage.out coverage.html

# Download dependencies
deps:
	@echo "Downloading dependencies..."
	go mod download
	go mod tidy

# Run linter
lint:
	@echo "Running linter..."
	golangci-lint run

# Format code
fmt:
	@echo "Formatting code..."
	go fmt ./...
	gofmt -s -w .

# Build Docker image
docker-build:
	@echo "Building Docker image..."
	docker build -t github-issue-ai-bot .

# Run with Docker Compose
docker-run:
	@echo "Starting services with Docker Compose..."
	docker-compose up -d

# Stop Docker Compose services
docker-stop:
	@echo "Stopping Docker Compose services..."
	docker-compose down

# View Docker logs
docker-logs:
	@echo "Viewing Docker logs..."
	docker-compose logs -f github-issue-ai-bot

# View all Docker logs
docker-logs-all:
	@echo "Viewing all Docker logs..."
	docker-compose logs -f

# Restart Docker Compose services
docker-restart:
	@echo "Restarting Docker Compose services..."
	docker-compose restart

# Clean Docker resources
docker-clean:
	@echo "Cleaning Docker resources..."
	docker-compose down -v --remove-orphans
	docker system prune -f

# Check application health
health:
	@echo "Checking application health..."
	curl -f http://localhost:8080/health || echo "Application is not healthy"

# Check metrics endpoint
metrics:
	@echo "Checking metrics endpoint..."
	curl -f http://localhost:8080/metrics || echo "Metrics endpoint not available"

# Generate mocks (if using mockery)
mocks:
	@echo "Generating mocks..."
	mockery --all --output=./internal/mocks

# Install development tools
install-tools:
	@echo "Installing development tools..."
	go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
	go install github.com/vektra/mockery/v2@latest

# Development setup
dev-setup: install-tools deps
	@echo "Development setup complete!"

# Production build
prod-build:
	@echo "Building for production..."
	CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -ldflags="-w -s" -o bin/github-issue-ai-bot cmd/server/main.go

# Run with hot reload (requires air)
dev:
	@echo "Running with hot reload..."
	air 