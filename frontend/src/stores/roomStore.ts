import { create } from 'zustand';
import type { Room, Participant, Message } from '../types';

interface RoomState {
  currentRoom: Room | null;
  participants: Participant[];
  messages: Message[];
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  isChatOpen: boolean;
  
  setCurrentRoom: (room: Room | null) => void;
  setParticipants: (participants: Participant[]) => void;
  addParticipant: (participant: Participant) => void;
  removeParticipant: (userId: string) => void;
  updateParticipant: (userId: string, data: Partial<Participant>) => void;
  
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
  
  setLocalStream: (stream: MediaStream | null) => void;
  addRemoteStream: (oderId: string, stream: MediaStream) => void;
  removeRemoteStream: (oderId: string) => void;
  
  toggleMute: () => void;
  toggleVideo: () => void;
  toggleScreenShare: () => void;
  toggleChat: () => void;
  
  reset: () => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  currentRoom: null,
  participants: [],
  messages: [],
  localStream: null,
  remoteStreams: new Map(),
  isMuted: false,
  isVideoOff: false,
  isScreenSharing: false,
  isChatOpen: false,

  setCurrentRoom: (room) => set({ currentRoom: room }),
  setParticipants: (participants) => set({ participants }),
  addParticipant: (participant) =>
    set((state) => ({ participants: [...state.participants, participant] })),
  removeParticipant: (userId) =>
    set((state) => ({
      participants: state.participants.filter((p) => p.userId !== userId),
    })),
  updateParticipant: (userId, data) =>
    set((state) => ({
      participants: state.participants.map((p) =>
        p.userId === userId ? { ...p, ...data } : p
      ),
    })),

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  setMessages: (messages) => set({ messages }),

  setLocalStream: (stream) => set({ localStream: stream }),
  addRemoteStream: (oderId, stream) =>
    set((state) => {
      const newStreams = new Map(state.remoteStreams);
      newStreams.set(oderId, stream);
      return { remoteStreams: newStreams };
    }),
  removeRemoteStream: (oderId) =>
    set((state) => {
      const newStreams = new Map(state.remoteStreams);
      newStreams.delete(oderId);
      return { remoteStreams: newStreams };
    }),

  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  toggleVideo: () => set((state) => ({ isVideoOff: !state.isVideoOff })),
  toggleScreenShare: () => set((state) => ({ isScreenSharing: !state.isScreenSharing })),
  toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),

  reset: () =>
    set({
      currentRoom: null,
      participants: [],
      messages: [],
      localStream: null,
      remoteStreams: new Map(),
      isMuted: false,
      isVideoOff: false,
      isScreenSharing: false,
      isChatOpen: false,
    }),
}));
