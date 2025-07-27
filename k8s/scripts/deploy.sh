#!/bin/bash

# NotifyOps Kubernetes Deployment Script
# This script deploys all components to the Kubernetes cluster

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if cluster exists
check_cluster() {
    print_status "Checking if Kind cluster exists..."
    
    if ! kind get clusters | grep -q "notifyops-cluster"; then
        print_error "Kind cluster 'notifyops-cluster' not found."
        echo "Please run: ./k8s/scripts/setup-kind.sh"
        exit 1
    fi
    
    print_success "Kind cluster found!"
}

# Check if secrets are configured
check_secrets() {
    print_status "Checking secrets configuration..."
    
    if [ ! -f "k8s/base/secrets.yaml" ]; then
        print_error "Secrets file not found: k8s/base/secrets.yaml"
        echo "Please create the secrets file with your actual values."
        exit 1
    fi
    
    # Check if secrets contain placeholder values
    if grep -q "<base64-encoded" k8s/base/secrets.yaml; then
        print_warning "Secrets file contains placeholder values."
        echo "Please update k8s/base/secrets.yaml with your actual base64-encoded secrets."
        exit 1
    fi
    
    print_success "Secrets configuration looks good!"
}

# Deploy base components
deploy_base() {
    print_status "Deploying base components..."
    
    kubectl apply -f k8s/base/namespace.yaml
    kubectl apply -f k8s/base/configmap.yaml
    kubectl apply -f k8s/base/secrets.yaml
    kubectl apply -f k8s/base/service-account.yaml
    kubectl apply -f k8s/base/rbac.yaml
    kubectl apply -f k8s/base/pvc.yaml
    
    print_success "Base components deployed!"
}

# Deploy monitoring stack
deploy_monitoring() {
    print_status "Deploying monitoring stack..."
    
    # Deploy Prometheus
    kubectl apply -f k8s/apps/prometheus/
    
    # Deploy Grafana
    kubectl apply -f k8s/apps/grafana/
    
    print_success "Monitoring stack deployed!"
}

# Deploy applications
deploy_applications() {
    print_status "Deploying applications..."
    
    # Deploy NotifyOps backend
    kubectl apply -f k8s/apps/notifyops/
    
    # Deploy web application
    kubectl apply -f k8s/apps/web/
    
    print_success "Applications deployed!"
}

# Wait for deployments to be ready
wait_for_deployments() {
    print_status "Waiting for deployments to be ready..."
    
    # Wait for NotifyOps backend
    kubectl wait --for=condition=available --timeout=300s deployment/notifyops-deployment -n notifyops
    
    # Wait for web application
    kubectl wait --for=condition=available --timeout=300s deployment/web-deployment -n notifyops
    
    # Wait for Prometheus
    kubectl wait --for=condition=available --timeout=300s deployment/prometheus-deployment -n notifyops
    
    # Wait for Grafana
    kubectl wait --for=condition=available --timeout=300s deployment/grafana-deployment -n notifyops
    
    print_success "All deployments are ready!"
}

# Show deployment status
show_status() {
    print_status "Deployment status:"
    echo ""
    
    echo "Pods:"
    kubectl get pods -n notifyops
    
    echo ""
    echo "Services:"
    kubectl get services -n notifyops
    
    echo ""
    echo "Ingress:"
    kubectl get ingress -n notifyops
    
    echo ""
    echo "Persistent Volume Claims:"
    kubectl get pvc -n notifyops
}

# Show access information
show_access_info() {
    echo ""
    echo "=========================================="
    print_success "Deployment completed successfully!"
    echo "=========================================="
    echo ""
    echo "Access your application:"
    echo "- Main Application: http://localhost"
    echo "- Grafana Dashboard: http://localhost/grafana"
    echo "- Prometheus UI: http://localhost/prometheus"
    echo ""
    echo "Default credentials:"
    echo "- Grafana: admin/admin"
    echo ""
    echo "Useful commands:"
    echo "- View logs: kubectl logs -f deployment/notifyops-deployment -n notifyops"
    echo "- Check metrics: kubectl top pods -n notifyops"
    echo "- Scale deployment: kubectl scale deployment notifyops-deployment --replicas=3 -n notifyops"
    echo ""
}

# Main execution
main() {
    echo "=========================================="
    echo "    NotifyOps Kubernetes Deployment"
    echo "=========================================="
    echo ""
    
    check_cluster
    check_secrets
    deploy_base
    deploy_monitoring
    deploy_applications
    wait_for_deployments
    show_status
    show_access_info
}

# Run main function
main "$@"