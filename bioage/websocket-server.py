#!/usr/bin/env python3
"""
WebSocket server for BioAge analysis
Handles real-time image processing and forwards to external service
"""
import asyncio
import websockets
import json
import time
import random
import logging
import base64
from typing import Set, Optional, Union

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("bioage_ws")

# Configuration
HOST = 'localhost'
PORT = 8081
EXTERNAL_WS_BASE = 'wss://echoage.gladyshevlab.org/api/ws'

# Store active connections
active_connections: Set[websockets.WebSocketServerProtocol] = set()


def _extract_bytes_from_message(message: Union[str, bytes]) -> bytes:
    """
    Accepts either:
      - data URL strings like 'data:image/jpeg;base64,...'
      - raw base64 strings
      - raw bytes
    Returns bytes suitable to send to the external WS.
    """
    if isinstance(message, (bytes, bytearray)):
        return bytes(message)

    # text path
    msg = message.strip()

    # data URL?
    if msg.startswith("data:image/"):
        try:
            header, b64data = msg.split(",", 1)
        except ValueError:
            return b""
        # Ensure it's base64 (typical format: data:image/jpeg;base64,...)
        try:
            return base64.b64decode(b64data, validate=False)
        except Exception:
            # maybe the entire msg is already just base64y
            try:
                return base64.b64decode(msg, validate=False)
            except Exception:
                return b""

    # maybe plain base64
    try:
        return base64.b64decode(msg, validate=False)
    except Exception:
        # fallback: as-is bytes
        return msg.encode("utf-8", errors="ignore")

def _safe_parse_json_maybe_bytes(response: Union[str, bytes]):
    """Try to parse JSON, accepting bytes or str, return (data_or_none, text_repr)"""
    if isinstance(response, (bytes, bytearray)):
        try:
            text = response.decode("utf-8", errors="replace")
        except Exception:
            text = ""
    else:
        text = response

    try:
        return json.loads(text), text
    except json.JSONDecodeError:
        return None, text

async def forward_to_external_service(image_payload: Union[str, bytes]) -> dict:
    """Forward image data (bytes) to external bioage service and handle fallbacks"""
    try:
        # External service is always enabled - no mock data

        # Convert incoming message into raw bytes for external service
        payload_bytes = _extract_bytes_from_message(image_payload)

        # Validate image data
        if not payload_bytes or len(payload_bytes) < 1000:
            logger.warning("⚠️ Image data too small or invalid")
            return {
                "error": "Image data too small for analysis",
                "timestamp": time.time()
            }

        # Generate client ID for external service
        client_id = f"client-client-{int(time.time() * 1000)}{random.randint(1000, 9999)}"
        external_url = f"{EXTERNAL_WS_BASE}/{client_id}"

        logger.info(f"🔗 Connecting to external service: {external_url}")

        # The external service expects JSON format with image data
        async with websockets.connect(external_url, timeout=10) as ws:
            logger.info(f"📤 Sending image data ({len(payload_bytes)} bytes)")
            
            # Convert bytes to base64 for JSON transmission
            image_base64 = base64.b64encode(payload_bytes).decode('utf-8')
            
            # Send as JSON payload
            json_payload = {
                "image": image_base64,
                "client_id": client_id,
                "timestamp": time.time()
            }
            
            await ws.send(json.dumps(json_payload))
            logger.info("📤 Sent JSON payload with image data to external service")

            # Wait for response
            response = await asyncio.wait_for(ws.recv(), timeout=30)
            rjson, rtext = _safe_parse_json_maybe_bytes(response)

            if rjson is not None:
                logger.info(f"✅ Parsed JSON response: {list(rjson.keys()) if isinstance(rjson, dict) else type(rjson)}")
                logger.debug(f"📋 Full response: {rjson}")

                # Check for error in JSON
                if isinstance(rjson, dict) and 'error' in rjson:
                    err = str(rjson.get('error'))
                    logger.warning(f"⚠️ External service returned error: {err}")
                    return {
                        "error": f"External service error: {err}",
                        "timestamp": time.time()
                    }

                # Looks good
                logger.info("🎉 Received valid analysis data from external service!")
                return rjson

            # Not JSON: inspect text for error-ish content
            text_sample = (rtext or "")[:200]
            logger.warning(f"⚠️ Non-JSON response. Sample: {text_sample!r}")
            return {
                "error": f"External service returned invalid response: {text_sample}",
                "timestamp": time.time()
            }

    except Exception as e:
        logger.error(f"❌ External service error: {e}")
        return {
            "error": f"External service error: {str(e)}",
            "timestamp": time.time()
        }

async def handle_client(websocket: websockets.WebSocketServerProtocol, *handler_args):
    """
    Handle individual client connections.

    websockets<=10 provides (websocket, path).
    websockets>=11 passes only (websocket); we accept *args for compatibility.
    """
    path = handler_args[0] if handler_args else ""
    client_id = (path.split('/')[-1] if '/' in path else 'unknown') or 'unknown'
    logger.info(f"🔌 New client connected: {client_id}")

    active_connections.add(websocket)
    try:
        async for message in websocket:
            size = len(message) if isinstance(message, (bytes, bytearray)) else len(message.encode('utf-8', errors='ignore'))
            logger.info(f"📨 Received message from {client_id} ({size} bytes)")

            is_data_url = isinstance(message, str) and message.startswith('data:image/')
            is_binary = isinstance(message, (bytes, bytearray))

            if is_data_url or is_binary:
                logger.info("🖼️ Processing image for bioage analysis...")
                result = await forward_to_external_service(message)
                await websocket.send(json.dumps(result))
                logger.info(f"📤 Sent analysis result to {client_id}")
            else:
                # Handle other text message types if you need control messages later
                preview = message[:100] if isinstance(message, str) else str(message)[:100]
                logger.info(f"📝 Received non-image message: {preview}...")
    except websockets.exceptions.ConnectionClosed:
        logger.info(f"🔌 Client {client_id} disconnected")
    except Exception as e:
        logger.error(f"❌ Error handling client {client_id}: {e}")
    finally:
        active_connections.discard(websocket)

async def main():
    """Start the WebSocket server"""
    logger.info("🚀 Starting BioAge WebSocket Server")
    logger.info(f"🌐 Server will run on ws://{HOST}:{PORT}")
    logger.info(f"🔗 External service base: {EXTERNAL_WS_BASE}")
    logger.info("=" * 60)

    # Start WebSocket server
    server = await websockets.serve(
        handle_client,
        HOST,
        PORT,
        ping_interval=20,
        ping_timeout=10,
        max_size=16 * 1024 * 1024,  # 16MB frames to be friendly to larger images
    )

    logger.info(f"✅ WebSocket server running on ws://{HOST}:{PORT}")
    logger.info("Press Ctrl+C to stop the server")

    try:
        await asyncio.Future()  # run forever
    except KeyboardInterrupt:
        logger.info("\n🛑 Shutting down server...")
    finally:
        server.close()
        await server.wait_closed()
        logger.info("👋 Server stopped")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("🛑 Server stopped by user")
    except Exception as e:
        logger.error(f"❌ Server error: {e}")
