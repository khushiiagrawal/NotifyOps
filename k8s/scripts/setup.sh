#!/bin/bash

# NotifyOps Kubernetes Setup Script
# This script sets up a Kind cluster with all necessary components

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

# Check if required tools are installed
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if kubectl is installed
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl is not installed. Please install kubectl first."
        exit 1
    fi
    
    # Check if kind is installed
    if ! command -v kind &> /dev/null; then
        print_error "kind is not installed. Please install kind first."
        exit 1
    fi
    
    # Check if docker is running
    if ! docker info &> /dev/null; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    
    print_success "All prerequisites are satisfied!"
}

# Create Kind cluster configuration
create_cluster_config() {
    print_status "Creating Kind cluster configuration..."
    
    cat > kind-config.yaml << EOF
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
name: notifyops-cluster
nodes:
- role: control-plane
  extraPortMappings:
  - containerPort: 80
    hostPort: 80
    protocol: TCP
  - containerPort: 443
    hostPort: 443
    protocol: TCP
  - containerPort: 3000
    hostPort: 3000
    protocol: TCP
  - containerPort: 8080
    hostPort: 8080
    protocol: TCP
  - containerPort: 9090
    hostPort: 9090
    protocol: TCP
- role: worker
- role: worker
EOF
    
    print_success "Kind cluster configuration created!"
}

# Create Kind cluster
create_cluster() {
    print_status "Creating Kind cluster..."
    
    # Check if cluster already exists
    if kind get clusters | grep -q "notifyops-cluster"; then
        print_warning "Cluster 'notifyops-cluster' already exists. Deleting it..."
        kind delete cluster --name notifyops-cluster
    fi
    
    # Create new cluster
    kind create cluster --name notifyops-cluster --config kind-config.yaml
    
    print_success "Kind cluster created successfully!"
}

# Install NGINX Ingress Controller
install_ingress() {
    print_status "Installing NGINX Ingress Controller..."
    
    kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml
    
    # Wait for ingress controller to be ready
    print_status "Waiting for Ingress Controller to be ready..."
    kubectl wait --namespace ingress-nginx \
        --for=condition=ready pod \
        --selector=app.kubernetes.io/component=controller \
        --timeout=300s
    
    print_success "NGINX Ingress Controller installed!"
}

# Install metrics server
install_metrics_server() {
    print_status "Installing Metrics Server..."
    
    kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
    
    # Wait for metrics server to be ready
    print_status "Waiting for Metrics Server to be ready..."
    kubectl wait --namespace kube-system \
        --for=condition=ready pod \
        --selector=k8s-app=metrics-server \
        --timeout=300s
    
    print_success "Metrics Server installed!"
}

# Build and load Docker images
build_images() {
    print_status "Building and loading Docker images..."
    
    # Build NotifyOps backend image
    print_status "Building NotifyOps backend image..."
    docker build -t notifyops:latest .
    kind load docker-image notifyops:latest --name notifyops-cluster
    
    # Build web application image
    print_status "Building web application image..."
    docker build -t notifyops-web:latest ./web
    kind load docker-image notifyops-web:latest --name notifyops-cluster
    
    print_success "Docker images built and loaded!"
}

# Main execution
main() {
    echo "=========================================="
    echo "    NotifyOps Kubernetes Setup Script"
    echo "=========================================="
    echo ""
    
    check_prerequisites
    create_cluster_config
    create_cluster
    install_ingress
    install_metrics_server
    build_images
    
    echo ""
    echo "=========================================="
    print_success "Setup completed successfully!"
    echo "=========================================="
    echo ""
    echo "Next steps:"
    echo "1. Update your secrets in k8s/base/secrets.yaml"
    echo "2. Run: ./k8s/scripts/deploy.sh"
    echo "3. Access your application at: http://localhost"
    echo ""
    echo "Useful commands:"
    echo "- Check cluster status: kubectl cluster-info"
    echo "- View all resources: kubectl get all -n notifyops"
    echo "- View logs: kubectl logs -f deployment/notifyops-deployment -n notifyops"
    echo ""
}

# Run main function
main "$@"