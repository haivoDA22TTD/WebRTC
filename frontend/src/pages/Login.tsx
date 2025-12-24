import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Video } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { LoadingScreen } from '../components/ui/LoadingScreen';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore, themeColors } from '../stores/themeStore';
import { authApi } from '../services/api';

export function Login() {
  const navigate = useNavigate();
  const { login, setLoading, isLoading } = useAuthStore();
  const { themeColor } = useThemeStore();
  const theme = themeColors[themeColor];
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showLoading, setShowLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authApi.login(email, password);
      login(response.data.user, response.data.token);
      setShowLoading(true);
    } catch {
      setError('Email hoặc mật khẩu không đúng');
      setLoading(false);
    }
  };

  if (showLoading) {
    return (
      <LoadingScreen 
        message="Đang đăng nhập..." 
        onComplete={() => {
          setLoading(false);
          navigate('/');
        }}
        duration={1500}
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
          className="absolute -top-40 -left-40 w-80 h-80 rounded-full opacity-30"
          style={{ backgroundColor: theme.hover }}
        />
        <div 
          className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full opacity-20"
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
              <h2 className="text-2xl font-bold text-white mb-2">Chào mừng trở lại!</h2>
              <p className="text-[#b5bac1]">Rất vui được gặp lại bạn!</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 bg-[#ed4245]/10 border border-[#ed4245] rounded-lg text-[#ed4245] text-sm">
                  {error}
                </div>
              )}

              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email của bạn"
                required
              />

              <Input
                label="Mật khẩu"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                required
              />

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-[#b5bac1] cursor-pointer hover:text-white transition-colors">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-[#4e5058] bg-[#1e1f22]"
                  />
                  Ghi nhớ đăng nhập
                </label>
                <a 
                  href="#" 
                  className="hover:underline"
                  style={{ color: theme.primary }}
                >
                  Quên mật khẩu?
                </a>
              </div>

              <Button type="submit" className="w-full h-11" isLoading={isLoading}>
                Đăng nhập
              </Button>
            </form>

            {/* Register link */}
            <p className="mt-6 text-center text-sm text-[#b5bac1]">
              Chưa có tài khoản?{' '}
              <Link 
                to="/register" 
                className="font-medium hover:underline"
                style={{ color: theme.primary }}
              >
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
