import { useState } from 'react';
import { X, Mail, Send, Loader2, Check, Copy } from 'lucide-react';
import { Button } from '../ui/Button';
import { roomApi } from '../../services/api';

interface InviteModalProps {
  roomId: string;
  roomCode: string;
  onClose: () => void;
}

export function InviteModal({ roomId, roomCode, onClose }: InviteModalProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const roomLink = `${window.location.origin}/join/${roomCode}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await roomApi.invite(roomId, email.trim());
      setSuccess(true);
      setEmail('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Không thể gửi lời mời');
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(roomLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#313338] rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-[#3f4147]">
          <h2 className="text-white font-semibold">Mời người tham gia</h2>
          <button onClick={onClose} className="text-[#b5bac1] hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Copy link section */}
          <div>
            <label className="block text-[#b5bac1] text-sm mb-2">
              Hoặc chia sẻ link phòng họp
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={roomLink}
                readOnly
                className="flex-1 bg-[#1e1f22] text-[#dbdee1] px-3 py-2 rounded text-sm"
              />
              <Button variant="secondary" onClick={copyLink} className="shrink-0">
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#3f4147]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#313338] text-[#b5bac1]">hoặc</span>
            </div>
          </div>

          {/* Email invite form */}
          <form onSubmit={handleSubmit}>
            <label className="block text-[#b5bac1] text-sm mb-2">
              Gửi lời mời qua email
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b5bac1]" size={16} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full bg-[#1e1f22] text-[#dbdee1] pl-10 pr-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#5865f2]"
                  disabled={loading}
                />
              </div>
              <Button type="submit" disabled={loading || !email.trim()}>
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
              </Button>
            </div>
          </form>

          {success && (
            <div className="flex items-center gap-2 text-green-400 text-sm">
              <Check size={16} />
              Đã gửi lời mời thành công!
            </div>
          )}

          {error && (
            <div className="text-[#ed4245] text-sm">{error}</div>
          )}
        </div>
      </div>
    </div>
  );
}
