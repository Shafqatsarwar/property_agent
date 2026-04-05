@echo off
echo Starting Property Real Estate Agent...

REM Check if node_modules exists, if not install dependencies
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
)

REM Check if .env file exists
if not exist ".env" (
    echo Warning: .env file not found. Please create one based on .env.example
)

REM Start the application
echo Starting server...
node index.js
pause