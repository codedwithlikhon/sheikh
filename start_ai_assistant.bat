@echo off
REM CodeAct AI Assistant Startup Script for Windows
echo 🚀 Starting CodeAct AI Assistant System...

REM Check if required tools are installed
echo 📋 Checking requirements...

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

where python >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Python is not installed. Please install Python 3.11+ first.
    pause
    exit /b 1
)

where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed. Please install Docker first.
    pause
    exit /b 1
)

echo ✅ All requirements satisfied

REM Setup backend
echo 🔧 Setting up backend...
cd backend

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing Python dependencies...
pip install -r requirements.txt

REM Check for OpenAI API key
if "%OPENAI_API_KEY%"=="" (
    echo ⚠️  Warning: OPENAI_API_KEY environment variable not set
    echo    Please set your OpenAI API key:
    echo    set OPENAI_API_KEY=your-api-key-here
)

cd ..

REM Setup frontend
echo 🔧 Setting up frontend...
cd client

REM Install dependencies
echo Installing Node.js dependencies...
npm install

cd ..

REM Start services
echo 🚀 Starting services...

REM Start backend in background
echo Starting backend server...
cd backend
call venv\Scripts\activate.bat
start "Backend Server" cmd /k "python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"
cd ..

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend
echo Starting frontend server...
cd client
start "Frontend Server" cmd /k "npm run dev"
cd ..

echo ✅ Services started successfully!
echo.
echo 🌐 Frontend: http://localhost:3000
echo 🔧 Backend API: http://localhost:8000
echo 📚 API Docs: http://localhost:8000/docs
echo.
echo Press any key to stop all services
pause >nul

echo 🛑 Stopping services...
taskkill /f /im python.exe >nul 2>nul
taskkill /f /im node.exe >nul 2>nul
echo ✅ Services stopped
