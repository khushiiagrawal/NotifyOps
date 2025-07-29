#!/bin/bash

# NotifyOps AWS Free Tier Cleanup Script
# This script destroys the infrastructure created by Terraform

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}NotifyOps AWS Free Tier Cleanup${NC}"
echo "================================"

# Check if Terraform is installed
if ! command -v terraform &> /dev/null; then
    echo -e "${RED}Error: Terraform is not installed${NC}"
    exit 1
fi

# Check if we're in the terraform directory
if [ ! -f "main.tf" ]; then
    echo -e "${RED}Error: Please run this script from the terraform directory${NC}"
    exit 1
fi

# Check if Terraform state exists
if [ ! -f ".terraform/terraform.tfstate" ] && [ ! -f "terraform.tfstate" ]; then
    echo -e "${YELLOW}No Terraform state found. Nothing to clean up.${NC}"
    exit 0
fi

# Show what will be destroyed
echo -e "${YELLOW}Planning Terraform destruction...${NC}"
terraform plan -destroy

# Ask for confirmation
echo -e "${RED}WARNING: This will destroy all AWS resources created by Terraform!${NC}"
echo -e "${YELLOW}This includes:${NC}"
echo "  - EC2 instance"
echo "  - VPC and networking"
echo "  - EFS file system"
echo "  - ECR repositories"
echo "  - Security groups"
echo "  - IAM roles"
echo ""
echo -e "${YELLOW}Are you sure you want to proceed? (y/N)${NC}"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo -e "${YELLOW}Destroying infrastructure...${NC}"
    terraform destroy -auto-approve
    
    echo -e "${GREEN}Infrastructure destroyed successfully!${NC}"
    echo ""
    echo -e "${YELLOW}Note: The SSH key file (../notifyops-key.pem) was not deleted.${NC}"
    echo -e "${YELLOW}You can manually delete it if you no longer need it.${NC}"
else
    echo -e "${YELLOW}Cleanup cancelled.${NC}"
    exit 0
fi 