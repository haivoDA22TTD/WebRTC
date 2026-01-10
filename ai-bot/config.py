import os
from dotenv import load_dotenv

load_dotenv()

# Server URLs
SIGNALING_URL = os.getenv("SIGNALING_URL", "ws://localhost:8083/ws/signaling")
AUTH_URL = os.getenv("AUTH_URL", "http://localhost:8081")
ROOM_URL = os.getenv("ROOM_URL", "http://localhost:8082")

# Bot Server
BOT_SERVER_PORT = os.getenv("BOT_SERVER_PORT", "8088")

# Bot credentials
BOT_EMAIL = os.getenv("BOT_EMAIL", "ai-bot@webrtc.local")
BOT_PASSWORD = os.getenv("BOT_PASSWORD", "bot123456")
BOT_DISPLAY_NAME = os.getenv("BOT_DISPLAY_NAME", "AI Assistant")

# Google Gemini (FREE - recommended!)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

# OpenAI (optional - for smart responses)
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")

# Ollama (local LLM alternative)
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama2")

# TTS Settings
TTS_VOICE = os.getenv("TTS_VOICE", "vi-VN-HoaiMyNeural")  # Vietnamese voice
TTS_RATE = os.getenv("TTS_RATE", "+0%")

# Avatar settings
AVATAR_IMAGE = os.getenv("AVATAR_IMAGE", "assets/avatar.png")
AVATAR_VIDEO = os.getenv("AVATAR_VIDEO", "assets/avatar_idle.mp4")

# ICE Servers
ICE_SERVERS = [
    {"urls": "stun:stun.l.google.com:19302"},
    {"urls": "stun:stun1.l.google.com:19302"},
]
