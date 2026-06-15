#!/bin/bash

echo "Starting Food Waste AI Documentation Site..."
echo ""

if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    echo ""
fi

echo "Starting development server..."
npm run dev
