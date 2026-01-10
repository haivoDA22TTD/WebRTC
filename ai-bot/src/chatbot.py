import httpx
import config

class ChatBot:
    def __init__(self):
        self.conversation_history = []
        self.system_prompt = """Bạn là một trợ lý AI thân thiện tham gia cuộc họp video.
Hãy trả lời ngắn gọn, tự nhiên như đang nói chuyện.
Giới thiệu bản thân là "AI Assistant" khi được hỏi.
Có thể trả lời bằng tiếng Việt hoặc tiếng Anh tùy theo ngôn ngữ người dùng."""

        # Priority: Gemini > OpenAI > Ollama > Fallback
        self.use_gemini = bool(getattr(config, 'GEMINI_API_KEY', ''))
        self.use_openai = bool(config.OPENAI_API_KEY) and not self.use_gemini
        
        if self.use_openai:
            from openai import AsyncOpenAI
            self.client = AsyncOpenAI(api_key=config.OPENAI_API_KEY)

    async def get_response(self, message: str, sender_name: str = "User") -> str:
        """Get AI response to a message"""
        self.conversation_history.append({
            "role": "user",
            "content": f"{sender_name}: {message}"
        })

        try:
            if self.use_gemini:
                response = await self._gemini_response()
            elif self.use_openai:
                response = await self._openai_response()
            else:
                response = await self._ollama_response()
        except Exception as e:
            print(f"AI Error: {e}")
            response = self._fallback_response(message)

        self.conversation_history.append({
            "role": "assistant",
            "content": response
        })

        return response

    async def _gemini_response(self) -> str:
        """Get response from Google Gemini (FREE!)"""
        # Build conversation for Gemini
        contents = []
        for msg in self.conversation_history[-10:]:
            role = "user" if msg["role"] == "user" else "model"
            contents.append({"role": role, "parts": [{"text": msg["content"]}]})

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"https://generativelanguage.googleapis.com/v1beta/models/{config.GEMINI_MODEL}:generateContent",
                params={"key": config.GEMINI_API_KEY},
                json={
                    "contents": contents,
                    "systemInstruction": {"parts": [{"text": self.system_prompt}]},
                    "generationConfig": {
                        "maxOutputTokens": 150,
                        "temperature": 0.7
                    }
                },
                timeout=30.0
            )
            data = response.json()
            
            if "candidates" in data:
                return data["candidates"][0]["content"]["parts"][0]["text"]
            else:
                print(f"Gemini error: {data}")
                return self._fallback_response("")

    async def _openai_response(self) -> str:
        """Get response from OpenAI"""
        messages = [{"role": "system", "content": self.system_prompt}]
        messages.extend(self.conversation_history[-10:])  # Last 10 messages

        response = await self.client.chat.completions.create(
            model=config.OPENAI_MODEL,
            messages=messages,
            max_tokens=150,
            temperature=0.7
        )
        return response.choices[0].message.content

    async def _ollama_response(self) -> str:
        """Get response from local Ollama"""
        messages = [{"role": "system", "content": self.system_prompt}]
        messages.extend(self.conversation_history[-10:])

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{config.OLLAMA_URL}/api/chat",
                json={
                    "model": config.OLLAMA_MODEL,
                    "messages": messages,
                    "stream": False
                },
                timeout=30.0
            )
            data = response.json()
            return data.get("message", {}).get("content", "Xin lỗi, tôi không hiểu.")

    def _fallback_response(self, message: str) -> str:
        """Simple fallback responses when AI is unavailable"""
        message_lower = message.lower()
        
        if any(word in message_lower for word in ["xin chào", "hello", "hi", "chào"]):
            return "Xin chào! Tôi là AI Assistant. Rất vui được gặp bạn!"
        elif any(word in message_lower for word in ["tên", "name", "ai", "bạn là"]):
            return "Tôi là AI Assistant, một trợ lý ảo tham gia cuộc họp này."
        elif any(word in message_lower for word in ["khỏe", "how are"]):
            return "Tôi hoạt động tốt, cảm ơn bạn đã hỏi!"
        elif any(word in message_lower for word in ["bye", "tạm biệt", "goodbye"]):
            return "Tạm biệt! Hẹn gặp lại bạn!"
        else:
            return "Tôi đang lắng nghe. Bạn có thể nói rõ hơn được không?"

    def clear_history(self):
        """Clear conversation history"""
        self.conversation_history = []
