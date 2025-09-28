#!/bin/bash

# Sheikh Production Build Script
# This script builds all services for production deployment

set -e

echo "🏗️  Building Sheikh for Production..."

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

# Create production docker-compose file
print_status "Creating production docker-compose configuration..."
cat > docker-compose.prod.yml << EOF
version: '3.8'

services:
  # Frontend Service - Production Build
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    ports:
      - "5173:80"
    environment:
      - NODE_ENV=production
      - VITE_API_URL=\${API_URL:-http://localhost:8000}
      - VITE_SANDBOX_URL=\${SANDBOX_URL:-http://localhost:8080}
    networks:
      - sheikh-network

  # Backend Service - Production
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    ports:
      - "8000:8000"
    environment:
      - PYTHONPATH=/app
      - ENVIRONMENT=production
      - DATABASE_URL=\${DATABASE_URL:-postgresql://sheikh:sheikh123@postgres:5432/sheikh}
      - REDIS_URL=\${REDIS_URL:-redis://redis:6379}
      - SANDBOX_URL=\${SANDBOX_URL:-http://sandbox:8080}
    depends_on:
      - redis
      - postgres
      - sandbox
    networks:
      - sheikh-network

  # Sandbox Service - Production
  sandbox:
    build:
      context: ./sandbox
      dockerfile: Dockerfile.prod
    ports:
      - "8080:8080"
      - "5900:5900"
      - "9222:9222"
    environment:
      - NODE_ENV=production
      - WORKSPACE_DIR=/workspace
      - VNC_PASSWORD=\${VNC_PASSWORD:-sheikh123}
      - CHROME_DEBUG_PORT=9222
    volumes:
      - sandbox-workspace:/workspace
    networks:
      - sheikh-network

  # Mock Server - Production
  mockserver:
    build:
      context: ./mockserver
      dockerfile: Dockerfile.prod
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
    networks:
      - sheikh-network

  # Redis - Production
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    networks:
      - sheikh-network
    command: redis-server --appendonly yes

  # PostgreSQL - Production
  postgres:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=\${POSTGRES_DB:-sheikh}
      - POSTGRES_USER=\${POSTGRES_USER:-sheikh}
      - POSTGRES_PASSWORD=\${POSTGRES_PASSWORD:-sheikh123}
    networks:
      - sheikh-network

volumes:
  redis-data:
  postgres-data:
  sandbox-workspace:

networks:
  sheikh-network:
    driver: bridge
EOF

print_success "Production docker-compose configuration created"

# Build all services
print_status "Building all services for production..."
docker-compose -f docker-compose.prod.yml build --no-cache

print_success "All services built successfully!"

# Create production environment file template
print_status "Creating production environment template..."
cat > .env.prod.template << EOF
# Sheikh Production Environment Variables
# Copy this file to .env.prod and update the values

# Database Configuration
DATABASE_URL=postgresql://sheikh:sheikh123@postgres:5432/sheikh
POSTGRES_DB=sheikh
POSTGRES_USER=sheikh
POSTGRES_PASSWORD=sheikh123

# Redis Configuration
REDIS_URL=redis://redis:6379

# Service URLs
API_URL=http://localhost:8000
SANDBOX_URL=http://localhost:8080

# VNC Configuration
VNC_PASSWORD=sheikh123

# Security (Generate strong secrets for production)
JWT_SECRET=your-jwt-secret-here
ENCRYPTION_KEY=your-encryption-key-here
EOF

print_success "Production environment template created"

echo ""
echo "🎉 Production build completed successfully!"
echo ""
echo "📋 Next steps:"
echo "  1. Copy .env.prod.template to .env.prod and update the values"
echo "  2. Run: docker-compose -f docker-compose.prod.yml up -d"
echo ""
echo "🌐 Production URLs:"
echo "  Frontend:    http://localhost:5173"
echo "  Backend:     http://localhost:8000"
echo "  Sandbox:     http://localhost:8080"
echo "  Mock Server: http://localhost:3001"
echo "  VNC:         vnc://localhost:5900"
echo "  Chrome CDP:  http://localhost:9222"
echo ""
print_success "Ready for production deployment! 🚀"

