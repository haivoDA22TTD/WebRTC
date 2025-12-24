import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Copy, Check, ArrowLeft, Users, Lock, Globe } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { useThemeStore, themeColors } from '../stores/themeStore';
import { roomApi } from '../services/api';

export function CreateRoom() {
  const navigate = useNavigate();
  const { themeColor } = useThemeStore();
  const theme = themeColors[themeColor];

  const [roomName, setRoomName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createdRoom, setCreatedRoom] = useState<{ id: string; code: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [roomType, setRoomType] = useState<'public' | 'private'>('public');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const response = await roomApi.create(roomName || 'Cuộc họp của tôi');
      setCreatedRoom({ id: response.data.id, code: response.data.code });
    } catch {
      alert('Không thể tạo phòng họp');
    } finally {
      setIsCreating(false);
    }
  };

  const copyCode = () => {
    if (createdRoom) {
      navigator.clipboard.writeText(createdRoom.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const joinRoom = () => {
    if (createdRoom) {
      navigate(`/room/${createdRoom.id}`);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 overflow-auto">
      <div className="max-w-lg w-full">
        {!createdRoom ? (
          <div className="animate-fade-in">
            {/* Back button */}
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-[#b5bac1] hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft size={18} />
              Quay lại
            </button>

            {/* Header */}
            <div className="text-center mb-8">
              <div 
                className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-bounce-in"
                style={{ backgroundColor: theme.primary }}
              >
                <Video className="text-white" size={40} />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Tạo cuộc họp</h1>
              <p className="text-[#b5bac1]">
                Thiết lập phòng họp mới cho nhóm của bạn
              </p>
            </div>

            {/* Form */}
            <Card className="animate-slide-up">
              <CardContent>
                <form onSubmit={handleCreate} className="space-y-6">
                  <Input
                    label="Tên phòng"
                    placeholder="Cuộc họp của tôi"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                  />

                  {/* Room type */}
                  <div>
                    <label className="block text-xs font-bold text-[#b5bac1] uppercase mb-3">
                      Loại phòng
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setRoomType('public')}
                        className={`
                          p-4 rounded-xl border-2 transition-all text-left
                          ${roomType === 'public' 
                            ? 'border-current bg-opacity-10' 
                            : 'border-[#35363c] hover:border-[#4e5058]'
                          }
                        `}
                        style={{ 
                          borderColor: roomType === 'public' ? theme.primary : undefined,
                          backgroundColor: roomType === 'public' ? `${theme.primary}10` : undefined
                        }}
                      >
                        <Globe size={24} className="mb-2" style={{ color: roomType === 'public' ? theme.primary : '#b5bac1' }} />
                        <div className="font-medium text-white">Công khai</div>
                        <div className="text-xs text-[#b5bac1]">Ai có mã đều vào được</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setRoomType('private')}
                        className={`
                          p-4 rounded-xl border-2 transition-all text-left
                          ${roomType === 'private' 
                            ? 'border-current bg-opacity-10' 
                            : 'border-[#35363c] hover:border-[#4e5058]'
                          }
                        `}
                        style={{ 
                          borderColor: roomType === 'private' ? theme.primary : undefined,
                          backgroundColor: roomType === 'private' ? `${theme.primary}10` : undefined
                        }}
                      >
                        <Lock size={24} className="mb-2" style={{ color: roomType === 'private' ? theme.primary : '#b5bac1' }} />
                        <div className="font-medium text-white">Riêng tư</div>
                        <div className="text-xs text-[#b5bac1]">Cần phê duyệt để vào</div>
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="ghost"
                      className="flex-1"
                      onClick={() => navigate('/')}
                    >
                      Hủy
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1" 
                      isLoading={isCreating}
                      leftIcon={<Video size={18} />}
                    >
                      Tạo phòng
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="animate-scale-in">
            {/* Success */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-[#23a559] rounded-2xl flex items-center justify-center mx-auto mb-4 animate-bounce-in">
                <Check className="text-white" size={40} />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Đã tạo phòng!</h1>
              <p className="text-[#b5bac1]">
                Chia sẻ mã này để mời người khác tham gia
              </p>
            </div>

            {/* Room code */}
            <Card className="mb-6">
              <CardContent>
                <label className="block text-xs font-bold text-[#b5bac1] uppercase mb-3">
                  Mã phòng
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-[#1e1f22] rounded-xl px-5 py-4 text-white font-mono text-2xl tracking-widest text-center">
                    {createdRoom.code}
                  </div>
                  <Button 
                    variant="secondary" 
                    onClick={copyCode}
                    className="h-14 w-14"
                  >
                    {copied ? <Check size={20} /> : <Copy size={20} />}
                  </Button>
                </div>
                {copied && (
                  <p className="text-[#23a559] text-sm mt-2 text-center animate-fade-in">
                    Đã sao chép mã phòng!
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-3">
              <Button 
                className="w-full" 
                size="lg"
                onClick={joinRoom}
                leftIcon={<Video size={20} />}
              >
                Tham gia ngay
              </Button>
              <Button 
                variant="ghost" 
                className="w-full"
                onClick={() => navigate('/')}
                leftIcon={<ArrowLeft size={18} />}
              >
                Về trang chủ
              </Button>
            </div>

            {/* Share options */}
            <div className="mt-6 p-4 bg-[#2b2d31] rounded-xl">
              <div className="flex items-center gap-3 text-sm text-[#b5bac1]">
                <Users size={18} />
                <span>Chia sẻ mã phòng qua tin nhắn, email hoặc mạng xã hội</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
