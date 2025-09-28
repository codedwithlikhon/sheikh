#!/bin/bash

# Sheikh Development Environment Setup Script
# This script sets up the development environment for all services

set -e

echo "🚀 Setting up Sheikh Development Environment..."

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

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose and try again."
    exit 1
fi

print_status "Installing dependencies for all services..."

# Install frontend dependencies
if [ -d "frontend" ]; then
    print_status "Installing frontend dependencies..."
    cd frontend
    if [ ! -f "package.json" ]; then
        print_warning "No package.json found in frontend directory. Skipping..."
    else
        npm install
        print_success "Frontend dependencies installed"
    fi
    cd ..
fi

# Install backend dependencies
if [ -d "backend" ]; then
    print_status "Installing backend dependencies..."
    cd backend
    if [ ! -f "requirements.txt" ]; then
        print_warning "No requirements.txt found in backend directory. Skipping..."
    else
        python -m pip install -r requirements.txt
        print_success "Backend dependencies installed"
    fi
    cd ..
fi

# Install sandbox dependencies
if [ -d "sandbox" ]; then
    print_status "Installing sandbox dependencies..."
    cd sandbox
    if [ ! -f "package.json" ]; then
        print_warning "No package.json found in sandbox directory. Skipping..."
    else
        npm install
        print_success "Sandbox dependencies installed"
    fi
    cd ..
fi

# Install mockserver dependencies
if [ -d "mockserver" ]; then
    print_status "Installing mockserver dependencies..."
    cd mockserver
    if [ ! -f "package.json" ]; then
        print_warning "No package.json found in mockserver directory. Skipping..."
    else
        npm install
        print_success "Mockserver dependencies installed"
    fi
    cd ..
fi

print_status "Building Docker images..."
docker-compose build

print_status "Starting all services in development mode..."
docker-compose up -d

print_success "All services started successfully!"
echo ""
echo "🌐 Service URLs:"
echo "  Frontend:    http://localhost:5173"
echo "  Backend:     http://localhost:8000"
echo "  Sandbox:     http://localhost:8080"
echo "  Mock Server: http://localhost:3001"
echo "  VNC:         vnc://localhost:5900 (password: sheikh123)"
echo "  Chrome CDP:  http://localhost:9222"
echo ""
echo "📊 To view logs:"
echo "  docker-compose logs -f [service_name]"
echo ""
echo "🛑 To stop all services:"
echo "  docker-compose down"
echo ""
print_success "Development environment is ready! 🎉"

