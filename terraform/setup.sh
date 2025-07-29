#!/bin/bash

# NotifyOps AWS Free Tier Setup Script
# This script sets up the initial infrastructure using Terraform

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}NotifyOps AWS Free Tier Infrastructure Setup${NC}"
echo "=============================================="

# Check if Terraform is installed
if ! command -v terraform &> /dev/null; then
    echo -e "${RED}Error: Terraform is not installed${NC}"
    echo "Please install Terraform from https://www.terraform.io/downloads.html"
    exit 1
fi

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}Error: AWS CLI is not installed${NC}"
    echo "Please install AWS CLI from https://aws.amazon.com/cli/"
    exit 1
fi

# Check if AWS credentials are configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}Error: AWS credentials are not configured${NC}"
    echo "Please run: aws configure"
    exit 1
fi

# Check if terraform.tfvars exists
if [ ! -f "terraform.tfvars" ]; then
    echo -e "${YELLOW}terraform.tfvars not found. Creating from example...${NC}"
    cp terraform.tfvars.example terraform.tfvars
    echo -e "${YELLOW}Please edit terraform.tfvars with your configuration${NC}"
    echo -e "${YELLOW}Especially update the ssh_public_key with your SSH public key${NC}"
    exit 1
fi

# Generate SSH key if it doesn't exist
if [ ! -f "../notifyops-key.pem" ]; then
    echo -e "${YELLOW}Generating SSH key pair...${NC}"
    ssh-keygen -t rsa -b 4096 -f ../notifyops-key -N ""
    chmod 600 ../notifyops-key.pem
    echo -e "${GREEN}SSH key generated: ../notifyops-key.pem${NC}"
    
    # Update terraform.tfvars with the public key
    PUBLIC_KEY=$(cat ../notifyops-key.pub)
    sed -i "s|ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC...|$PUBLIC_KEY|" terraform.tfvars
    echo -e "${GREEN}Updated terraform.tfvars with SSH public key${NC}"
fi

# Initialize Terraform
echo -e "${YELLOW}Initializing Terraform...${NC}"
terraform init

# Plan the deployment
echo -e "${YELLOW}Planning Terraform deployment...${NC}"
terraform plan

# Ask for confirmation
echo -e "${YELLOW}Do you want to apply this Terraform plan? (y/N)${NC}"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo -e "${YELLOW}Applying Terraform configuration...${NC}"
    terraform apply -auto-approve
    
    echo -e "${GREEN}Infrastructure deployed successfully!${NC}"
    echo ""
    
    # Get outputs
    INSTANCE_IP=$(terraform output -raw instance_public_ip)
    ECR_REPO_URL=$(terraform output -raw ecr_repository_url)
    
    echo -e "${BLUE}Deployment Summary:${NC}"
    echo "  EC2 Instance IP: ${INSTANCE_IP}"
    echo "  ECR Repository: ${ECR_REPO_URL}"
    echo ""
    echo -e "${BLUE}Application URLs (after deployment):${NC}"
    echo "  Go API:     http://${INSTANCE_IP}:8080"
    echo "  Web App:    http://${INSTANCE_IP}:3000"
    echo "  Prometheus: http://${INSTANCE_IP}:9091"
    echo "  Grafana:    http://${INSTANCE_IP}:3001"
    echo ""
    echo -e "${BLUE}SSH Access:${NC}"
    echo "  ssh -i ../notifyops-key.pem ec2-user@${INSTANCE_IP}"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo "  1. Wait for EC2 instance to be ready (5-10 minutes)"
    echo "  2. Run the deployment script: ../terraform/deploy.sh"
    echo "  3. Configure your GitHub webhook to point to:"
    echo "     http://${INSTANCE_IP}:8080/webhook/github"
    echo ""
    echo -e "${GREEN}Setup completed!${NC}"
else
    echo -e "${YELLOW}Deployment cancelled.${NC}"
    exit 0
fi 