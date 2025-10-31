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

output "application_urls" {
  description = "URLs for accessing the NotifyOps application"
  value = {
    go_api     = "http://${aws_instance.notifyops_instance.public_ip}:8080"
    web_app    = "http://${aws_instance.notifyops_instance.public_ip}:3000"
    prometheus = "http://${aws_instance.notifyops_instance.public_ip}:9091"
    grafana    = "http://${aws_instance.notifyops_instance.public_ip}:3001"
  }
}

output "ssh_command" {
  description = "SSH command to connect to the EC2 instance"
  value       = "ssh -i notifyops-key.pem ec2-user@${aws_instance.notifyops_instance.public_ip}"
} 

output "eks_cluster_name" {
  description = "EKS cluster name"
  value       = module.eks.cluster_name
}

output "eks_cluster_endpoint" {
  description = "EKS cluster endpoint"
  value       = module.eks.cluster_endpoint
}

output "eks_cluster_oidc_issuer_url" {
  description = "EKS cluster OIDC issuer URL"
  value       = module.eks.oidc_provider
}