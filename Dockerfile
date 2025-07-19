FROM golang:1.21-alpine

# Install git and ca-certificates
RUN apk add --no-cache git ca-certificates

# Set working directory
WORKDIR /app

# Copy go mod files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN go build -o github-issue-ai-bot ./cmd/server

# Expose ports
EXPOSE 8080 9090

# Run the application
CMD ["./github-issue-ai-bot"] 