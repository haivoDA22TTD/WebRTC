import { useState, useRef, useEffect } from 'react';
import { Send, X } from 'lucide-react';
import { useRoomStore } from '../../stores/roomStore';
import { useAuthStore } from '../../stores/authStore';
import { socketService } from '../../services/socket';
import type { Message } from '../../types';

interface ChatPanelProps {
  roomId: string;
}

export function ChatPanel({ roomId }: ChatPanelProps) {
  const { messages, addMessage, toggleChat } = useRoomStore();
  const { user } = useAuthStore();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMessage = (data: unknown) => {
      const chatData = data as { type: string; message: Message };
      // Không thêm tin nhắn của chính mình (đã optimistic update)
      if (chatData.message?.senderId !== user?.id) {
        addMessage(chatData.message);
      }
    };

    socketService.on('chat-message', handleMessage);
    return () => socketService.off('chat-message', handleMessage);
  }, [addMessage, user?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    socketService.sendMessage(roomId, newMessage, user!.displayName);
    
    // Optimistic update
    addMessage({
      id: Date.now().toString(),
      roomId,
      senderId: user!.id,
      senderName: user!.displayName,
      senderAvatar: user?.avatar,
      content: newMessage,
      type: 'text',
      createdAt: new Date().toISOString(),
    });

    setNewMessage('');
  };

  return (
    <div className="w-80 bg-[#2b2d31] border-l border-[#1e1f22] flex flex-col">
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-[#1e1f22]">
        <h3 className="text-white font-semibold">Tin nhắn trong cuộc họp</h3>
        <button
          onClick={toggleChat}
          className="text-[#b5bac1] hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-[#b5bac1] text-sm py-8">
            <p>Tin nhắn chỉ hiển thị với người trong cuộc họp</p>
            <p className="mt-1">và sẽ bị xóa khi cuộc họp kết thúc</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="flex gap-3">
              <div className="w-8 h-8 bg-[#5865f2] rounded-full flex items-center justify-center text-white text-sm font-medium shrink-0">
                {msg.senderAvatar ? (
                  <img src={msg.senderAvatar} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  msg.senderName.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-white font-medium text-sm">{msg.senderName}</span>
                  <span className="text-[#6d6f78] text-xs">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-[#dbdee1] text-sm break-words">{msg.content}</p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-[#1e1f22]">
        <div className="flex items-center gap-2 bg-[#383a40] rounded-lg px-3 py-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Gửi tin nhắn cho mọi người"
            className="flex-1 bg-transparent text-white placeholder-[#6d6f78] text-sm focus:outline-none"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="text-[#b5bac1] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
