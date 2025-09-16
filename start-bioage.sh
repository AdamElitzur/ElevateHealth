#!/bin/bash

# Start BioAge Analysis Application
# This script starts both the Next.js frontend and the WebSocket server

echo "🚀 Starting ElevateHealth BioAge Analysis Application"
echo "=================================================="

# Function to cleanup background processes
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    if [ ! -z "$NEXTJS_PID" ]; then
        kill $NEXTJS_PID 2>/dev/null
    fi
    if [ ! -z "$WEBSOCKET_PID" ]; then
        kill $WEBSOCKET_PID 2>/dev/null
    fi
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 is required but not installed."
    exit 1
fi

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed."
    exit 1
fi

# Install Python dependencies for WebSocket server
echo "📦 Installing Python dependencies..."
cd bioage
pip3 install websockets asyncio 2>/dev/null || echo "⚠️  Could not install Python dependencies automatically"

# Start WebSocket server in background
echo "🔌 Starting WebSocket server on port 8081..."
python3 websocket-server.py &
WEBSOCKET_PID=$!

# Wait a moment for WebSocket server to start
sleep 2

# Go back to project root
cd ..

# Start Next.js development server
echo "🌐 Starting Next.js development server on port 3000..."
npm run dev &
NEXTJS_PID=$!

echo ""
echo "✅ Both servers are starting up..."
echo "🌐 Frontend: http://localhost:3000"
echo "🔌 WebSocket: ws://localhost:8081"
echo "📊 BioAge Analysis: http://localhost:3000/bioage-analysis"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for both processes
wait
