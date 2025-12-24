import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Video } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { LoadingScreen } from '../components/ui/LoadingScreen';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore, themeColors } from '../stores/themeStore';
import { authApi } from '../services/api';

export function Register() {
  const navigate = useNavigate();
  const { login, setLoading, isLoading } = useAuthStore();
  const { themeColor } = useThemeStore();
  const theme = themeColors[themeColor];

  const [formData, setFormData] = useState({
    email: '',
    username: '',
    displayName: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [showLoading, setShowLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authApi.register(formData);
      login(response.data.user, response.data.token);
      setShowLoading(true);
    } catch {
      setError('Đăng ký thất bại. Vui lòng thử lại.');
      setLoading(false);
    }
  };

  if (showLoading) {
    return (
      <LoadingScreen 
        message="Đang tạo tài khoản..." 
        onComplete={() => {
          setLoading(false);
          navigate('/');
        }}
        duration={2000}
      />
    );
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: theme.primary }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-30"
          style={{ backgroundColor: theme.hover }}
        />
        <div 
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-20"
          style={{ backgroundColor: theme.hover }}
        />
      </div>

      <div className="w-full max-w-[480px] relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Video className="text-white" size={40} />
          </div>
          <h1 className="text-3xl font-bold text-white">WebRTC Meet</h1>
        </div>

        {/* Form Card */}
        <div className="bg-[#313338] rounded-lg shadow-2xl overflow-hidden">
          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Tạo tài khoản</h2>
              <p className="text-[#b5bac1]">Bắt đầu họp video miễn phí</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-4 bg-[#ed4245]/10 border border-[#ed4245] rounded-lg text-[#ed4245] text-sm">
                  {error}
                </div>
              )}

              <Input
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Nhập email của bạn"
                required
              />

              <Input
                label="Tên hiển thị"
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                placeholder="Tên sẽ hiển thị cho người khác"
                required
              />

              <Input
                label="Tên đăng nhập"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Tên dùng để đăng nhập"
                required
              />

              <Input
                label="Mật khẩu"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Tối thiểu 6 ký tự"
                required
              />

              <Button type="submit" className="w-full h-11" isLoading={isLoading}>
                Tiếp tục
              </Button>
            </form>

            {/* Login link */}
            <p className="mt-6 text-center text-sm text-[#b5bac1]">
              Đã có tài khoản?{' '}
              <Link 
                to="/login" 
                className="font-medium hover:underline"
                style={{ color: theme.primary }}
              >
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
