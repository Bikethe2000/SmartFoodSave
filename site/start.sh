#!/bin/bash
# SmartFoodSave Backend + Frontend Startup Script
# This script starts both the backend server and frontend dev server in separate processes

echo "🚀 SmartFoodSave Startup Script"
echo "================================"

# Check if node_modules exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if backend .env exists
if [ ! -f "server/.env" ]; then
    echo "⚠️  server/.env not found!"
    echo "Please create server/.env from server/.env.example"
    echo "See BACKEND_FRONTEND_SETUP.md for instructions"
    exit 1
fi

# Check if frontend .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env not found!"
    echo "Creating .env from .env.example..."
    cp .env.example .env
fi

echo ""
echo "Starting services..."
echo "-------------------"
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both services"
echo ""

# Start backend in background
npm run server &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Start frontend
npm run dev

# Kill backend when frontend stops
kill $BACKEND_PID 2>/dev/null
