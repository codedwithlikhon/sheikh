#!/bin/bash

# Start all services in development mode
echo "Starting Sheikh development environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "Docker is not running. Please start Docker and try again."
  exit 1
fi

# Build and start all services
docker-compose up --build

# The script will keep running until docker-compose is stopped