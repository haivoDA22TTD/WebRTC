import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Bell, Shield, Palette, Volume2, Video, Mic } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { ThemeSelector } from '../components/ui/ThemeSelector';
import { Avatar } from '../components/ui/Avatar';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore, themeColors } from '../stores/themeStore';

type SettingsTab = 'profile' | 'appearance' | 'audio-video' | 'notifications' | 'privacy';

export function Settings() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const { themeColor } = useThemeStore();
  const theme = themeColors[themeColor];

  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [displayName, setDisplayName] = useState(user?.displayName || '');

  const tabs = [
    { id: 'profile' as const, label: 'Hồ sơ', icon: User },
    { id: 'appearance' as const, label: 'Giao diện', icon: Palette },
    { id: 'audio-video' as const, label: 'Âm thanh & Video', icon: Video },
    { id: 'notifications' as const, label: 'Thông báo', icon: Bell },
    { id: 'privacy' as const, label: 'Bảo mật', icon: Shield },
  ];

  const handleSaveProfile = () => {
    updateUser({ displayName });
    alert('Đã lưu thay đổi!');
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-[#2b2d31] border-r border-[#1e1f22] p-4 hidden md:block">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-[#b5bac1] hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={18} />
          Quay lại
        </button>

        <h2 className="text-white font-semibold mb-4">Cài đặt</h2>

        <nav className="space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                ${activeTab === tab.id 
                  ? 'text-white' 
                  : 'text-[#b5bac1] hover:text-white hover:bg-[#35363c]'
                }
              `}
              style={{ 
                backgroundColor: activeTab === tab.id ? `${theme.primary}20` : undefined,
                color: activeTab === tab.id ? theme.primary : undefined
              }}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl mx-auto">
          {/* Mobile back button */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-[#b5bac1] hover:text-white mb-6 transition-colors md:hidden"
          >
            <ArrowLeft size={18} />
            Quay lại
          </button>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">Hồ sơ của tôi</h1>
                <p className="text-[#b5bac1]">Quản lý thông tin cá nhân của bạn</p>
              </div>

              <Card>
                <CardContent>
                  <div className="flex items-center gap-4 mb-6">
                    <Avatar 
                      src={user?.avatar} 
                      name={user?.displayName || 'User'} 
                      size="xl"
                    />
                    <div>
                      <Button variant="secondary" size="sm">Đổi ảnh đại diện</Button>
                      <p className="text-xs text-[#6d6f78] mt-1">JPG, PNG. Tối đa 2MB</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Input
                      label="Tên hiển thị"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                    />
                    <Input
                      label="Email"
                      value={user?.email || ''}
                      disabled
                    />
                    <Input
                      label="Tên đăng nhập"
                      value={user?.username || ''}
                      disabled
                    />
                  </div>

                  <div className="mt-6 flex justify-end">
                    <Button onClick={handleSaveProfile}>Lưu thay đổi</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">Giao diện</h1>
                <p className="text-[#b5bac1]">Tùy chỉnh giao diện ứng dụng</p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Màu chủ đề</CardTitle>
                  <CardDescription>Chọn màu yêu thích của bạn</CardDescription>
                </CardHeader>
                <CardContent>
                  <ThemeSelector />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Chế độ hiển thị</CardTitle>
                  <CardDescription>Chọn chế độ sáng hoặc tối</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3">
                    <button className="flex-1 p-4 bg-[#1e1f22] rounded-xl border-2 border-current text-center" style={{ borderColor: theme.primary }}>
                      <div className="w-full h-20 bg-[#1e1f22] rounded-lg mb-2 border border-[#35363c]" />
                      <span className="text-white text-sm font-medium">Tối</span>
                    </button>
                    <button className="flex-1 p-4 bg-[#1e1f22] rounded-xl border-2 border-[#35363c] text-center opacity-50 cursor-not-allowed">
                      <div className="w-full h-20 bg-white rounded-lg mb-2" />
                      <span className="text-[#b5bac1] text-sm font-medium">Sáng (Sắp có)</span>
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Audio & Video Tab */}
          {activeTab === 'audio-video' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">Âm thanh & Video</h1>
                <p className="text-[#b5bac1]">Cài đặt thiết bị đầu vào/ra</p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mic size={18} />
                    Microphone
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <select className="w-full px-3 py-2.5 bg-[#1e1f22] border-2 border-[#1e1f22] rounded-lg text-[#dbdee1] focus:outline-none focus:border-[#5865f2]">
                    <option>Default - Microphone (Realtek Audio)</option>
                  </select>
                  <div className="mt-4">
                    <label className="text-xs font-bold text-[#b5bac1] uppercase mb-2 block">Âm lượng đầu vào</label>
                    <input type="range" className="w-full" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Volume2 size={18} />
                    Loa
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <select className="w-full px-3 py-2.5 bg-[#1e1f22] border-2 border-[#1e1f22] rounded-lg text-[#dbdee1] focus:outline-none focus:border-[#5865f2]">
                    <option>Default - Speakers (Realtek Audio)</option>
                  </select>
                  <div className="mt-4">
                    <label className="text-xs font-bold text-[#b5bac1] uppercase mb-2 block">Âm lượng đầu ra</label>
                    <input type="range" className="w-full" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video size={18} />
                    Camera
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <select className="w-full px-3 py-2.5 bg-[#1e1f22] border-2 border-[#1e1f22] rounded-lg text-[#dbdee1] focus:outline-none focus:border-[#5865f2]">
                    <option>Default - HD Webcam</option>
                  </select>
                  <div className="mt-4 aspect-video bg-[#1e1f22] rounded-lg flex items-center justify-center">
                    <p className="text-[#6d6f78]">Xem trước camera</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">Thông báo</h1>
                <p className="text-[#b5bac1]">Quản lý cài đặt thông báo</p>
              </div>

              <Card>
                <CardContent className="space-y-4">
                  {[
                    { label: 'Thông báo cuộc họp mới', desc: 'Nhận thông báo khi có người mời bạn vào cuộc họp' },
                    { label: 'Tin nhắn trong cuộc họp', desc: 'Nhận thông báo khi có tin nhắn mới' },
                    { label: 'Âm thanh thông báo', desc: 'Phát âm thanh khi có thông báo' },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between py-2">
                      <div>
                        <div className="text-white font-medium">{item.label}</div>
                        <div className="text-sm text-[#b5bac1]">{item.desc}</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-[#4e5058] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#23a559]"></div>
                      </label>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">Bảo mật</h1>
                <p className="text-[#b5bac1]">Quản lý cài đặt bảo mật và quyền riêng tư</p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Đổi mật khẩu</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input label="Mật khẩu hiện tại" type="password" />
                  <Input label="Mật khẩu mới" type="password" />
                  <Input label="Xác nhận mật khẩu mới" type="password" />
                  <Button>Cập nhật mật khẩu</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-[#ed4245]">Vùng nguy hiểm</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[#b5bac1] mb-4">Xóa tài khoản sẽ xóa vĩnh viễn tất cả dữ liệu của bạn.</p>
                  <Button variant="danger">Xóa tài khoản</Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
