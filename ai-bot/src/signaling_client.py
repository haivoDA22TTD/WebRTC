import asyncio
import json
import websockets
from typing import Callable, Optional
import config

class SignalingClient:
    def __init__(self):
        self.ws: Optional[websockets.WebSocketClientProtocol] = None
        self.handlers: dict[str, list[Callable]] = {}
        self.connected = False
        self.room_id = None
        self.user_id = None

    async def connect(self, token: str = None):
        """Connect to signaling server"""
        url = config.SIGNALING_URL
        if token:
            url = f"{url}?token={token}"

        try:
            self.ws = await websockets.connect(url)
            self.connected = True
            print(f"✅ Connected to signaling server")
            
            # Start message listener
            asyncio.create_task(self._listen())
            return True
        except Exception as e:
            print(f"❌ Connection failed: {e}")
            return False

    async def _listen(self):
        """Listen for incoming messages"""
        try:
            async for message in self.ws:
                data = json.loads(message)
                msg_type = data.get("type")
                
                # Call registered handlers
                if msg_type in self.handlers:
                    for handler in self.handlers[msg_type]:
                        asyncio.create_task(handler(data))
                
                # Also call 'message' handlers for all messages
                if "message" in self.handlers:
                    for handler in self.handlers["message"]:
                        asyncio.create_task(handler(data))
                        
        except websockets.exceptions.ConnectionClosed:
            print("⚠️ WebSocket connection closed")
            self.connected = False

    def on(self, event: str, handler: Callable):
        """Register event handler"""
        if event not in self.handlers:
            self.handlers[event] = []
        self.handlers[event].append(handler)

    async def send(self, data: dict):
        """Send message to server"""
        if self.ws and self.connected:
            await self.ws.send(json.dumps(data))

    async def join_room(self, room_id: str, user_id: str, display_name: str):
        """Join a room"""
        self.room_id = room_id
        self.user_id = user_id
        await self.send({
            "type": "join",
            "roomId": room_id,
            "userId": user_id,
            "displayName": display_name
        })
        print(f"📥 Joining room: {room_id}")

    async def leave_room(self):
        """Leave current room"""
        if self.room_id:
            await self.send({
                "type": "leave",
                "roomId": self.room_id
            })
            print(f"📤 Left room: {self.room_id}")
            self.room_id = None

    async def send_offer(self, target_id: str, offer: dict):
        """Send WebRTC offer"""
        await self.send({
            "type": "offer",
            "targetId": target_id,
            "payload": offer
        })

    async def send_answer(self, target_id: str, answer: dict):
        """Send WebRTC answer"""
        await self.send({
            "type": "answer",
            "targetId": target_id,
            "payload": answer
        })

    async def send_ice_candidate(self, target_id: str, candidate: dict):
        """Send ICE candidate"""
        await self.send({
            "type": "ice-candidate",
            "targetId": target_id,
            "payload": candidate
        })

    async def send_chat(self, content: str, sender_name: str):
        """Send chat message"""
        await self.send({
            "type": "chat",
            "roomId": self.room_id,
            "content": content,
            "senderName": sender_name
        })

    async def disconnect(self):
        """Disconnect from server"""
        if self.ws:
            await self.ws.close()
            self.connected = False
            print("🔌 Disconnected from signaling server")
