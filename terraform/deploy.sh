#!/bin/bash

# NotifyOps AWS Free Tier Deployment Script
# This script builds Docker images, pushes to ECR, and deploys to EC2

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
AWS_REGION=${AWS_REGION:-us-east-1}
ECR_REPO_NAME="notifyops"
ECR_WEB_REPO_NAME="notifyops-web"

echo -e "${BLUE}NotifyOps AWS Free Tier Deployment${NC}"
echo "=================================="

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}Error: AWS CLI is not installed${NC}"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    exit 1
fi

# Get AWS account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo -e "${GREEN}AWS Account ID: ${AWS_ACCOUNT_ID}${NC}"

# Get ECR repository URLs
ECR_REPO_URL="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO_NAME}"
ECR_WEB_REPO_URL="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_WEB_REPO_NAME}"

echo -e "${GREEN}ECR Repository URLs:${NC}"
echo "  Main App: ${ECR_REPO_URL}"
echo "  Web App: ${ECR_WEB_REPO_URL}"

# Login to ECR
echo -e "${YELLOW}Logging in to ECR...${NC}"
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

# Build and push main application image
echo -e "${YELLOW}Building main application image...${NC}"
docker build -t ${ECR_REPO_NAME}:latest .

echo -e "${YELLOW}Tagging main application image...${NC}"
docker tag ${ECR_REPO_NAME}:latest ${ECR_REPO_URL}:latest

echo -e "${YELLOW}Pushing main application image to ECR...${NC}"
docker push ${ECR_REPO_URL}:latest

# Build and push web application image
echo -e "${YELLOW}Building web application image...${NC}"
docker build -t ${ECR_WEB_REPO_NAME}:latest ./web

echo -e "${YELLOW}Tagging web application image...${NC}"
docker tag ${ECR_WEB_REPO_NAME}:latest ${ECR_WEB_REPO_URL}:latest

echo -e "${YELLOW}Pushing web application image to ECR...${NC}"
docker push ${ECR_WEB_REPO_URL}:latest

# Get EC2 instance IP from Terraform output
echo -e "${YELLOW}Getting EC2 instance information...${NC}"
cd terraform

# Check if Terraform is initialized
if [ ! -d ".terraform" ]; then
    echo -e "${YELLOW}Initializing Terraform...${NC}"
    terraform init
fi

# Get instance IP
INSTANCE_IP=$(terraform output -raw instance_public_ip 2>/dev/null || echo "")

if [ -z "$INSTANCE_IP" ]; then
    echo -e "${RED}Error: Could not get EC2 instance IP. Make sure Terraform has been applied.${NC}"
    exit 1
fi

echo -e "${GREEN}EC2 Instance IP: ${INSTANCE_IP}${NC}"

# Wait for instance to be ready
echo -e "${YELLOW}Waiting for EC2 instance to be ready...${NC}"
until ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no -i ../notifyops-key.pem ec2-user@${INSTANCE_IP} "echo 'Instance is ready'" 2>/dev/null; do
    echo "Waiting for instance to be ready..."
    sleep 10
done

# Pull and restart services on EC2
echo -e "${YELLOW}Pulling latest images and restarting services...${NC}"
ssh -i ../notifyops-key.pem ec2-user@${INSTANCE_IP} << 'EOF'
cd /opt/notifyops

# Get AWS account ID and region
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=$(curl -s http://169.254.169.254/latest/meta-data/placement/region)

# Login to ECR
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Pull latest images
docker pull $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/notifyops:latest
docker pull $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/notifyops-web:latest

# Restart services
docker-compose down
docker-compose up -d

# Wait for services to be healthy
sleep 30

# Check service health
./health_check.sh
EOF

echo -e "${GREEN}Deployment completed successfully!${NC}"
echo ""
echo -e "${BLUE}Application URLs:${NC}"
echo "  Go API:     http://${INSTANCE_IP}:8080"
echo "  Web App:    http://${INSTANCE_IP}:3000"
echo "  Prometheus: http://${INSTANCE_IP}:9091"
echo "  Grafana:    http://${INSTANCE_IP}:3001"
echo ""
echo -e "${BLUE}SSH Access:${NC}"
echo "  ssh -i notifyops-key.pem ec2-user@${INSTANCE_IP}"
echo ""
echo -e "${YELLOW}Note: Make sure to configure your GitHub webhook to point to:${NC}"
echo "  http://${INSTANCE_IP}:8080/webhook/github" 