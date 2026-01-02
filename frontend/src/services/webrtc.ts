import { socketService } from './socket';

// ICE servers configuration with STUN and TURN
const TURN_URL = import.meta.env.VITE_TURN_URL || 'localhost';
const TURN_USERNAME = import.meta.env.VITE_TURN_USERNAME || 'webrtc';
const TURN_PASSWORD = import.meta.env.VITE_TURN_PASSWORD || 'webrtc123';

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    // Public STUN servers (fallback)
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    // Local STUN server
    { urls: `stun:${TURN_URL}:3478` },
    // TURN server (relay for NAT traversal)
    {
      urls: `turn:${TURN_URL}:3478`,
      username: TURN_USERNAME,
      credential: TURN_PASSWORD,
    },
    {
      urls: `turn:${TURN_URL}:3478?transport=tcp`,
      username: TURN_USERNAME,
      credential: TURN_PASSWORD,
    },
  ],
  iceCandidatePoolSize: 10,
};

export class WebRTCService {
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private localStream: MediaStream | null = null;
  private onRemoteStream: ((peerId: string, stream: MediaStream) => void) | null = null;
  private onPeerDisconnected: ((peerId: string) => void) | null = null;

  setCallbacks(
    onRemoteStream: (peerId: string, stream: MediaStream) => void,
    onPeerDisconnected: (peerId: string) => void
  ) {
    this.onRemoteStream = onRemoteStream;
    this.onPeerDisconnected = onPeerDisconnected;
  }

  async getLocalStream(video = true, audio = true): Promise<MediaStream> {
    this.localStream = await navigator.mediaDevices.getUserMedia({ video, audio });
    return this.localStream;
  }

  async getScreenStream(): Promise<MediaStream> {
    return await navigator.mediaDevices.getDisplayMedia({
      video: { cursor: 'always' } as MediaTrackConstraints,
      audio: true,
    });
  }

  createPeerConnection(peerId: string): RTCPeerConnection {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketService.sendIceCandidate(peerId, event.candidate);
      }
    };

    pc.ontrack = (event) => {
      if (event.streams[0] && this.onRemoteStream) {
        this.onRemoteStream(peerId, event.streams[0]);
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        this.closePeerConnection(peerId);
        this.onPeerDisconnected?.(peerId);
      }
    };

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        pc.addTrack(track, this.localStream!);
      });
    }

    this.peerConnections.set(peerId, pc);
    return pc;
  }

  async createOffer(peerId: string): Promise<RTCSessionDescriptionInit> {
    const pc = this.peerConnections.get(peerId) || this.createPeerConnection(peerId);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    return offer;
  }

  async handleOffer(peerId: string, offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    const pc = this.peerConnections.get(peerId) || this.createPeerConnection(peerId);
    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    return answer;
  }

  async handleAnswer(peerId: string, answer: RTCSessionDescriptionInit) {
    const pc = this.peerConnections.get(peerId);
    if (pc) {
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
    }
  }

  async handleIceCandidate(peerId: string, candidate: RTCIceCandidateInit) {
    const pc = this.peerConnections.get(peerId);
    if (pc) {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    }
  }

  toggleAudio(enabled: boolean) {
    this.localStream?.getAudioTracks().forEach((track) => {
      track.enabled = enabled;
    });
  }

  toggleVideo(enabled: boolean) {
    this.localStream?.getVideoTracks().forEach((track) => {
      track.enabled = enabled;
    });
  }

  async replaceVideoTrack(newStream: MediaStream) {
    const videoTrack = newStream.getVideoTracks()[0];
    this.peerConnections.forEach((pc) => {
      const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
      if (sender && videoTrack) {
        sender.replaceTrack(videoTrack);
      }
    });
  }

  closePeerConnection(peerId: string) {
    const pc = this.peerConnections.get(peerId);
    if (pc) {
      pc.close();
      this.peerConnections.delete(peerId);
    }
  }

  closeAllConnections() {
    this.peerConnections.forEach((pc) => pc.close());
    this.peerConnections.clear();
    this.localStream?.getTracks().forEach((track) => track.stop());
    this.localStream = null;
  }
}

export const webrtcService = new WebRTCService();
