import { Search, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore, themeColors } from '../../stores/themeStore';
import { Avatar } from '../ui/Avatar';
import { ThemeSelectorCompact } from '../ui/ThemeSelector';
import { NotificationDropdown } from './NotificationDropdown';

export function Header() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { themeColor } = useThemeStore();
  const theme = themeColors[themeColor];

  return (
    <header className="h-14 bg-[#2b2d31] border-b border-[#1e1f22] flex items-center justify-between px-4 shrink-0">
      {/* Left - Logo */}
      <div className="flex items-center gap-3">
        <div 
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: theme.primary }}
        >
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
          </svg>
        </div>
        <span className="text-white font-semibold hidden sm:block">WebRTC Meet</span>
      </div>

      {/* Center - Search (optional) */}
      <div className="hidden md:flex flex-1 max-w-md mx-4">
        <div className="relative w-full">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6d6f78]" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="w-full pl-10 pr-4 py-2 bg-[#1e1f22] rounded-lg text-sm text-[#dbdee1] placeholder-[#6d6f78] focus:outline-none focus:ring-2 transition-all"
            style={{ '--tw-ring-color': theme.primary } as React.CSSProperties}
          />
        </div>
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-3">
        {/* Theme selector */}
        <div className="hidden sm:block">
          <ThemeSelectorCompact />
        </div>

        {/* Notifications */}
        <NotificationDropdown />

        {/* Settings */}
        <button 
          onClick={() => navigate('/settings')}
          className="p-2 text-[#b5bac1] hover:text-white hover:bg-[#35363c] rounded-lg transition-all"
        >
          <Settings size={20} />
        </button>

        {/* User */}
        <button 
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 p-1.5 hover:bg-[#35363c] rounded-lg transition-all"
        >
          <Avatar 
            src={user?.avatar} 
            name={user?.displayName || 'User'} 
            size="sm"
            status="online"
          />
          <span className="text-white text-sm font-medium hidden lg:block">
            {user?.displayName}
          </span>
        </button>
      </div>
    </header>
  );
}
