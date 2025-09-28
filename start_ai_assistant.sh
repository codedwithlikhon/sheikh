#!/bin/bash

# CodeAct AI Assistant Startup Script
echo "🚀 Starting CodeAct AI Assistant System..."

# Check if required tools are installed
check_requirements() {
    echo "📋 Checking requirements..."
    
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    if ! command -v python3 &> /dev/null; then
        echo "❌ Python 3 is not installed. Please install Python 3.11+ first."
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    echo "✅ All requirements satisfied"
}

# Setup backend
setup_backend() {
    echo "🔧 Setting up backend..."
    cd backend
    
    # Create virtual environment if it doesn't exist
    if [ ! -d "venv" ]; then
        echo "Creating Python virtual environment..."
        python3 -m venv venv
    fi
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Install dependencies
    echo "Installing Python dependencies..."
    pip install -r requirements.txt
    
    # Check for OpenAI API key
    if [ -z "$OPENAI_API_KEY" ]; then
        echo "⚠️  Warning: OPENAI_API_KEY environment variable not set"
        echo "   Please set your OpenAI API key:"
        echo "   export OPENAI_API_KEY='your-api-key-here'"
    fi
    
    cd ..
}

# Setup frontend
setup_frontend() {
    echo "🔧 Setting up frontend..."
    cd client
    
    # Install dependencies
    echo "Installing Node.js dependencies..."
    npm install
    
    cd ..
}

# Start services
start_services() {
    echo "🚀 Starting services..."
    
    # Start backend in background
    echo "Starting backend server..."
    cd backend
    source venv/bin/activate
    python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
    BACKEND_PID=$!
    cd ..
    
    # Wait a moment for backend to start
    sleep 3
    
    # Start frontend
    echo "Starting frontend server..."
    cd client
    npm run dev &
    FRONTEND_PID=$!
    cd ..
    
    echo "✅ Services started successfully!"
    echo ""
    echo "🌐 Frontend: http://localhost:3000"
    echo "🔧 Backend API: http://localhost:8000"
    echo "📚 API Docs: http://localhost:8000/docs"
    echo ""
    echo "Press Ctrl+C to stop all services"
    
    # Wait for user to stop
    wait
}

# Cleanup function
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Services stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Main execution
main() {
    check_requirements
    setup_backend
    setup_frontend
    start_services
}

# Run main function
main
