import json
import logging
from typing import Dict, List, Set, Any
from fastapi import WebSocket, WebSocketDisconnect

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        # Map trip_id -> Dict[user_id -> List[WebSocket]]
        self.active_rooms: Dict[str, Dict[str, List[WebSocket]]] = {}

    async def connect(self, websocket: WebSocket, trip_id: str, user_id: str):
        await websocket.accept()
        if trip_id not in self.active_rooms:
            self.active_rooms[trip_id] = {}
        if user_id not in self.active_rooms[trip_id]:
            self.active_rooms[trip_id][user_id] = []
        self.active_rooms[trip_id][user_id].append(websocket)
        logger.info(f"WebSocket connected: user {user_id} in trip room {trip_id}")

    def disconnect(self, websocket: WebSocket, trip_id: str, user_id: str):
        if trip_id in self.active_rooms and user_id in self.active_rooms[trip_id]:
            if websocket in self.active_rooms[trip_id][user_id]:
                self.active_rooms[trip_id][user_id].remove(websocket)
            if not self.active_rooms[trip_id][user_id]:
                del self.active_rooms[trip_id][user_id]
            if not self.active_rooms[trip_id]:
                del self.active_rooms[trip_id]
        logger.info(f"WebSocket disconnected: user {user_id} from trip room {trip_id}")

    async def broadcast_to_trip(self, trip_id: str, payload: dict):
        if trip_id not in self.active_rooms:
            return

        message_str = json.dumps(payload, default=str)
        dead_connections = []

        for user_id, sockets in self.active_rooms[trip_id].items():
            for ws in sockets:
                try:
                    await ws.send_text(message_str)
                except Exception as e:
                    logger.warning(f"Error sending message to socket for user {user_id}: {e}")
                    dead_connections.append((user_id, ws))

        # Cleanup dead sockets
        for user_id, ws in dead_connections:
            self.disconnect(ws, trip_id, user_id)

    def get_online_users(self, trip_id: str) -> List[str]:
        if trip_id not in self.active_rooms:
            return []
        return list(self.active_rooms[trip_id].keys())

ws_manager = ConnectionManager()
