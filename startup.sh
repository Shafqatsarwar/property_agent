#!/bin/bash
# startup.sh - Startup script for Property Agent

echo "Starting Property Real Estate Agent..."

# Check if node_modules exists, if not install dependencies
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "Warning: .env file not found. Please create one based on .env.example"
fi

# Start the application
echo "Starting server..."
node index.js