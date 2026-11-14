import asyncio
import json
from datetime import datetime
from typing import Set
from fastapi import APIRouter, Depends, Request
from fastapi.responses import StreamingResponse

router = APIRouter(prefix="/sync", tags=["Sync"])

# In-memory pub/sub registry for live multi-device synchronization
_subscribers: Set[asyncio.Queue] = set()

def broadcast_sync_event(event_type: str, data: dict):
    """
    Broadcasts a mutation event (e.g. EVENT_CREATED, EVENT_UPDATED, ATTENDANCE_MARKED)
    to all active mobile and desktop clients subscribed to the SSE stream.
    """
    if not _subscribers:
        return

    payload = {
        "type": event_type,
        "data": data,
        "timestamp": datetime.utcnow().isoformat(),
    }
    msg = f"event: mutation\ndata: {json.dumps(payload)}\n\n"

    for queue in list(_subscribers):
        try:
            queue.put_nowait(msg)
        except Exception:
            # Handle disconnected or full queues safely
            pass

@router.get("/status")
def get_sync_status():
    """
    Returns live sync engine diagnostics including connected devices and timestamp.
    """
    return {
        "status": "online",
        "active_devices_connected": len(_subscribers),
        "timestamp": datetime.utcnow().isoformat(),
        "capabilities": ["sse_stream", "event_broadcast", "instant_push"]
    }

@router.get("/stream")
async def sync_stream(request: Request):
    """
    Server-Sent Events (SSE) streaming endpoint for real-time multi-device sync.
    Mobile devices connect to this stream to receive instant updates when another phone
    adds an event, marks attendance, or updates operational records.
    """
    queue: asyncio.Queue = asyncio.Queue(maxsize=100)
    _subscribers.add(queue)

    async def event_generator():
        # Send initial handshake event
        welcome = {
            "type": "SYNC_CONNECTED",
            "message": "Connected to GeoHub Live Real-Time Sync Engine",
            "timestamp": datetime.utcnow().isoformat(),
        }
        yield f"event: connected\ndata: {json.dumps(welcome)}\n\n"

        try:
            while True:
                # Check for client disconnection
                if await request.is_disconnected():
                    break

                try:
                    # Wait up to 15s for an event, then send keep-alive heartbeat
                    msg = await asyncio.wait_for(queue.get(), timeout=15.0)
                    yield msg
                except asyncio.TimeoutError:
                    # Heartbeat comment to keep carrier / cellular connections active
                    yield ": ping\n\n"
        except asyncio.CancelledError:
            pass
        finally:
            _subscribers.discard(queue)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )

