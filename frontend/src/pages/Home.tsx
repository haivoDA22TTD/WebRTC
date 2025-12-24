import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Users, Plus, ArrowRight, Sparkles, Shield, Zap } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore, themeColors } from '../stores/themeStore';
import { roomApi } from '../services/api';

export function Home() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { themeColor } = useThemeStore();
  const theme = themeColors[themeColor];
  
  const [roomCode, setRoomCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode.trim()) return;

    setIsJoining(true);
    try {
      const response = await roomApi.join(roomCode);
      navigate(`/room/${response.data.id}`);
    } catch {
      alert('Không tìm thấy phòng hoặc mã không hợp lệ');
    } finally {
      setIsJoining(false);
    }
  };

  const features = [
    { icon: Sparkles, label: 'HD', desc: 'Chất lượng video', color: theme.primary },
    { icon: Users, label: '100+', desc: 'Người tham gia', color: '#23a559' },
    { icon: Zap, label: '∞', desc: 'Thời gian họp', color: '#eb459e' },
    { icon: Shield, label: 'E2E', desc: 'Mã hóa đầu cuối', color: '#f0b232' },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 overflow-auto">
      <div className="max-w-3xl w-full">
        {/* Welcome */}
        <div className="text-center mb-10">
          <div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-4"
            style={{ backgroundColor: `${theme.primary}20`, color: theme.primary }}
          >
            <Sparkles size={16} />
            Chào mừng đến với WebRTC Meet
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Xin chào, <span style={{ color: theme.primary }}>{user?.displayName || 'Bạn'}</span>!
          </h1>
          <p className="text-[#b5bac1] text-base md:text-lg">
            Kết nối với mọi người qua video call chất lượng cao, miễn phí và bảo mật
          </p>
        </div>

        {/* Action cards */}
        <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-8">
          {/* Create meeting */}
          <Card hover>
            <CardContent>
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: theme.primary }}
              >
                <Plus className="text-white" size={24} />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Cuộc họp mới</h3>
              <p className="text-[#b5bac1] text-sm mb-4">
                Tạo phòng họp mới và mời người khác tham gia
              </p>
              <Button 
                onClick={() => navigate('/create-room')}
                leftIcon={<Video size={18} />}
                className="w-full"
              >
                Tạo phòng
              </Button>
            </CardContent>
          </Card>

          {/* Join meeting */}
          <Card hover>
            <CardContent>
              <div className="w-12 h-12 bg-[#23a559] rounded-xl flex items-center justify-center mb-4">
                <Users className="text-white" size={24} />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Tham gia cuộc họp</h3>
              <p className="text-[#b5bac1] text-sm mb-4">
                Nhập mã phòng để tham gia cuộc họp đang diễn ra
              </p>
              <form onSubmit={handleJoinRoom} className="flex gap-2">
                <Input
                  placeholder="Nhập mã phòng"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  type="submit" 
                  variant="secondary" 
                  isLoading={isJoining}
                  className="px-4"
                >
                  <ArrowRight size={18} />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-[#2b2d31] rounded-xl p-4 text-center"
            >
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2"
                style={{ backgroundColor: `${feature.color}20` }}
              >
                <feature.icon size={16} style={{ color: feature.color }} />
              </div>
              <div className="font-bold text-xl text-white">{feature.label}</div>
              <div className="text-[#6d6f78] text-xs">{feature.desc}</div>
            </div>
          ))}
        </div>

        {/* Quick tips */}
        <div className="bg-[#2b2d31] rounded-xl p-5 border border-[#35363c]">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2 text-sm">
            <Sparkles size={16} style={{ color: theme.primary }} />
            Mẹo nhanh
          </h3>
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-[#35363c] flex items-center justify-center text-white text-xs font-bold shrink-0">1</span>
              <p className="text-[#b5bac1]">Nhấn <kbd className="px-1 py-0.5 bg-[#1e1f22] rounded">M</kbd> để tắt/bật mic</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-[#35363c] flex items-center justify-center text-white text-xs font-bold shrink-0">2</span>
              <p className="text-[#b5bac1]">Nhấn <kbd className="px-1 py-0.5 bg-[#1e1f22] rounded">V</kbd> để tắt/bật camera</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-[#35363c] flex items-center justify-center text-white text-xs font-bold shrink-0">3</span>
              <p className="text-[#b5bac1]">Chia sẻ mã phòng để mời bạn bè</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
