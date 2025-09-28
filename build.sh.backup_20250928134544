#!/bin/bash

# Build all services for production
echo "Building Sheikh for production..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "Docker is not running. Please start Docker and try again."
  exit 1
fi

# Build all services
docker-compose build

echo "Build completed successfully!"
echo "To start the application, run: docker-compose up -d"