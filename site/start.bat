@echo off
REM SmartFoodSave Backend + Frontend Startup Script (Windows)
REM This script starts both the backend server and frontend dev server

echo.
echo 🚀 SmartFoodSave Startup Script
echo ================================
echo.

REM Check if node_modules exist
if not exist "node_modules\" (
    echo 📦 Installing dependencies...
    call npm install
)

REM Check if backend .env exists
if not exist "server\.env" (
    echo.
    echo ⚠️  server\.env not found!
    echo Please create server\.env from server\.env.example
    echo See BACKEND_FRONTEND_SETUP.md for instructions
    echo.
    pause
    exit /b 1
)

REM Check if frontend .env exists
if not exist ".env" (
    echo Creating .env from .env.example...
    copy .env.example .env
)

echo.
echo Starting services...
echo -------------------
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Open two terminals and run:
echo   Terminal 1: npm run server
echo   Terminal 2: npm run dev
echo.
echo Or press any key to open Terminal 1...
pause

REM Start backend in a new terminal
start "SmartFoodSave Backend" cmd /k "npm run server"

REM Wait a moment for backend to start
timeout /t 2 /nobreak

REM Start frontend in a new terminal
start "SmartFoodSave Frontend" cmd /k "npm run dev"

echo.
echo ✅ Both services are starting in separate terminals
echo.
pause
