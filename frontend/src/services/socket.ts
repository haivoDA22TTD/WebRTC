import { useAuthStore } from '../stores/authStore';

const SIGNALING_URL = import.meta.env.VITE_SIGNALING_URL || 'ws://localhost:8083/ws/signaling';

type MessageHandler = (data: unknown) => void;

class SocketService {
  private ws: WebSocket | null = null;
  private listeners: Map<string, Set<MessageHandler>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        // Wait for existing connection attempt
        const checkConnection = setInterval(() => {
          if (this.ws?.readyState === WebSocket.OPEN) {
            clearInterval(checkConnection);
            resolve();
          }
        }, 100);
        return;
      }

      this.isConnecting = true;
      const token = useAuthStore.getState().token;
      const url = token ? `${SIGNALING_URL}?token=${token}` : SIGNALING_URL;
      
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.isConnecting = false;
        resolve();
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.isConnecting = false;
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnecting = false;
        reject(error);
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const type = data.type;
          
          // Notify all listeners for this event type
          const callbacks = this.listeners.get(type);
          if (callbacks) {
            callbacks.forEach(callback => callback(data));
          }
          
          // Also notify 'message' listeners for all messages
          const messageCallbacks = this.listeners.get('message');
          if (messageCallbacks) {
            messageCallbacks.forEach(callback => callback(data));
          }
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e);
        }
      };
    });
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * this.reconnectAttempts;
    
    console.log(`Attempting to reconnect in ${delay}ms...`);
    setTimeout(() => {
      this.connect().catch(console.error);
    }, delay);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(data: object) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket not connected, message not sent:', data);
    }
  }

  on(event: string, callback: MessageHandler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: MessageHandler) {
    this.listeners.get(event)?.delete(callback);
  }

  // Room operations
  joinRoom(roomId: string, userId: string, displayName: string) {
    this.send({
      type: 'join',
      roomId,
      userId,
      displayName
    });
  }

  leaveRoom(roomId: string) {
    this.send({
      type: 'leave',
      roomId
    });
  }

  // WebRTC signaling
  sendOffer(targetId: string, offer: RTCSessionDescriptionInit) {
    this.send({
      type: 'offer',
      targetId,
      payload: offer
    });
  }

  sendAnswer(targetId: string, answer: RTCSessionDescriptionInit) {
    this.send({
      type: 'answer',
      targetId,
      payload: answer
    });
  }

  sendIceCandidate(targetId: string, candidate: RTCIceCandidate) {
    this.send({
      type: 'ice-candidate',
      targetId,
      payload: candidate
    });
  }

  // Chat
  sendMessage(roomId: string, content: string, senderName: string) {
    this.send({
      type: 'chat',
      roomId,
      content,
      senderName
    });
  }

  // Media state
  sendMediaStateChange(mediaType: 'audio' | 'video', enabled: boolean) {
    this.send({
      type: mediaType === 'audio' ? 'mute-toggle' : 'video-toggle',
      enabled
    });
  }
}

export const socketService = new SocketService();
