import { Home, Plus, Settings, LogOut, Video, Users, MessageSquare, BarChart3 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore, themeColors } from '../../stores/themeStore';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  isActive?: boolean;
  variant?: 'default' | 'success' | 'danger';
}

function NavItem({ icon, label, onClick, isActive, variant = 'default' }: NavItemProps) {
  const { themeColor } = useThemeStore();
  const theme = themeColors[themeColor];

  const getHoverBg = () => {
    switch (variant) {
      case 'success': return 'hover:bg-[#23a559]';
      case 'danger': return 'hover:bg-[#ed4245]';
      default: return '';
    }
  };

  const getTextColor = () => {
    if (variant === 'success') return 'text-[#23a559] group-hover:text-white';
    if (variant === 'danger') return 'text-[#b5bac1] group-hover:text-white';
    return 'text-white';
  };

  return (
    <div className="relative group">
      <button
        onClick={onClick}
        className={`
          w-12 h-12 
          rounded-2xl hover:rounded-xl 
          transition-all duration-300 ease-out
          flex items-center justify-center 
          ${getHoverBg()}
          ${isActive ? 'rounded-xl' : ''}
          group
        `}
        style={{ 
          backgroundColor: isActive ? theme.primary : '#313338',
          ...(variant === 'default' && !isActive ? { ':hover': { backgroundColor: theme.primary } } : {})
        }}
        onMouseEnter={(e) => {
          if (variant === 'default' && !isActive) {
            e.currentTarget.style.backgroundColor = theme.primary;
          }
        }}
        onMouseLeave={(e) => {
          if (variant === 'default' && !isActive) {
            e.currentTarget.style.backgroundColor = '#313338';
          }
        }}
        title={label}
      >
        <span className={getTextColor()}>
          {icon}
        </span>
      </button>
      
      {/* Active indicator */}
      <div 
        className={`
          absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1
          w-1 rounded-r-full bg-white
          transition-all duration-200
          ${isActive ? 'h-10' : 'h-0 group-hover:h-5'}
        `}
      />
      
      {/* Tooltip */}
      <div className="
        absolute left-full ml-4 top-1/2 -translate-y-1/2
        px-3 py-2 
        bg-[#111214] text-white text-sm font-medium
        rounded-md shadow-lg
        opacity-0 invisible group-hover:opacity-100 group-hover:visible
        transition-all duration-200
        whitespace-nowrap
        z-50
      ">
        {label}
        <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-[#111214]" />
      </div>
    </div>
  );
}

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { themeColor } = useThemeStore();
  const theme = themeColors[themeColor];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="w-[72px] bg-[#1e1f22] flex flex-col items-center py-3 gap-2">
      {/* Logo */}
      <div 
        className="w-12 h-12 rounded-2xl flex items-center justify-center mb-2 animate-pulse-glow cursor-pointer hover:rounded-xl transition-all duration-300"
        style={{ backgroundColor: theme.primary }}
        onClick={() => navigate('/')}
      >
        <Video className="text-white" size={24} />
      </div>

      <div className="w-8 h-[2px] bg-[#35363c] rounded-full my-1" />

      {/* Navigation */}
      <NavItem 
        icon={<Home size={24} />}
        label="Trang chủ"
        onClick={() => navigate('/')}
        isActive={location.pathname === '/'}
      />

      <NavItem 
        icon={<Plus size={24} />}
        label="Tạo phòng họp"
        onClick={() => navigate('/create-room')}
        isActive={location.pathname === '/create-room'}
        variant="success"
      />

      <NavItem 
        icon={<Users size={24} />}
        label="Danh bạ"
        onClick={() => navigate('/contacts')}
        isActive={location.pathname === '/contacts'}
      />

      <NavItem 
        icon={<MessageSquare size={24} />}
        label="Tin nhắn"
        onClick={() => navigate('/messages')}
        isActive={location.pathname === '/messages'}
      />

      <NavItem 
        icon={<BarChart3 size={24} />}
        label="Thống kê"
        onClick={() => navigate('/analytics')}
        isActive={location.pathname === '/analytics'}
      />

      {/* Spacer */}
      <div className="flex-1" />

      {/* Settings */}
      <NavItem 
        icon={<Settings size={20} />}
        label="Cài đặt"
        onClick={() => navigate('/settings')}
        isActive={location.pathname === '/settings'}
      />

      {/* User avatar / Logout */}
      <div className="relative group">
        <button
          onClick={handleLogout}
          className="w-12 h-12 bg-[#313338] hover:bg-[#ed4245] rounded-2xl hover:rounded-xl transition-all duration-300 flex items-center justify-center overflow-hidden"
          title="Đăng xuất"
        >
          {user?.avatar ? (
            <img src={user.avatar} alt={user.displayName} className="w-full h-full object-cover" />
          ) : (
            <LogOut size={20} className="text-[#b5bac1] group-hover:text-white transition-colors" />
          )}
        </button>
        
        {/* Tooltip */}
        <div className="
          absolute left-full ml-4 top-1/2 -translate-y-1/2
          px-3 py-2 
          bg-[#111214] text-white text-sm font-medium
          rounded-md shadow-lg
          opacity-0 invisible group-hover:opacity-100 group-hover:visible
          transition-all duration-200
          whitespace-nowrap
          z-50
        ">
          Đăng xuất
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-[#111214]" />
        </div>
      </div>
    </div>
  );
}
