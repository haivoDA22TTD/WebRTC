import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Mic, MicOff, Video, VideoOff, Monitor, MonitorOff,
  MessageSquare, Phone, Users, Copy, Check, UserPlus
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useRoomStore } from '../stores/roomStore';
import { useAuthStore } from '../stores/authStore';
import { roomApi } from '../services/api';
import { socketService } from '../services/socket';
import { webrtcService } from '../services/webrtc';
import { ChatPanel } from '../components/room/ChatPanel';
import { ParticipantsList } from '../components/room/ParticipantsList';
import { InviteModal } from '../components/room/InviteModal';

interface RemoteStream {
  oderId: string;
  stream: MediaStream;
  displayName: string;
}

interface SignalData {
  users?: string[];
  userId?: string;
  displayName?: string;
  senderId?: string;
  payload?: RTCSessionDescriptionInit | RTCIceCandidateInit;
  mediaType?: 'audio' | 'video';
  enabled?: boolean;
}

export function Room() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    currentRoom, participants, localStream,
    isMuted, isVideoOff, isScreenSharing, isChatOpen,
    setLocalStream, setCurrentRoom, setParticipants, addParticipant, removeParticipant,
    toggleMute, toggleVideo, toggleScreenShare, toggleChat, reset
  } = useRoomStore();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, RemoteStream>>(new Map());
  const [isConnecting, setIsConnecting] = useState(true);

  // Initialize camera
  const initCamera = useCallback(async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      setLocalStream(stream);
      return stream;
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Camera error:', err);
      if (err.name === 'NotReadableError') {
        setCameraError('Camera đang được sử dụng bởi ứng dụng khác. Vui lòng đóng các ứng dụng khác và thử lại.');
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({ 
            video: false, 
            audio: true 
          });
          setLocalStream(audioStream);
          return audioStream;
        } catch {
          setCameraError('Không thể truy cập microphone.');
        }
      } else if (err.name === 'NotAllowedError') {
        setCameraError('Vui lòng cho phép truy cập camera và microphone.');
      } else {
        setCameraError('Không thể truy cập camera/microphone.');
      }
      return null;
    }
  }, [setLocalStream]);

  // Handle remote stream
  const handleRemoteStream = useCallback((peerId: string, stream: MediaStream) => {
    console.log('Received remote stream from:', peerId);
    const participant = participants.find(p => p.userId === peerId);
    setRemoteStreams(prev => {
      const newMap = new Map(prev);
      newMap.set(peerId, {
        oderId: peerId,
        stream,
        displayName: participant?.displayName || 'Người dùng'
      });
      return newMap;
    });
  }, [participants]);

  // Handle peer disconnected
  const handlePeerDisconnected = useCallback((peerId: string) => {
    console.log('Peer disconnected:', peerId);
    setRemoteStreams(prev => {
      const newMap = new Map(prev);
      newMap.delete(peerId);
      return newMap;
    });
    removeParticipant(peerId);
  }, [removeParticipant]);

  // Setup WebRTC callbacks
  useEffect(() => {
    webrtcService.setCallbacks(handleRemoteStream, handlePeerDisconnected);
  }, [handleRemoteStream, handlePeerDisconnected]);

  // Initialize room and WebSocket
  useEffect(() => {
    if (!roomId || !user) return;

    let mounted = true;

    const initRoom = async () => {
      try {
        setIsConnecting(true);
        
        // Get room info
        const response = await roomApi.get(roomId);
        if (!mounted) return;
        
        setCurrentRoom(response.data);
        setParticipants(response.data.participants || []);
        
        // Init camera
        const stream = await initCamera();
        if (!mounted) return;

        // Connect to signaling server
        await socketService.connect();
        if (!mounted) return;

        // Join room via WebSocket
        socketService.joinRoom(roomId, user.id, user.displayName);

        // Setup signaling event handlers
        setupSignalingHandlers(stream);
        
        setIsConnecting(false);
      } catch (error) {
        console.error('Failed to init room:', error);
        if (mounted) {
          alert('Không thể tham gia phòng họp');
          navigate('/');
        }
      }
    };

    const setupSignalingHandlers = (stream: MediaStream | null) => {
      // Handle existing users in room
      socketService.on('room-users', async (data: unknown) => {
        const { users } = data as { users: string[] };
        console.log('Existing users in room:', users);
        
        // Create peer connections and send offers to existing users
        for (const oderId of users) {
          if (stream) {
            webrtcService.createPeerConnection(oderId);
          }
          try {
            const offer = await webrtcService.createOffer(oderId);
            socketService.sendOffer(oderId, offer);
          } catch (e) {
            console.error('Failed to create offer for', oderId, e);
          }
        }
      });

      // Handle new user joined
      socketService.on('user-joined', async (data: unknown) => {
        const { userId, displayName } = data as SignalData;
        console.log('User joined:', userId, displayName);
        
        if (userId && displayName) {
          addParticipant({
            userId,
            username: userId,
            displayName,
            isMuted: false,
            isVideoOff: false,
            isScreenSharing: false,
            isHost: false,
            joinedAt: new Date().toISOString()
          });
          
          // Create peer connection and send offer to new user
          if (stream && userId !== user?.id) {
            try {
              webrtcService.createPeerConnection(userId);
              const offer = await webrtcService.createOffer(userId);
              socketService.sendOffer(userId, offer);
              console.log('Sent offer to new user:', userId);
            } catch (e) {
              console.error('Failed to create offer for new user:', userId, e);
            }
          }
        }
      });

      // Handle user left
      socketService.on('user-left', (data: unknown) => {
        const { userId } = data as { userId: string };
        console.log('User left:', userId);
        webrtcService.closePeerConnection(userId);
        handlePeerDisconnected(userId);
      });

      // Handle incoming offer
      socketService.on('offer', async (data: unknown) => {
        const { senderId, payload } = data as { senderId: string; payload: RTCSessionDescriptionInit };
        console.log('Received offer from:', senderId);
        
        try {
          const answer = await webrtcService.handleOffer(senderId, payload);
          socketService.sendAnswer(senderId, answer);
        } catch (e) {
          console.error('Failed to handle offer:', e);
        }
      });

      // Handle incoming answer
      socketService.on('answer', async (data: unknown) => {
        const { senderId, payload } = data as { senderId: string; payload: RTCSessionDescriptionInit };
        console.log('Received answer from:', senderId);
        
        try {
          await webrtcService.handleAnswer(senderId, payload);
        } catch (e) {
          console.error('Failed to handle answer:', e);
        }
      });

      // Handle ICE candidate
      socketService.on('ice-candidate', async (data: unknown) => {
        const { senderId, payload } = data as { senderId: string; payload: RTCIceCandidateInit };
        console.log('Received ICE candidate from:', senderId);
        
        try {
          await webrtcService.handleIceCandidate(senderId, payload);
        } catch (e) {
          console.error('Failed to handle ICE candidate:', e);
        }
      });

      // Handle media state changes
      socketService.on('media-state-change', (data: unknown) => {
        const { userId, mediaType, enabled } = data as SignalData;
        if (!userId || !mediaType) return;
        // Update participant state
        const updatedField = mediaType === 'audio' ? 'isMuted' : 'isVideoOff';
        const updatedValue = !enabled;
        
        // Use store's updateParticipant instead
        useRoomStore.getState().updateParticipant(userId, { [updatedField]: updatedValue });
      });
    };

    initRoom();

    return () => {
      mounted = false;
      // Cleanup
      if (roomId) {
        socketService.leaveRoom(roomId);
      }
      socketService.disconnect();
      webrtcService.closeAllConnections();
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      reset();
    };
  }, [roomId, user]);

  // Update local video element
  useEffect(() => {
    const videoElement = localVideoRef.current;
    if (videoElement && localStream) {
      // Reset video element for Firefox compatibility
      videoElement.srcObject = null;
      videoElement.srcObject = localStream;
      
      // Firefox needs explicit load and play
      videoElement.load();
      
      const playVideo = async () => {
        try {
          await videoElement.play();
          console.log('Video playing successfully');
        } catch (e) {
          console.log('Video play error, retrying...', e);
          // Retry after a short delay
          setTimeout(async () => {
            try {
              await videoElement.play();
            } catch (err) {
              console.error('Video play failed:', err);
            }
          }, 100);
        }
      };
      
      playVideo();
    }
  }, [localStream]);

  // Debug: Log stream status
  useEffect(() => {
    if (localStream) {
      console.log('Local stream tracks:', localStream.getTracks().map(t => ({ kind: t.kind, enabled: t.enabled, readyState: t.readyState })));
    }
  }, [localStream]);

  const handleToggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = isMuted;
      });
    }
    webrtcService.toggleAudio(isMuted);
    socketService.sendMediaStateChange('audio', isMuted);
    toggleMute();
  };

  const handleToggleVideo = async () => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      if (videoTracks.length > 0) {
        videoTracks.forEach(track => {
          track.enabled = isVideoOff;
        });
        webrtcService.toggleVideo(isVideoOff);
        socketService.sendMediaStateChange('video', isVideoOff);
        toggleVideo();
      } else if (isVideoOff) {
        await initCamera();
      }
    } else {
      toggleVideo();
    }
  };

  const handleToggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        
        await webrtcService.replaceVideoTrack(screenStream);
        
        screenStream.getVideoTracks()[0].onended = async () => {
          if (localStream && localVideoRef.current) {
            localVideoRef.current.srcObject = localStream;
            await webrtcService.replaceVideoTrack(localStream);
          }
          toggleScreenShare();
        };
        
        toggleScreenShare();
      } catch {
        console.log('Đã hủy chia sẻ màn hình');
      }
    } else {
      if (localStream && localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
        await webrtcService.replaceVideoTrack(localStream);
      }
      toggleScreenShare();
    }
  };

  const handleLeave = async () => {
    try {
      if (roomId) {
        await roomApi.leave(roomId);
        socketService.leaveRoom(roomId);
      }
    } catch (e) {
      console.error('Leave error:', e);
    }
    navigate('/');
  };

  const copyRoomCode = () => {
    if (currentRoom?.code) {
      navigator.clipboard.writeText(currentRoom.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const retryCamera = () => {
    initCamera();
  };

  if (isConnecting) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#1e1f22]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#5865f2] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Đang kết nối...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#1e1f22]">
      {/* Header */}
      <div className="h-14 bg-[#2b2d31] flex items-center justify-between px-4 border-b border-[#1e1f22] shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-white font-semibold text-sm md:text-base truncate max-w-[150px] md:max-w-none">
            {currentRoom?.name || 'Phòng họp'}
          </h1>
          {currentRoom?.code && (
            <button
              onClick={copyRoomCode}
              className="hidden sm:flex items-center gap-1 px-2 py-1 bg-[#35363c] rounded text-xs text-[#b5bac1] hover:bg-[#404249]"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {currentRoom.code}
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowInviteModal(true)}
            className="hidden sm:flex items-center gap-1"
          >
            <UserPlus size={14} />
            Mời
          </Button>
          <span className="text-[#b5bac1] text-sm">
            {participants.length + 1} người tham gia
          </span>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video grid */}
        <div className="flex-1 p-2 md:p-4 overflow-auto">
          <div className={`grid gap-2 md:gap-4 h-full ${
            remoteStreams.size === 0 
              ? 'grid-cols-1' 
              : remoteStreams.size <= 1 
                ? 'grid-cols-1 md:grid-cols-2' 
                : 'grid-cols-2 md:grid-cols-2 lg:grid-cols-3'
          }`}>
            {/* Local video */}
            <div className="relative bg-[#2b2d31] rounded-lg overflow-hidden min-h-[200px] md:min-h-[300px]">
              {cameraError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-[#5865f2] rounded-full flex items-center justify-center text-white text-xl md:text-2xl font-bold mb-4">
                    {user?.displayName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <p className="text-[#ed4245] text-sm mb-2">{cameraError}</p>
                  <Button size="sm" onClick={retryCamera}>Thử lại</Button>
                </div>
              ) : (
                <div className="relative w-full h-full min-h-[200px] md:min-h-[300px]">
                  {/* Video element - always rendered but hidden when video is off */}
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    webkit-playsinline="true"
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-200 ${(!localStream || isVideoOff) ? 'opacity-0' : 'opacity-100'}`}
                    style={{ transform: 'scaleX(-1)' }}
                  />
                  {/* Avatar fallback when no video */}
                  {(!localStream || isVideoOff) && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 md:w-20 md:h-20 bg-[#5865f2] rounded-full flex items-center justify-center text-white text-xl md:text-2xl font-bold">
                        {user?.displayName?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div className="absolute bottom-2 md:bottom-3 left-2 md:left-3 flex items-center gap-2 z-10">
                <span className="px-2 py-1 bg-black/50 rounded text-white text-xs md:text-sm">
                  Bạn {isMuted && '(tắt mic)'}
                </span>
              </div>
            </div>

            {/* Remote videos */}
            {Array.from(remoteStreams.values()).map((remote) => (
              <RemoteVideo 
                key={remote.oderId} 
                stream={remote.stream} 
                displayName={remote.displayName}
              />
            ))}

            {/* Participants without video stream (from database) */}
            {participants
              .filter(p => p.userId !== user?.id && !remoteStreams.has(p.userId))
              .map((participant) => (
                <div 
                  key={participant.userId}
                  className="relative bg-[#2b2d31] rounded-lg overflow-hidden aspect-video min-h-[200px]"
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-[#5865f2] rounded-full flex items-center justify-center text-white text-xl md:text-2xl font-bold">
                      {participant.displayName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  </div>
                  <div className="absolute bottom-2 md:bottom-3 left-2 md:left-3">
                    <span className="px-2 py-1 bg-black/50 rounded text-white text-xs md:text-sm">
                      {participant.displayName}
                      {participant.isMuted && ' (tắt mic)'}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Side panels */}
        {isChatOpen && <ChatPanel roomId={roomId!} />}
        {showParticipants && <ParticipantsList />}
      </div>

      {/* Invite Modal */}
      {showInviteModal && currentRoom && (
        <InviteModal
          roomId={roomId!}
          roomCode={currentRoom.code}
          onClose={() => setShowInviteModal(false)}
        />
      )}

      {/* Controls */}
      <div className="h-16 md:h-20 bg-[#2b2d31] flex items-center justify-center gap-2 md:gap-3 px-2 md:px-4 shrink-0">
        <Button
          variant={isMuted ? 'danger' : 'secondary'}
          onClick={handleToggleMute}
          className="w-10 h-10 md:w-12 md:h-12 rounded-full p-0"
          title={isMuted ? 'Bật mic' : 'Tắt mic'}
        >
          {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
        </Button>

        <Button
          variant={isVideoOff ? 'danger' : 'secondary'}
          onClick={handleToggleVideo}
          className="w-10 h-10 md:w-12 md:h-12 rounded-full p-0"
          title={isVideoOff ? 'Bật camera' : 'Tắt camera'}
        >
          {isVideoOff ? <VideoOff size={18} /> : <Video size={18} />}
        </Button>

        <Button
          variant={isScreenSharing ? 'primary' : 'secondary'}
          onClick={handleToggleScreenShare}
          className="hidden sm:flex w-10 h-10 md:w-12 md:h-12 rounded-full p-0"
          title={isScreenSharing ? 'Dừng chia sẻ' : 'Chia sẻ màn hình'}
        >
          {isScreenSharing ? <MonitorOff size={18} /> : <Monitor size={18} />}
        </Button>

        <div className="w-px h-6 md:h-8 bg-[#35363c] mx-1 md:mx-2" />

        <Button
          variant={isChatOpen ? 'primary' : 'secondary'}
          onClick={toggleChat}
          className="w-10 h-10 md:w-12 md:h-12 rounded-full p-0"
          title="Tin nhắn"
        >
          <MessageSquare size={18} />
        </Button>

        <Button
          variant={showParticipants ? 'primary' : 'secondary'}
          onClick={() => setShowParticipants(!showParticipants)}
          className="w-10 h-10 md:w-12 md:h-12 rounded-full p-0"
          title="Người tham gia"
        >
          <Users size={18} />
        </Button>

        <div className="w-px h-6 md:h-8 bg-[#35363c] mx-1 md:mx-2" />

        <Button
          variant="danger"
          onClick={handleLeave}
          className="px-3 md:px-6 h-10 md:h-auto"
        >
          <Phone size={18} className="rotate-[135deg]" />
          <span className="hidden sm:inline ml-2">Rời phòng</span>
        </Button>
      </div>
    </div>
  );
}

// Remote video component
function RemoteVideo({ stream, displayName }: { stream: MediaStream; displayName: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement && stream) {
      // Reset for Firefox compatibility
      videoElement.srcObject = null;
      videoElement.srcObject = stream;
      videoElement.load();
      
      const playVideo = async () => {
        try {
          await videoElement.play();
          setVideoReady(true);
          console.log('Remote video playing for:', displayName);
        } catch (e) {
          console.log('Remote video play error, retrying...', e);
          setTimeout(async () => {
            try {
              await videoElement.play();
              setVideoReady(true);
            } catch (err) {
              console.error('Remote video play failed:', err);
            }
          }, 100);
        }
      };
      
      playVideo();
    }
  }, [stream, displayName]);

  const hasVideo = stream.getVideoTracks().length > 0 && stream.getVideoTracks()[0].enabled;

  return (
    <div className="relative bg-[#2b2d31] rounded-lg overflow-hidden min-h-[200px] md:min-h-[300px]">
      {/* Always render video element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className={`absolute inset-0 w-full h-full object-cover ${(!hasVideo || !videoReady) ? 'opacity-0' : 'opacity-100'}`}
      />
      {/* Avatar fallback */}
      {(!hasVideo || !videoReady) && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-[#5865f2] rounded-full flex items-center justify-center text-white text-xl md:text-2xl font-bold">
            {displayName?.charAt(0).toUpperCase() || 'U'}
          </div>
        </div>
      )}
      <div className="absolute bottom-2 md:bottom-3 left-2 md:left-3 z-10">
        <span className="px-2 py-1 bg-black/50 rounded text-white text-xs md:text-sm">
          {displayName}
        </span>
      </div>
    </div>
  );
}
