import { Mic, MicOff, Video, VideoOff, Crown } from 'lucide-react';
import { useRoomStore } from '../../stores/roomStore';
import { useAuthStore } from '../../stores/authStore';

export function ParticipantsList() {
  const { participants, isMuted, isVideoOff } = useRoomStore();
  const { user } = useAuthStore();

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
            <div className="w-10 h-10 bg-[#5865f2] rounded-full flex items-center justify-center text-white font-medium relative">
              {participant.avatar ? (
                <img src={participant.avatar} alt="" className="w-full h-full rounded-full object-cover" />
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
