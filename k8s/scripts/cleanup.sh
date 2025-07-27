#!/bin/bash

# NotifyOps Kubernetes Cleanup Script
# This script cleans up the Kubernetes deployment

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

# Confirm cleanup
confirm_cleanup() {
    echo "=========================================="
    echo "    NotifyOps Kubernetes Cleanup"
    echo "=========================================="
    echo ""
    print_warning "This will delete all NotifyOps resources from the cluster."
    echo ""
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Cleanup cancelled."
        exit 0
    fi
}

# Cleanup applications
cleanup_applications() {
    print_status "Cleaning up applications..."
    
    # Delete application resources
    kubectl delete -f k8s/apps/notifyops/ --ignore-not-found=true
    kubectl delete -f k8s/apps/web/ --ignore-not-found=true
    
    print_success "Applications cleaned up!"
}

# Cleanup monitoring
cleanup_monitoring() {
    print_status "Cleaning up monitoring stack..."
    
    # Delete monitoring resources
    kubectl delete -f k8s/apps/prometheus/ --ignore-not-found=true
    kubectl delete -f k8s/apps/grafana/ --ignore-not-found=true
    
    print_success "Monitoring stack cleaned up!"
}

# Cleanup base components
cleanup_base() {
    print_status "Cleaning up base components..."
    
    # Delete base resources
    kubectl delete -f k8s/base/ --ignore-not-found=true
    
    print_success "Base components cleaned up!"
}

# Cleanup namespace
cleanup_namespace() {
    print_status "Cleaning up namespace..."
    
    # Delete namespace (this will delete all resources in it)
    kubectl delete namespace notifyops --ignore-not-found=true
    
    print_success "Namespace cleaned up!"
}

# Cleanup cluster (optional)
cleanup_cluster() {
    echo ""
    read -p "Do you want to delete the entire Kind cluster? (y/N): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Deleting Kind cluster..."
        kind delete cluster --name notifyops-cluster
        print_success "Kind cluster deleted!"
    else
        print_status "Kind cluster preserved."
    fi
}

# Show cleanup status
show_cleanup_status() {
    print_status "Cleanup status:"
    echo ""
    
    # Check if namespace still exists
    if kubectl get namespace notifyops &> /dev/null; then
        print_warning "Namespace 'notifyops' still exists."
        echo "You can manually delete it with: kubectl delete namespace notifyops"
    else
        print_success "Namespace 'notifyops' has been deleted."
    fi
    
    # Check if cluster still exists
    if kind get clusters | grep -q "notifyops-cluster"; then
        print_status "Kind cluster 'notifyops-cluster' still exists."
    else
        print_success "Kind cluster has been deleted."
    fi
}

# Main execution
main() {
    confirm_cleanup
    cleanup_applications
    cleanup_monitoring
    cleanup_base
    cleanup_namespace
    cleanup_cluster
    show_cleanup_status
    
    echo ""
    echo "=========================================="
    print_success "Cleanup completed!"
    echo "=========================================="
    echo ""
}

# Run main function
main "$@"