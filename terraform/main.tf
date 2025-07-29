# NotifyOps AWS Free Tier Infrastructure
# Deploys all services on a single t3.micro EC2 instance with Docker Compose

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = "NotifyOps"
      Environment = "production"
      ManagedBy   = "terraform"
      Owner       = "devops"
    }
  }
}

# Data sources
data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_ami" "amazon_linux_2" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# VPC and Networking
resource "aws_vpc" "notifyops_vpc" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "notifyops-vpc"
  }
}

resource "aws_subnet" "public_subnet" {
  vpc_id                  = aws_vpc.notifyops_vpc.id
  cidr_block              = var.public_subnet_cidr
  availability_zone       = data.aws_availability_zones.available.names[0]
  map_public_ip_on_launch = true

  tags = {
    Name = "notifyops-public-subnet"
  }
}

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.notifyops_vpc.id

  tags = {
    Name = "notifyops-igw"
  }
}

resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.notifyops_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }

  tags = {
    Name = "notifyops-public-rt"
  }
}

resource "aws_route_table_association" "public_rta" {
  subnet_id      = aws_subnet.public_subnet.id
  route_table_id = aws_route_table.public_rt.id
}

# Security Groups
resource "aws_security_group" "notifyops_sg" {
  name        = "notifyops-security-group"
  description = "Security group for NotifyOps application"
  vpc_id      = aws_vpc.notifyops_vpc.id

  # SSH access
  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTP for web application
  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTPS
  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Go API
  ingress {
    description = "NotifyOps API"
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Next.js Web App
  ingress {
    description = "Next.js Web App"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Prometheus
  ingress {
    description = "Prometheus"
    from_port   = 9090
    to_port     = 9090
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Grafana
  ingress {
    description = "Grafana"
    from_port   = 3001
    to_port     = 3001
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # All outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "notifyops-sg"
  }
}

# EFS File System for persistent storage
resource "aws_efs_file_system" "notifyops_efs" {
  creation_token = "notifyops-efs"
  encrypted      = true

  tags = {
    Name = "notifyops-efs"
  }
}

resource "aws_efs_mount_target" "notifyops_mount" {
  file_system_id  = aws_efs_file_system.notifyops_efs.id
  subnet_id       = aws_subnet.public_subnet.id
  security_groups = [aws_security_group.efs_sg.id]
}

resource "aws_security_group" "efs_sg" {
  name        = "notifyops-efs-sg"
  description = "Security group for EFS mount target"
  vpc_id      = aws_vpc.notifyops_vpc.id

  ingress {
    description     = "NFS from EC2"
    from_port       = 2049
    to_port         = 2049
    protocol        = "tcp"
    security_groups = [aws_security_group.notifyops_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "notifyops-efs-sg"
  }
}

# ECR Repository for container images
resource "aws_ecr_repository" "notifyops_repo" {
  name                 = "notifyops"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "notifyops-repo"
  }
}

# IAM Role for EC2
resource "aws_iam_role" "ec2_role" {
  name = "notifyops-ec2-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ec2_ssm" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_role_policy" "ec2_efs" {
  name = "notifyops-ec2-efs-policy"
  role = aws_iam_role.ec2_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "elasticfilesystem:ClientMount",
          "elasticfilesystem:ClientWrite"
        ]
        Resource = aws_efs_file_system.notifyops_efs.arn
      }
    ]
  })
}

resource "aws_iam_instance_profile" "ec2_profile" {
  name = "notifyops-ec2-profile"
  role = aws_iam_role.ec2_role.name
}

# EC2 Instance
resource "aws_instance" "notifyops_instance" {
  ami                    = data.aws_ami.amazon_linux_2.id
  instance_type          = "t3.micro"
  subnet_id              = aws_subnet.public_subnet.id
  vpc_security_group_ids = [aws_security_group.notifyops_sg.id]
  iam_instance_profile   = aws_iam_instance_profile.ec2_profile.name
  key_name               = aws_key_pair.notifyops_key.key_name

  root_block_device {
    volume_size = 8
    volume_type = "gp2"
    encrypted   = true
  }

  user_data = base64encode(templatefile("${path.module}/user_data.sh", {
    efs_id = aws_efs_file_system.notifyops_efs.id
  }))

  tags = {
    Name = "notifyops-instance"
  }

  depends_on = [aws_internet_gateway.igw]
}

# Key Pair for SSH access
resource "aws_key_pair" "notifyops_key" {
  key_name   = "notifyops-key"
  public_key = var.ssh_public_key
}

# Outputs
output "instance_public_ip" {
  description = "Public IP of the EC2 instance"
  value       = aws_instance.notifyops_instance.public_ip
}

output "instance_id" {
  description = "ID of the EC2 instance"
  value       = aws_instance.notifyops_instance.id
}

output "ecr_repository_url" {
  description = "URL of the ECR repository"
  value       = aws_ecr_repository.notifyops_repo.repository_url
}

output "efs_id" {
  description = "ID of the EFS file system"
  value       = aws_efs_file_system.notifyops_efs.id
}

output "vpc_id" {
  description = "ID of the VPC"
  value       = aws_vpc.notifyops_vpc.id
}

output "subnet_id" {
  description = "ID of the public subnet"
  value       = aws_subnet.public_subnet.id
} 