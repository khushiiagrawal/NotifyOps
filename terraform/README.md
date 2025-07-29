# NotifyOps AWS Free Tier Infrastructure

This directory contains the Terraform configuration for deploying NotifyOps on AWS Free Tier using a single t3.micro EC2 instance with Docker Compose.

## Architecture

```
AWS Free Tier Resources:
├── t3.micro EC2 Instance
│   ├── Docker & Docker Compose
│   ├── NotifyOps Go API (port 8080)
│   ├── Next.js Web App (port 3000)
│   ├── Prometheus (port 9091)
│   └── Grafana (port 3001)
├── EFS File System (5GB/month free)
│   ├── Prometheus data persistence
│   └── Grafana data persistence
├── ECR Repository (500MB/month free)
│   ├── notifyops:latest
│   └── notifyops-web:latest
├── VPC with Public Subnet
├── Internet Gateway
├── Security Groups
└── IAM Roles & Policies
```

## Prerequisites

1. **AWS Account**: Free tier eligible account
2. **AWS CLI**: Configured with appropriate credentials
3. **Terraform**: Version 1.0 or higher
4. **Docker**: For building and pushing images
5. **SSH Key**: For accessing the EC2 instance

## Quick Start

### 1. Initial Setup

```bash
# Navigate to terraform directory
cd terraform

# Run the setup script
chmod +x setup.sh
./setup.sh
```

The setup script will:
- Generate SSH key pair if not exists
- Create `terraform.tfvars` from example
- Initialize Terraform
- Deploy infrastructure

### 2. Deploy Application

```bash
# From the project root
chmod +x terraform/deploy.sh
./terraform/deploy.sh
```

The deploy script will:
- Build Docker images
- Push to ECR
- Deploy to EC2 instance
- Start all services

### 3. Access Application

After deployment, access the application at:

- **Go API**: http://[EC2_IP]:8080
- **Web App**: http://[EC2_IP]:3000
- **Prometheus**: http://[EC2_IP]:9091
- **Grafana**: http://[EC2_IP]:3001 (admin/admin - change default password in production)

## Manual Deployment

### 1. Configure Variables

```bash
# Copy example configuration
cp terraform.tfvars.example terraform.tfvars

# Edit with your values
nano terraform.tfvars
```

### 2. Generate SSH Key

```bash
# Generate SSH key pair
ssh-keygen -t rsa -b 4096 -f notifyops-key -N ""
chmod 600 notifyops-key.pem

# Update terraform.tfvars with public key
PUBLIC_KEY=$(cat notifyops-key.pub)
sed -i "s|ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC...|$PUBLIC_KEY|" terraform/terraform.tfvars
```

### 3. Deploy Infrastructure

```bash
cd terraform

# Initialize Terraform
terraform init

# Plan deployment
terraform plan

# Apply configuration
terraform apply
```

### 4. Build and Deploy Application

```bash
# Get AWS account ID and region
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=$(aws configure get region)

# Login to ECR
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Build and push images
docker build -t notifyops:latest .
docker tag notifyops:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/notifyops:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/notifyops:latest

docker build -t notifyops-web:latest ./web
docker tag notifyops-web:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/notifyops-web:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/notifyops-web:latest

# Deploy to EC2
INSTANCE_IP=$(terraform output -raw instance_public_ip)
ssh -i ../notifyops-key.pem ec2-user@$INSTANCE_IP << 'EOF'
cd /opt/notifyops
docker-compose down
docker-compose up -d
EOF
```

## Configuration

### Environment Variables

Create a `.env` file on the EC2 instance with your configuration:

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

### GitHub Webhook Setup

1. Go to your repository Settings → Webhooks
2. Add webhook URL: `http://[EC2_IP]:8080/webhook/github`
3. Set content type to `application/json`
4. Select events: `Issues` and `Issue comments`
5. Generate and save webhook secret

### Slack App Setup

1. Create Slack app at [api.slack.com/apps](https://api.slack.com/apps)
2. Add bot token scopes: `chat:write`, `channels:read`
3. Install app to workspace
4. Configure Interactive Components with URL: `http://[EC2_IP]:8080/webhook/slack`

## Monitoring

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

## Free Tier Limits

### AWS Free Tier (12 months)
- **EC2**: 750 hours/month of t3.micro
- **EFS**: 5GB storage
- **ECR**: 500MB storage
- **Data Transfer**: 15GB outbound

### Monitoring Usage

```bash
# Check EFS usage
aws efs describe-file-systems --file-system-id $(terraform output -raw efs_id)

# Check ECR usage
aws ecr describe-repositories --repository-names notifyops

# Monitor EC2 instance
aws ec2 describe-instances --instance-ids $(terraform output -raw instance_id)
```

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

### Health Checks

```bash
# Check all services
ssh -i notifyops-key.pem ec2-user@$(terraform output -raw instance_public_ip)
cd /opt/notifyops
./health_check.sh
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
terraform destroy
```

### Manual Cleanup

1. **Delete ECR Images**
   ```bash
   aws ecr batch-delete-image --repository-name notifyops --image-ids imageTag=latest
   aws ecr batch-delete-image --repository-name notifyops-web --image-ids imageTag=latest
   ```

2. **Delete EFS Data**
   ```bash
   aws efs delete-file-system --file-system-id $(terraform output -raw efs_id)
   ```

3. **Delete SSH Key**
   ```bash
   rm notifyops-key.pem notifyops-key.pub
   ```

## Security Considerations

1. **SSH Access**: Only the generated key pair can access the EC2 instance
2. **Security Groups**: Only necessary ports are open
3. **IAM Roles**: Minimal permissions for EC2 instance
4. **EFS Encryption**: File system is encrypted at rest
5. **ECR Scanning**: Images are scanned for vulnerabilities
6. **Environment Variables**: All sensitive data uses environment variables
7. **No Hardcoded Secrets**: No real API keys, tokens, or passwords in code
8. **Grafana Password**: Change default admin password in production

### Security Best Practices

- **Change Default Passwords**: Update Grafana admin password
- **Use Strong SSH Keys**: Generate 4096-bit RSA keys
- **Rotate Credentials**: Regularly update API keys and tokens
- **Monitor Access**: Use AWS CloudTrail for audit logs
- **Network Security**: Consider using VPC endpoints for AWS services

## Cost Optimization

1. **Monitor Usage**: Use AWS Cost Explorer to track spending
2. **Free Tier Limits**: Stay within 750 hours/month for EC2
3. **EFS Storage**: Keep under 5GB to avoid charges
4. **ECR Storage**: Keep under 500MB to avoid charges
5. **Data Transfer**: Monitor outbound data usage

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review AWS CloudWatch logs
3. Check application logs on EC2 instance
4. Create an issue in the GitHub repository

## Files

- `main.tf`: Main Terraform configuration
- `variables.tf`: Variable definitions
- `outputs.tf`: Output values
- `user_data.sh`: EC2 instance setup script
- `setup.sh`: Initial deployment script
- `deploy.sh`: Application deployment script
- `cleanup.sh`: Infrastructure cleanup script
- `terraform.tfvars.example`: Example configuration 