#!/usr/bin/env python3
"""
AI Bot HTTP Server - Receives requests to join rooms
"""

import asyncio
from aiohttp import web
from src.bot import AIBot
import config

# Store active bots
active_bots: dict[str, AIBot] = {}

async def join_room(request: web.Request) -> web.Response:
    """Handle POST /bot/join - Join a room"""
    try:
        data = await request.json()
        room_code = data.get('roomCode')
        
        if not room_code:
            return web.json_response(
                {'error': 'roomCode is required'}, 
                status=400
            )
        
        # Check if bot already in this room
        if room_code in active_bots:
            return web.json_response(
                {'message': 'Bot already in room', 'roomCode': room_code}
            )
        
        # Create and start bot
        bot = AIBot()
        
        # Start bot in background
        asyncio.create_task(start_bot(bot, room_code))
        
        return web.json_response({
            'message': 'Bot joining room',
            'roomCode': room_code,
            'botName': config.BOT_DISPLAY_NAME
        })
        
    except Exception as e:
        print(f"❌ Error joining room: {e}")
        return web.json_response(
            {'error': str(e)}, 
            status=500
        )

async def start_bot(bot: AIBot, room_code: str):
    """Start bot and track it"""
    try:
        active_bots[room_code] = bot
        success = await bot.start(room_code)
        
        if success:
            await bot.run_forever()
        else:
            print(f"❌ Bot failed to join room: {room_code}")
            
    except Exception as e:
        print(f"❌ Bot error: {e}")
    finally:
        if room_code in active_bots:
            del active_bots[room_code]

async def leave_room(request: web.Request) -> web.Response:
    """Handle POST /bot/leave - Leave a room"""
    try:
        data = await request.json()
        room_code = data.get('roomCode')
        
        if room_code in active_bots:
            await active_bots[room_code].stop()
            del active_bots[room_code]
            return web.json_response({'message': 'Bot left room'})
        else:
            return web.json_response(
                {'error': 'Bot not in room'}, 
                status=404
            )
            
    except Exception as e:
        return web.json_response({'error': str(e)}, status=500)

async def get_status(request: web.Request) -> web.Response:
    """Handle GET /bot/status - Get bot status"""
    return web.json_response({
        'status': 'running',
        'activeRooms': list(active_bots.keys()),
        'botName': config.BOT_DISPLAY_NAME
    })

async def health(request: web.Request) -> web.Response:
    """Health check endpoint"""
    return web.json_response({'status': 'ok'})

def create_app() -> web.Application:
    """Create aiohttp application"""
    app = web.Application()
    
    # CORS middleware
    async def cors_middleware(app, handler):
        async def middleware_handler(request):
            if request.method == 'OPTIONS':
                response = web.Response()
            else:
                response = await handler(request)
            
            response.headers['Access-Control-Allow-Origin'] = '*'
            response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
            response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-User-Id, X-Username, X-Display-Name'
            return response
        return middleware_handler
    
    app.middlewares.append(cors_middleware)
    
    # Routes
    app.router.add_post('/bot/join', join_room)
    app.router.add_post('/bot/leave', leave_room)
    app.router.add_get('/bot/status', get_status)
    app.router.add_get('/health', health)
    
    return app

def main():
    """Run the server"""
    port = int(config.BOT_SERVER_PORT if hasattr(config, 'BOT_SERVER_PORT') else 8088)
    
    print("=" * 50)
    print("🤖 AI Bot Server")
    print("=" * 50)
    print(f"📍 Running on http://0.0.0.0:{port}")
    print(f"👤 Bot Name: {config.BOT_DISPLAY_NAME}")
    print("=" * 50)
    
    app = create_app()
    web.run_app(app, host='0.0.0.0', port=port)

if __name__ == '__main__':
    main()
