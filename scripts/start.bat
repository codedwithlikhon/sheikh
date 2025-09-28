@echo off
echo Starting CodeAct AI Agent...
echo.

echo Installing dependencies...
call npm run install-all

echo.
echo Starting development servers...
echo Frontend: http://localhost:3000
echo Backend: http://localhost:3001
echo.

call npm run dev
