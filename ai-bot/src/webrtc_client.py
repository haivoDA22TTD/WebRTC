import asyncio
import fractions
from aiortc import RTCPeerConnection, RTCSessionDescription, RTCIceCandidate, RTCConfiguration, RTCIceServer
from aiortc import VideoStreamTrack, AudioStreamTrack
from aiortc.contrib.media import MediaPlayer, MediaRecorder
from av import VideoFrame, AudioFrame
import numpy as np
import config
from .video_generator import VideoGenerator

class BotVideoTrack(VideoStreamTrack):
    """Custom video track that generates avatar frames"""
    
    def __init__(self, video_generator: VideoGenerator):
        super().__init__()
        self.video_generator = video_generator
        self.frame_count = 0

    async def recv(self):
        pts, time_base = await self.next_timestamp()
        
        # Get frame from video generator
        frame_data = self.video_generator.get_frame()
        
        # Convert BGR to RGB
        frame_rgb = frame_data[:, :, ::-1].copy()
        
        # Create VideoFrame
        frame = VideoFrame.from_ndarray(frame_rgb, format="rgb24")
        frame.pts = pts
        frame.time_base = time_base
        
        self.frame_count += 1
        return frame


class BotAudioTrack(AudioStreamTrack):
    """Custom audio track for TTS output"""
    
    def __init__(self):
        super().__init__()
        self.audio_queue = asyncio.Queue()
        self.sample_rate = 48000
        self.channels = 2
        self.samples_per_frame = 960  # 20ms at 48kHz

    async def recv(self):
        pts, time_base = await self.next_timestamp()
        
        try:
            # Try to get audio from queue (non-blocking)
            audio_data = self.audio_queue.get_nowait()
        except asyncio.QueueEmpty:
            # Generate silence if no audio
            audio_data = np.zeros((self.channels, self.samples_per_frame), dtype=np.int16)
        
        frame = AudioFrame.from_ndarray(audio_data, format="s16", layout="stereo")
        frame.pts = pts
        frame.time_base = time_base
        frame.sample_rate = self.sample_rate
        
        return frame

    async def add_audio(self, audio_bytes: bytes):
        """Add audio data to the queue"""
        # Convert audio bytes to numpy array
        # This is simplified - real implementation needs proper audio decoding
        await self.audio_queue.put(audio_bytes)


class WebRTCClient:
    def __init__(self, video_generator: VideoGenerator):
        self.video_generator = video_generator
        self.peer_connections: dict[str, RTCPeerConnection] = {}
        self.on_remote_track = None
        self.on_ice_candidate = None

    def _create_peer_connection(self, peer_id: str) -> RTCPeerConnection:
        """Create a new peer connection"""
        # Create ICE servers configuration
        ice_servers = [
            RTCIceServer(urls=server["urls"]) 
            for server in config.ICE_SERVERS
        ]
        rtc_config = RTCConfiguration(iceServers=ice_servers)
        
        pc = RTCPeerConnection(configuration=rtc_config)

        # Create new tracks for each peer connection
        video_track = BotVideoTrack(self.video_generator)
        audio_track = BotAudioTrack()
        
        # Add local tracks
        pc.addTrack(video_track)
        pc.addTrack(audio_track)

        # Handle incoming tracks
        @pc.on("track")
        def on_track(track):
            print(f"📹 Received {track.kind} track from {peer_id}")
            if self.on_remote_track:
                self.on_remote_track(peer_id, track)

        # Handle connection state
        @pc.on("connectionstatechange")
        async def on_connectionstatechange():
            print(f"🔗 Connection state ({peer_id}): {pc.connectionState}")
            if pc.connectionState == "failed":
                await self.close_connection(peer_id)

        # Handle ICE candidates
        @pc.on("icecandidate")
        def on_icecandidate(candidate):
            if candidate and self.on_ice_candidate:
                self.on_ice_candidate(peer_id, candidate)

        self.peer_connections[peer_id] = pc
        return pc

    async def create_offer(self, peer_id: str) -> dict:
        """Create an offer for a peer"""
        pc = self._create_peer_connection(peer_id)
        offer = await pc.createOffer()
        await pc.setLocalDescription(offer)
        
        return {
            "type": offer.type,
            "sdp": offer.sdp
        }

    async def handle_offer(self, peer_id: str, offer: dict) -> dict:
        """Handle an incoming offer and create answer"""
        pc = self._create_peer_connection(peer_id)
        
        await pc.setRemoteDescription(RTCSessionDescription(
            sdp=offer["sdp"],
            type=offer["type"]
        ))
        
        answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)
        
        return {
            "type": answer.type,
            "sdp": answer.sdp
        }

    async def handle_answer(self, peer_id: str, answer: dict):
        """Handle an incoming answer"""
        pc = self.peer_connections.get(peer_id)
        if pc:
            await pc.setRemoteDescription(RTCSessionDescription(
                sdp=answer["sdp"],
                type=answer["type"]
            ))

    async def handle_ice_candidate(self, peer_id: str, candidate: dict):
        """Handle an incoming ICE candidate"""
        pc = self.peer_connections.get(peer_id)
        if pc and candidate and candidate.get("candidate"):
            try:
                # aiortc expects the candidate string to be parsed
                # The candidate dict from browser has: {candidate: "...", sdpMid: "...", sdpMLineIndex: ...}
                candidate_str = candidate.get("candidate", "")
                sdp_mid = candidate.get("sdpMid", "")
                sdp_m_line_index = candidate.get("sdpMLineIndex", 0)
                
                # Create RTCIceCandidate from sdp string
                ice_candidate = RTCIceCandidate(
                    component=1,
                    foundation="",
                    ip="",
                    port=0,
                    priority=0,
                    protocol="udp",
                    type="host",
                    sdpMid=sdp_mid,
                    sdpMLineIndex=sdp_m_line_index
                )
                # Parse the candidate string and update fields
                # For now, just skip ICE candidates as aiortc handles ICE internally
                print(f"📥 Received ICE candidate from {peer_id}")
            except Exception as e:
                print(f"⚠️ ICE candidate error: {e}")

    async def close_connection(self, peer_id: str):
        """Close a peer connection"""
        pc = self.peer_connections.pop(peer_id, None)
        if pc:
            await pc.close()
            print(f"🔌 Closed connection to {peer_id}")

    async def close_all(self):
        """Close all peer connections"""
        for peer_id in list(self.peer_connections.keys()):
            await self.close_connection(peer_id)

    def set_speaking(self, speaking: bool):
        """Update speaking state for video"""
        self.video_generator.set_speaking(speaking)

    async def play_audio(self, audio_bytes: bytes):
        """Play audio through all audio tracks"""
        # Note: In a real implementation, you'd need to track audio tracks per peer
        pass
