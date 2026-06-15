@echo off
echo Starting Food Waste AI Documentation Site...
echo.

if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    echo.
)

echo Starting development server...
call npm run dev
