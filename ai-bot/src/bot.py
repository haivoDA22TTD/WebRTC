import asyncio
import aiohttp
from typing import Optional
import config
from .auth_client import AuthClient
from .signaling_client import SignalingClient
from .webrtc_client import WebRTCClient
from .video_generator import VideoGenerator
from .chatbot import ChatBot
from .tts_service import TTSService

class AIBot:
    def __init__(self):
        self.auth = AuthClient()
        self.signaling = SignalingClient()
        self.video_generator = VideoGenerator()
        self.webrtc = WebRTCClient(self.video_generator)
        self.chatbot = ChatBot()
        self.tts = TTSService()
        
        self.room_id: Optional[str] = None
        self.is_running = False

    async def start(self, room_code: str):
        """Start the bot and join a room"""
        print("🤖 Starting AI Bot...")
        
        # Register and login
        await self.auth.register()
        if not await self.auth.login():
            print("❌ Failed to authenticate")
            return False

        # Connect to signaling server
        if not await self.signaling.connect(self.auth.token):
            print("❌ Failed to connect to signaling server")
            return False

        # Join room via API
        room = await self._join_room_api(room_code)
        if not room:
            print("❌ Failed to join room")
            return False

        self.room_id = room.get("id")
        
        # Setup event handlers
        self._setup_handlers()
        
        # Join room via signaling
        await self.signaling.join_room(
            self.room_id,
            self.auth.user["id"],
            config.BOT_DISPLAY_NAME
        )

        self.is_running = True
        print(f"✅ Bot joined room: {room_code}")
        
        # Send greeting
        await self._send_greeting()
        
        return True

    async def _join_room_api(self, room_code: str) -> Optional[dict]:
        """Join room via REST API"""
        async with aiohttp.ClientSession() as session:
            try:
                async with session.post(
                    f"{config.ROOM_URL}/rooms/join/{room_code}",
                    headers=self.auth.get_headers()
                ) as resp:
                    if resp.status == 200:
                        return await resp.json()
                    else:
                        print(f"❌ Join room failed: {resp.status}")
                        return None
            except Exception as e:
                print(f"❌ Join room error: {e}")
                return None

    def _setup_handlers(self):
        """Setup signaling event handlers"""
        
        # Handle chat messages (server broadcasts as "chat-message")
        self.signaling.on("chat-message", self._on_chat_message)
        
        # Handle WebRTC signaling
        self.signaling.on("offer", self._on_offer)
        self.signaling.on("answer", self._on_answer)
        self.signaling.on("ice-candidate", self._on_ice_candidate)
        
        # Handle room events
        self.signaling.on("room-users", self._on_room_users)
        self.signaling.on("user-joined", self._on_user_joined)
        self.signaling.on("user-left", self._on_user_left)

        # Setup WebRTC ICE callback
        self.webrtc.on_ice_candidate = self._send_ice_candidate

    async def _on_room_users(self, data: dict):
        """Handle existing users in room - create offers for them"""
        users = data.get("users", [])
        print(f"📋 Existing users in room: {users}")
        
        for user_id in users:
            if user_id != self.auth.user["id"]:
                print(f"📤 Creating offer for existing user: {user_id}")
                try:
                    offer = await self.webrtc.create_offer(user_id)
                    await self.signaling.send_offer(user_id, offer)
                except Exception as e:
                    print(f"❌ Failed to create offer for {user_id}: {e}")

    async def _on_chat_message(self, data: dict):
        """Handle incoming chat message"""
        # Server wraps message in "message" field
        message_data = data.get("message", data)
        sender = message_data.get("senderName", "User")
        content = message_data.get("content", "")
        
        # Don't respond to own messages
        if sender == config.BOT_DISPLAY_NAME:
            return

        print(f"💬 {sender}: {content}")
        
        # Get AI response
        response = await self.chatbot.get_response(content, sender)
        print(f"🤖 Bot: {response}")
        
        # Send response
        await self.signaling.send_chat(response, config.BOT_DISPLAY_NAME)
        
        # Generate and play TTS
        await self._speak(response)

    async def _speak(self, text: str):
        """Convert text to speech and play"""
        self.video_generator.set_speaking(True)
        
        try:
            audio = await self.tts.text_to_speech(text)
            if audio:
                await self.webrtc.play_audio(audio)
                # Estimate speaking duration (rough)
                duration = len(text) * 0.08  # ~80ms per character
                await asyncio.sleep(duration)
        except Exception as e:
            print(f"⚠️ Speak error: {e}")
        finally:
            self.video_generator.set_speaking(False)

    async def _on_offer(self, data: dict):
        """Handle WebRTC offer"""
        peer_id = data.get("senderId")
        offer = data.get("payload")
        
        print(f"📥 Received offer from {peer_id}")
        
        if peer_id and offer:
            try:
                answer = await self.webrtc.handle_offer(peer_id, offer)
                await self.signaling.send_answer(peer_id, answer)
                print(f"📤 Sent answer to {peer_id}")
            except Exception as e:
                print(f"❌ Error handling offer: {e}")

    async def _on_answer(self, data: dict):
        """Handle WebRTC answer"""
        peer_id = data.get("senderId")
        answer = data.get("payload")
        
        print(f"📥 Received answer from {peer_id}")
        
        if peer_id and answer:
            try:
                await self.webrtc.handle_answer(peer_id, answer)
                print(f"✅ Answer processed for {peer_id}")
            except Exception as e:
                print(f"❌ Error handling answer: {e}")

    async def _on_ice_candidate(self, data: dict):
        """Handle ICE candidate"""
        peer_id = data.get("senderId")
        candidate = data.get("payload")
        
        if peer_id and candidate:
            await self.webrtc.handle_ice_candidate(peer_id, candidate)

    def _send_ice_candidate(self, peer_id: str, candidate):
        """Send ICE candidate to peer"""
        asyncio.create_task(self.signaling.send_ice_candidate(peer_id, {
            "candidate": candidate.candidate,
            "sdpMid": candidate.sdpMid,
            "sdpMLineIndex": candidate.sdpMLineIndex
        }))

    async def _on_user_joined(self, data: dict):
        """Handle user joined event"""
        user_name = data.get("displayName", "Someone")
        user_id = data.get("userId")
        
        print(f"👋 {user_name} joined the room")
        
        # Create offer for new peer
        if user_id and user_id != self.auth.user["id"]:
            offer = await self.webrtc.create_offer(user_id)
            await self.signaling.send_offer(user_id, offer)

    async def _on_user_left(self, data: dict):
        """Handle user left event"""
        user_name = data.get("displayName", "Someone")
        user_id = data.get("userId")
        
        print(f"👋 {user_name} left the room")
        
        if user_id:
            await self.webrtc.close_connection(user_id)

    async def _send_greeting(self):
        """Send greeting message when joining"""
        greeting = "Xin chào! Tôi là AI Assistant. Rất vui được tham gia cuộc họp!"
        await self.signaling.send_chat(greeting, config.BOT_DISPLAY_NAME)
        await self._speak(greeting)

    async def stop(self):
        """Stop the bot"""
        print("🛑 Stopping bot...")
        self.is_running = False
        
        # Say goodbye
        goodbye = "Tạm biệt mọi người!"
        await self.signaling.send_chat(goodbye, config.BOT_DISPLAY_NAME)
        
        # Leave room
        await self.signaling.leave_room()
        await self.webrtc.close_all()
        await self.signaling.disconnect()
        
        print("✅ Bot stopped")

    async def run_forever(self):
        """Keep bot running"""
        try:
            while self.is_running:
                await asyncio.sleep(1)
        except asyncio.CancelledError:
            await self.stop()
