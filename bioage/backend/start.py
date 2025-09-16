#!/usr/bin/env python3
"""
Startup script for BioAge FastAPI backend
"""

import uvicorn
import sys
import os
from config import PORT, HOST, DEBUG

def main():
    """Start the FastAPI server"""
    print("🚀 Starting BioAge FastAPI Backend")
    print("=" * 40)
    print(f"Host: {HOST}")
    print(f"Port: {PORT}")
    print(f"Debug: {DEBUG}")
    print(f"WebSocket: ws://{HOST}:{PORT}/ws")
    print("=" * 40)
    
    try:
        uvicorn.run(
            "main:app",
            host=HOST,
            port=PORT,
            reload=DEBUG,
            log_level="info" if not DEBUG else "debug"
        )
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
        sys.exit(0)
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
