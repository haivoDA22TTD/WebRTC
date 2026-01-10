import aiohttp
import config

class AuthClient:
    def __init__(self):
        self.token = None
        self.user = None

    async def login(self) -> bool:
        """Login to get JWT token"""
        async with aiohttp.ClientSession() as session:
            try:
                async with session.post(
                    f"{config.AUTH_URL}/auth/login",
                    json={
                        "email": config.BOT_EMAIL,
                        "password": config.BOT_PASSWORD
                    }
                ) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        self.token = data.get("token")
                        self.user = data.get("user")
                        print(f"✅ Logged in as {self.user.get('displayName')}")
                        return True
                    else:
                        print(f"❌ Login failed: {resp.status}")
                        return False
            except Exception as e:
                print(f"❌ Login error: {e}")
                return False

    async def register(self) -> bool:
        """Register bot account if not exists"""
        async with aiohttp.ClientSession() as session:
            try:
                async with session.post(
                    f"{config.AUTH_URL}/auth/register",
                    json={
                        "email": config.BOT_EMAIL,
                        "password": config.BOT_PASSWORD,
                        "username": "ai_bot",
                        "displayName": config.BOT_DISPLAY_NAME
                    }
                ) as resp:
                    if resp.status == 200:
                        print("✅ Bot account registered")
                        return True
                    elif resp.status == 409:
                        print("ℹ️ Bot account already exists")
                        return True
                    else:
                        print(f"❌ Registration failed: {resp.status}")
                        return False
            except Exception as e:
                print(f"❌ Registration error: {e}")
                return False

    def get_headers(self) -> dict:
        """Get auth headers for API calls"""
        headers = {"Content-Type": "application/json"}
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        if self.user:
            headers["X-User-Id"] = self.user.get("id", "")
            headers["X-Username"] = self.user.get("username", "")
            headers["X-Display-Name"] = self.user.get("displayName", "")
        return headers
