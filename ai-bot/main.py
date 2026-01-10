#!/usr/bin/env python3
"""
AI Bot - Main Entry Point
A virtual AI participant for WebRTC meetings
"""

import asyncio
import argparse
import signal
import sys
from src.bot import AIBot
import config

bot: AIBot = None

async def main(room_code: str):
    global bot
    bot = AIBot()
    
    print("=" * 50)
    print("🤖 WebRTC AI Bot")
    print("=" * 50)
    print(f"📍 Signaling: {config.SIGNALING_URL}")
    print(f"👤 Bot Name: {config.BOT_DISPLAY_NAME}")
    print(f"🎯 Room Code: {room_code}")
    print("=" * 50)
    
    # Start bot
    success = await bot.start(room_code)
    if not success:
        print("❌ Failed to start bot")
        return
    
    # Run until stopped
    await bot.run_forever()

def signal_handler(sig, frame):
    """Handle Ctrl+C"""
    print("\n⚠️ Received shutdown signal...")
    if bot:
        asyncio.create_task(bot.stop())
    sys.exit(0)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="AI Bot for WebRTC meetings")
    parser.add_argument(
        "room_code",
        nargs="?",
        default="test-room",
        help="Room code to join (default: test-room)"
    )
    parser.add_argument(
        "--name",
        default=None,
        help="Bot display name"
    )
    args = parser.parse_args()
    
    # Override bot name if provided
    if args.name:
        config.BOT_DISPLAY_NAME = args.name
    
    # Setup signal handler
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    # Run bot
    try:
        asyncio.run(main(args.room_code))
    except KeyboardInterrupt:
        print("\n👋 Bot stopped by user")
