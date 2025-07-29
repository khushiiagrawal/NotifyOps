# NotifyOps AWS Free Tier Deployment Guide

This guide provides step-by-step instructions for deploying NotifyOps on AWS Free Tier using Terraform infrastructure as code.

## Overview

NotifyOps is an AI-powered GitHub issue summarizer and Slack notifier that runs entirely on AWS Free Tier services:

- **t3.micro EC2 instance** (750 hours/month free)
- **EFS file system** (5GB/month free) for persistent storage
- **ECR repositories** (500MB/month free) for container images
- **VPC, subnet, security groups** (free tier eligible)
- **Docker Compose** for container orchestration

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    AWS Free Tier                           │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐                │
│  │   VPC & IGW     │  │   Security      │                │
│  │                 │  │   Groups        │                │
│  └─────────────────┘  └─────────────────┘                │
│           │                      │                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              t3.micro EC2 Instance                │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐  │   │
│  │  │   Go API    │ │  Next.js    │ │ Prometheus  │  │   │
│  │  │   :8080     │ │   Web App   │ │   :9091     │  │   │
│  │  │             │ │   :3000     │ │             │  │   │
│  │  └─────────────┘ └─────────────┘ └─────────────┘  │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐  │   │
│  │  │   Grafana   │ │   Docker    │ │   EFS       │  │   │
│  │  │   :3001     │ │   Compose   │ │   Mount     │  │   │
│  │  │             │ │             │ │             │  │   │
│  │  └─────────────┘ └─────────────┘ └─────────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
│           │                      │                        │
│  ┌─────────────────┐  ┌─────────────────┐                │
│  │   ECR Repo      │  │   EFS Storage   │                │
│  │   (500MB free)  │  │   (5GB free)    │                │
│  └─────────────────┘  └─────────────────┘                │
└─────────────────────────────────────────────────────────────┘
```

## Prerequisites

### 1. AWS Account Setup

1. **Create AWS Account**: Sign up for AWS Free Tier
2. **Install AWS CLI**: Download and configure
3. **Configure Credentials**: Run `aws configure`

```bash
# Install AWS CLI (macOS)
brew install awscli

# Configure AWS credentials
aws configure
# Enter your Access Key ID, Secret Access Key, region (us-east-1), and output format (json)
```

### 2. Development Environment

1. **Install Terraform**: Version 1.0 or higher
2. **Install Docker**: For building container images
3. **Install SSH Tools**: For accessing EC2 instance

```bash
# Install Terraform (macOS)
brew install terraform

# Install Docker Desktop
# Download from https://www.docker.com/products/docker-desktop

# Verify installations
terraform --version
docker --version
```

### 3. GitHub & Slack Setup

1. **GitHub Personal Access Token**: With `repo` and `read:org` scopes
2. **Slack App**: With bot token and signing secret
3. **OpenAI API Key**: For AI summarization

## Quick Deployment

### Step 1: Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd NotifyOps

# Navigate to terraform directory
cd terraform
```

### Step 2: Initial Infrastructure Setup

```bash
# Run the automated setup
chmod +x setup.sh
./setup.sh
```

This script will:
- Generate SSH key pair
- Create `terraform.tfvars` configuration
- Initialize Terraform
- Deploy AWS infrastructure
- Display connection information

### Step 3: Deploy Application

```bash
# Return to project root
cd ..

# Run the deployment script
chmod +x terraform/deploy.sh
./terraform/deploy.sh
```

This script will:
- Build Docker images
- Push to ECR
- Deploy to EC2 instance
- Start all services
- Display application URLs

### Step 4: Configure Webhooks

1. **GitHub Webhook**:
   - Go to repository Settings → Webhooks
   - Add URL: `http://[EC2_IP]:8080/webhook/github`
   - Set content type: `application/json`
   - Select events: `Issues` and `Issue comments`
   - Generate webhook secret

2. **Slack Interactive Components**:
   - Go to Slack app settings
   - Set request URL: `http://[EC2_IP]:8080/webhook/slack`

## Manual Deployment

### Step 1: Configure Variables

```bash
# Copy example configuration
cp terraform/terraform.tfvars.example terraform/terraform.tfvars

# Edit configuration
nano terraform/terraform.tfvars
```

Example `terraform.tfvars`:
```hcl
aws_region = "us-east-1"
vpc_cidr = "10.0.0.0/16"
public_subnet_cidr = "10.0.1.0/24"
ssh_public_key = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC..."
```

### Step 2: Generate SSH Key

```bash
# Generate SSH key pair
ssh-keygen -t rsa -b 4096 -f notifyops-key -N ""
chmod 600 notifyops-key.pem

# Update terraform.tfvars
PUBLIC_KEY=$(cat notifyops-key.pub)
sed -i "s|ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC...|$PUBLIC_KEY|" terraform/terraform.tfvars
```

### Step 3: Deploy Infrastructure

```bash
cd terraform

# Initialize Terraform
terraform init

# Plan deployment
terraform plan

# Apply configuration
terraform apply -auto-approve
```

### Step 4: Build and Push Images

```bash
# Get AWS account ID and region
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=$(aws configure get region)

# Login to ECR
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Build and push main application
docker build -t notifyops:latest .
docker tag notifyops:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/notifyops:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/notifyops:latest

# Build and push web application
docker build -t notifyops-web:latest ./web
docker tag notifyops-web:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/notifyops-web:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/notifyops-web:latest
```

### Step 5: Deploy to EC2

```bash
# Get instance IP
INSTANCE_IP=$(terraform output -raw instance_public_ip)

# Deploy application
ssh -i ../notifyops-key.pem ec2-user@$INSTANCE_IP << 'EOF'
cd /opt/notifyops

# Get AWS account ID and region
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=$(curl -s http://169.254.169.254/latest/meta-data/placement/region)

# Login to ECR
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Pull latest images
docker pull $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/notifyops:latest
docker pull $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/notifyops-web:latest

# Start services
docker-compose down
docker-compose up -d

# Wait for services to be ready
sleep 30

# Check health
./health_check.sh
EOF
```

## Configuration

### Environment Variables

Create a `.env` file on the EC2 instance:

```bash
# SSH to instance
ssh -i notifyops-key.pem ec2-user@$(terraform output -raw instance_public_ip)

# Edit environment file
nano /opt/notifyops/.env
```

Add your configuration:
```bash
# GitHub Configuration
GITHUB_WEBHOOK_SECRET=your_webhook_secret_here
GITHUB_ACCESS_TOKEN=your_github_personal_access_token

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_PROMPT_STYLE=master_analyst

# Slack Configuration
SLACK_BOT_TOKEN=xoxb-your-slack-bot-token
SLACK_SIGNING_SECRET=your_slack_signing_secret
SLACK_CHANNEL_ID=C1234567890
```

### Restart Services

```bash
# SSH to instance
ssh -i notifyops-key.pem ec2-user@$(terraform output -raw instance_public_ip)

# Restart with new configuration
cd /opt/notifyops
docker-compose down
docker-compose up -d
```

## Access Points

After deployment, access the application at:

- **Go API**: http://[EC2_IP]:8080
- **Web App**: http://[EC2_IP]:3000
- **Prometheus**: http://[EC2_IP]:9091
- **Grafana**: http://[EC2_IP]:3001 (admin/admin)

## Monitoring

### Health Checks

```bash
# Check all services
ssh -i notifyops-key.pem ec2-user@$(terraform output -raw instance_public_ip)
cd /opt/notifyops
./health_check.sh
```

### View Logs

```bash
# SSH to instance
ssh -i notifyops-key.pem ec2-user@$(terraform output -raw instance_public_ip)

# View all logs
cd /opt/notifyops
docker-compose logs

# View specific service logs
docker-compose logs github-issue-ai-bot
docker-compose logs web
docker-compose logs prometheus
docker-compose logs grafana
```

### Prometheus Metrics

- **HTTP Requests**: Request count, duration, status codes
- **GitHub Webhooks**: Processing metrics
- **OpenAI API**: Request count, token usage, errors
- **Slack Messages**: Message sending metrics
- **Issue Processing**: Processing time and success rates

### Grafana Dashboards

Pre-configured dashboards for:
- System Overview
- GitHub Webhook Performance
- OpenAI API Usage
- Slack Message Delivery
- Issue Processing Analytics

## Free Tier Management

### Monitor Usage

```bash
# Check EFS usage
aws efs describe-file-systems --file-system-id $(terraform output -raw efs_id)

# Check ECR usage
aws ecr describe-repositories --repository-names notifyops

# Monitor EC2 instance
aws ec2 describe-instances --instance-ids $(terraform output -raw instance_id)
```

### Free Tier Limits

- **EC2**: 750 hours/month of t3.micro
- **EFS**: 5GB storage
- **ECR**: 500MB storage
- **Data Transfer**: 15GB outbound

### Cost Optimization

1. **Monitor Usage**: Use AWS Cost Explorer
2. **Stay Within Limits**: Keep under free tier thresholds
3. **Clean Up**: Use cleanup script when done
4. **Optimize Images**: Keep Docker images small

## Troubleshooting

### Common Issues

1. **EC2 Instance Not Starting**
   ```bash
   # Check instance status
   aws ec2 describe-instances --instance-ids $(terraform output -raw instance_id)
   
   # Check user data logs
   ssh -i notifyops-key.pem ec2-user@$(terraform output -raw instance_public_ip)
   sudo cat /var/log/cloud-init-output.log
   ```

2. **Docker Images Not Pulling**
   ```bash
   # Check ECR login
   ssh -i notifyops-key.pem ec2-user@$(terraform output -raw instance_public_ip)
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $(aws sts get-caller-identity --query Account --output text).dkr.ecr.us-east-1.amazonaws.com
   ```

3. **Services Not Starting**
   ```bash
   # Check Docker Compose logs
   ssh -i notifyops-key.pem ec2-user@$(terraform output -raw instance_public_ip)
   cd /opt/notifyops
   docker-compose logs
   ```

4. **Webhook Not Working**
   ```bash
   # Check webhook endpoint
   curl -X POST http://[EC2_IP]:8080/webhook/github \
     -H "Content-Type: application/json" \
     -d '{"test": "data"}'
   ```

### Debug Commands

```bash
# Check system resources
ssh -i notifyops-key.pem ec2-user@$(terraform output -raw instance_public_ip)
df -h
free -h
docker system df

# Check service status
docker-compose ps
docker-compose logs --tail=50

# Check network connectivity
curl -f http://localhost:8080/health
curl -f http://localhost:3000/
curl -f http://localhost:9091/
curl -f http://localhost:3001/
```

## Cleanup

### Destroy Infrastructure

```bash
cd terraform
chmod +x cleanup.sh
./cleanup.sh
```

Or manually:
```bash
cd terraform
terraform destroy -auto-approve
```

### Manual Cleanup

1. **Delete ECR Images**
   ```bash
   aws ecr batch-delete-image --repository-name notifyops --image-ids imageTag=latest
   aws ecr batch-delete-image --repository-name notifyops-web --image-ids imageTag=latest
   ```

2. **Delete SSH Key**
   ```bash
   rm notifyops-key.pem notifyops-key.pub
   ```

## Security Considerations

1. **SSH Access**: Only the generated key pair can access EC2
2. **Security Groups**: Only necessary ports are open
3. **IAM Roles**: Minimal permissions for EC2 instance
4. **EFS Encryption**: File system is encrypted at rest
5. **ECR Scanning**: Images are scanned for vulnerabilities

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review AWS CloudWatch logs
3. Check application logs on EC2 instance
4. Create an issue in the GitHub repository

## Next Steps

After successful deployment:
1. Configure GitHub webhooks
2. Set up Slack app integration
3. Test issue creation and summarization
4. Monitor application performance
5. Set up alerts for free tier limits 