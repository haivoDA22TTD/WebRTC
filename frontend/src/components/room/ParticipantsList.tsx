import { Mic, MicOff, Video, VideoOff, Crown, Bot } from 'lucide-react';
import { useRoomStore } from '../../stores/roomStore';
import { useAuthStore } from '../../stores/authStore';

export function ParticipantsList() {
  const { participants, isMuted, isVideoOff } = useRoomStore();
  const { user } = useAuthStore();

  // Check if participant is AI bot
  const isAIBot = (displayName: string) => {
    return displayName.toLowerCase().includes('ai') || 
           displayName.toLowerCase().includes('bot') ||
           displayName.toLowerCase().includes('assistant');
  };

  return (
    <div className="w-80 bg-[#2b2d31] border-l border-[#1e1f22] flex flex-col">
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-[#1e1f22]">
        <h3 className="text-white font-semibold">
          Người tham gia ({participants.length + 1})
        </h3>
      </div>

      {/* Participants list */}
      <div className="flex-1 overflow-y-auto p-2">
        {/* Current user */}
        <div className="flex items-center gap-3 p-2 rounded hover:bg-[#35363c] transition-colors">
          <div className="w-10 h-10 bg-[#5865f2] rounded-full flex items-center justify-center text-white font-medium">
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              user?.displayName?.charAt(0).toUpperCase() || 'U'
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-white font-medium text-sm truncate">
                {user?.displayName} (Bạn)
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {isMuted ? (
              <MicOff size={16} className="text-[#ed4245]" />
            ) : (
              <Mic size={16} className="text-[#b5bac1]" />
            )}
            {isVideoOff ? (
              <VideoOff size={16} className="text-[#ed4245]" />
            ) : (
              <Video size={16} className="text-[#b5bac1]" />
            )}
          </div>
        </div>

        {/* Other participants */}
        {participants.map((participant) => (
          <div
            key={participant.userId}
            className="flex items-center gap-3 p-2 rounded hover:bg-[#35363c] transition-colors"
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium relative"
                 style={{ 
                   background: isAIBot(participant.displayName) 
                     ? 'linear-gradient(135deg, #5865f2, #eb459e)' 
                     : '#5865f2' 
                 }}>
              {participant.avatar ? (
                <img src={participant.avatar} alt="" className="w-full h-full rounded-full object-cover" />
              ) : isAIBot(participant.displayName) ? (
                <Bot size={20} />
              ) : (
                participant.displayName.charAt(0).toUpperCase()
              )}
              {participant.isHost && (
                <Crown size={12} className="absolute -top-1 -right-1 text-[#faa61a]" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-white font-medium text-sm truncate">
                  {participant.displayName}
                </span>
                {isAIBot(participant.displayName) && (
                  <span className="px-1.5 py-0.5 bg-gradient-to-r from-[#5865f2] to-[#eb459e] rounded text-[10px] text-white font-medium">
                    AI
                  </span>
                )}
                {participant.isHost && (
                  <span className="text-[#faa61a] text-xs">(Chủ phòng)</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              {participant.isMuted ? (
                <MicOff size={16} className="text-[#ed4245]" />
              ) : (
                <Mic size={16} className="text-[#b5bac1]" />
              )}
              {participant.isVideoOff ? (
                <VideoOff size={16} className="text-[#ed4245]" />
              ) : (
                <Video size={16} className="text-[#b5bac1]" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
