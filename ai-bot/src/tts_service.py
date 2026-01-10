import edge_tts
import asyncio
import io
import config

class TTSService:
    def __init__(self):
        self.voice = config.TTS_VOICE
        self.rate = config.TTS_RATE

    async def text_to_speech(self, text: str) -> bytes:
        """Convert text to speech audio bytes"""
        try:
            communicate = edge_tts.Communicate(text, self.voice, rate=self.rate)
            
            audio_data = io.BytesIO()
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    audio_data.write(chunk["data"])
            
            return audio_data.getvalue()
        except Exception as e:
            print(f"⚠️ TTS error: {e}")
            return b""  # Return empty bytes on error

    async def get_available_voices(self, language: str = "vi") -> list:
        """Get available voices for a language"""
        voices = await edge_tts.list_voices()
        return [v for v in voices if v["Locale"].startswith(language)]


# Test
async def test_tts():
    tts = TTSService()
    audio = await tts.text_to_speech("Xin chào, tôi là trợ lý AI")
    with open("test_audio.mp3", "wb") as f:
        f.write(audio)
    print(f"Generated audio: {len(audio)} bytes")

if __name__ == "__main__":
    asyncio.run(test_tts())
