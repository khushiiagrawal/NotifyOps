#!/bin/bash

# NotifyOps EC2 User Data Script
# This script sets up the EC2 instance for running NotifyOps with Docker Compose

set -e

# Update system
yum update -y

# Install Docker
yum install -y docker
systemctl start docker
systemctl enable docker
usermod -a -G docker ec2-user

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install AWS CLI v2
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
./aws/install

# Install EFS utilities
yum install -y amazon-efs-utils

# Create mount point for EFS
mkdir -p /mnt/efs

# Mount EFS
mount -t efs ${efs_id}:/ /mnt/efs

# Add EFS mount to fstab for persistence
echo "${efs_id}:/ /mnt/efs efs defaults,_netdev 0 0" >> /etc/fstab

# Create directories for persistent data
mkdir -p /mnt/efs/prometheus_data
mkdir -p /mnt/efs/grafana_data

# Set permissions
chown -R ec2-user:ec2-user /mnt/efs

# Create application directory
mkdir -p /opt/notifyops
cd /opt/notifyops

# Create docker-compose.yml
cat > docker-compose.yml << 'EOF'
services:
  # GitHub Issue AI Bot
  github-issue-ai-bot:
    image: ${aws_account_id}.dkr.ecr.${aws_region}.amazonaws.com/notifyops:latest
    ports:
      - "8080:8080"  # Main application
      - "9090:9090"  # Metrics
    environment:
      # GitHub Configuration
      - GITHUB_WEBHOOK_SECRET=${GITHUB_WEBHOOK_SECRET}
      - GITHUB_ACCESS_TOKEN=${GITHUB_ACCESS_TOKEN}
      - GITHUB_BASE_URL=https://api.github.com
      
      # OpenAI Configuration
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - OPENAI_MODEL=gpt-3.5-turbo
      - OPENAI_MAX_TOKENS=2000
      - OPENAI_TEMPERATURE=0.7
      - OPENAI_PROMPT_STYLE=${OPENAI_PROMPT_STYLE:-master_analyst}
      
      # Slack Configuration
      - SLACK_BOT_TOKEN=${SLACK_BOT_TOKEN}
      - SLACK_SIGNING_SECRET=${SLACK_SIGNING_SECRET}
      - SLACK_CHANNEL_ID=${SLACK_CHANNEL_ID}
      
      # Server Configuration
      - SERVER_PORT=8080
      - SERVER_READ_TIMEOUT=30s
      - SERVER_WRITE_TIMEOUT=30s
      - SERVER_IDLE_TIMEOUT=60s
      
      # Monitoring Configuration
      - METRICS_PORT=9090
      - METRICS_PATH=/metrics
      
      # Logging
      - LOG_LEVEL=info
    depends_on:
      - prometheus
    networks:
      - monitoring
    restart: unless-stopped

  # Next.js Web App
  web:
    image: ${aws_account_id}.dkr.ecr.${aws_region}.amazonaws.com/notifyops-web:latest
    ports:
      - "3000:3000"
    networks:
      - monitoring
    restart: unless-stopped

  # Prometheus for metrics collection
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9091:9090"
    volumes:
      - /opt/notifyops/prometheus.yml:/etc/prometheus/prometheus.yml
      - /mnt/efs/prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=200h'
      - '--web.enable-lifecycle'
    networks:
      - monitoring
    restart: unless-stopped

  # Grafana for visualization
  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_ADMIN_PASSWORD:-admin}
      - GF_USERS_ALLOW_SIGN_UP=false
    volumes:
      - /mnt/efs/grafana_data:/var/lib/grafana
      - /opt/notifyops/grafana/dashboards.json:/etc/grafana/provisioning/dashboards/dashboards.json
      - /opt/notifyops/grafana/datasources.yml:/etc/grafana/provisioning/datasources/datasources.yml
    depends_on:
      - prometheus
    networks:
      - monitoring
    restart: unless-stopped

networks:
  monitoring:
    driver: bridge
EOF

# Create prometheus.yml
cat > prometheus.yml << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "prometheus_rules.yml"

scrape_configs:
  - job_name: 'notifyops'
    static_configs:
      - targets: ['github-issue-ai-bot:9090']
    metrics_path: '/metrics'
    scrape_interval: 10s

  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']
EOF

# Create grafana directory and files
mkdir -p grafana

# Create datasources.yml
cat > grafana/datasources.yml << 'EOF'
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
EOF

# Create dashboards.json
cat > grafana/dashboards.json << 'EOF'
{
  "apiVersion": 1,
  "providers": [
    {
      "name": "default",
      "orgId": 1,
      "folder": "",
      "type": "file",
      "disableDeletion": false,
      "updateIntervalSeconds": 10,
      "allowUiUpdates": true,
      "options": {
        "path": "/etc/grafana/provisioning/dashboards"
      }
    }
  ]
}
EOF

# Create environment file
cat > .env << 'EOF'
# GitHub Configuration
GITHUB_WEBHOOK_SECRET=${GITHUB_WEBHOOK_SECRET}
GITHUB_ACCESS_TOKEN=${GITHUB_ACCESS_TOKEN}

# OpenAI Configuration
OPENAI_API_KEY=${OPENAI_API_KEY}
OPENAI_PROMPT_STYLE=${OPENAI_PROMPT_STYLE:-master_analyst}

# Slack Configuration
SLACK_BOT_TOKEN=${SLACK_BOT_TOKEN}
SLACK_SIGNING_SECRET=${SLACK_SIGNING_SECRET}
SLACK_CHANNEL_ID=${SLACK_CHANNEL_ID}

# Grafana Configuration
GRAFANA_ADMIN_PASSWORD=${GRAFANA_ADMIN_PASSWORD:-admin}
EOF

# Get AWS account ID and region
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=$(curl -s http://169.254.169.254/latest/meta-data/placement/region)

# Update docker-compose.yml with actual values
sed -i "s/\${aws_account_id}/$AWS_ACCOUNT_ID/g" docker-compose.yml
sed -i "s/\${aws_region}/$AWS_REGION/g" docker-compose.yml

# Login to ECR
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Pull images (these will be built and pushed by the developer)
# docker pull $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/notifyops:latest
# docker pull $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/notifyops-web:latest

# Start services
docker-compose up -d

# Create a simple health check script
cat > /opt/notifyops/health_check.sh << 'EOF'
#!/bin/bash
curl -f http://localhost:8080/health || exit 1
curl -f http://localhost:3000/ || exit 1
curl -f http://localhost:9091/ || exit 1
curl -f http://localhost:3001/ || exit 1
EOF

chmod +x /opt/notifyops/health_check.sh

# Create systemd service for auto-restart
cat > /etc/systemd/system/notifyops.service << 'EOF'
[Unit]
Description=NotifyOps Docker Compose
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/notifyops
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

systemctl enable notifyops.service

echo "NotifyOps setup completed successfully!"
echo "Services will be available at:"
echo "- Go API: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):8080"
echo "- Web App: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):3000"
echo "- Prometheus: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):9091"
echo "- Grafana: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):3001" 