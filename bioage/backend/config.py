import os
from dotenv import load_dotenv

load_dotenv()

# Configuration settings
PORT = int(os.getenv("PORT", 8001))
HOST = os.getenv("HOST", "0.0.0.0")
DEBUG = os.getenv("DEBUG", "true").lower() == "true"
NODE_ENV = os.getenv("NODE_ENV", "development")

# External service configuration
EXTERNAL_WS_URL = "wss://echoage.gladyshevlab.org/api/ws/client-client-1757879357587"

# CORS settings
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001"
]

# WebSocket settings
WS_TIMEOUT = 30  # seconds
MAX_CONNECTIONS = 100
