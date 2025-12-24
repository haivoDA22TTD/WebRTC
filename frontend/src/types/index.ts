// User types
export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatar?: string;
  status: 'online' | 'offline' | 'busy' | 'away';
  createdAt: string;
}

// Room types
export interface Room {
  id: string;
  name: string;
  code: string;
  hostId: string;
  participants: Participant[];
  isActive: boolean;
  createdAt: string;
  settings: RoomSettings;
}

export interface RoomSettings {
  maxParticipants: number;
  allowChat: boolean;
  allowScreenShare: boolean;
  muteOnJoin: boolean;
  requireApproval: boolean;
}

export interface Participant {
  userId: string;
  username: string;
  displayName: string;
  avatar?: string;
  isHost: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  joinedAt: string;
}

// Chat types
export interface Message {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  type: 'text' | 'system' | 'file';
  createdAt: string;
}

// WebRTC types
export interface PeerConnection {
  oderId: string;
  connection: RTCPeerConnection;
  stream?: MediaStream;
}

export interface SignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'join' | 'leave';
  roomId: string;
  senderId: string;
  targetId?: string;
  payload: unknown;
}

// Auth types
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  displayName: string;
}
