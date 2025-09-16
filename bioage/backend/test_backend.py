#!/usr/bin/env python3
"""
Test script for BioAge FastAPI backend
"""

import asyncio
import websockets
import json
import requests

async def test_websocket():
    """Test WebSocket connection to backend"""
    try:
        print("🔌 Testing WebSocket connection to backend...")
        async with websockets.connect("ws://localhost:3001/ws") as websocket:
            print("✅ Connected to backend WebSocket")
            
            # Send a test message
            test_message = "Hello from test client"
            await websocket.send(test_message)
            print(f"📤 Sent test message: {test_message}")
            
            # Wait for response
            response = await asyncio.wait_for(websocket.recv(), timeout=5.0)
            print(f"📥 Received response: {response}")
            
    except Exception as e:
        print(f"❌ WebSocket test failed: {e}")

def test_http_endpoints():
    """Test HTTP endpoints"""
    base_url = "http://localhost:3001"
    
    print("\n🌐 Testing HTTP endpoints...")
    
    # Test root endpoint
    try:
        response = requests.get(f"{base_url}/")
        print(f"✅ Root endpoint: {response.status_code} - {response.json()}")
    except Exception as e:
        print(f"❌ Root endpoint failed: {e}")
    
    # Test health endpoint
    try:
        response = requests.get(f"{base_url}/health")
        print(f"✅ Health endpoint: {response.status_code} - {response.json()}")
    except Exception as e:
        print(f"❌ Health endpoint failed: {e}")
    
    # Test external service connection
    try:
        response = requests.get(f"{base_url}/test-external")
        print(f"✅ External service test: {response.status_code} - {response.json()}")
    except Exception as e:
        print(f"❌ External service test failed: {e}")

async def main():
    """Run all tests"""
    print("🧪 BioAge Backend Test Suite")
    print("=" * 40)
    
    # Test HTTP endpoints first
    test_http_endpoints()
    
    # Test WebSocket
    await test_websocket()
    
    print("\n✅ Test suite completed")

if __name__ == "__main__":
    asyncio.run(main())
