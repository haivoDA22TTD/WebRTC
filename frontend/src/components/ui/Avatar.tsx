import { useThemeStore, themeColors } from '../../stores/themeStore';

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'busy' | 'away';
  className?: string;
}

export function Avatar({ src, name, size = 'md', status, className = '' }: AvatarProps) {
  const { themeColor } = useThemeStore();
  const theme = themeColors[themeColor];

  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  };

  const statusColors = {
    online: 'bg-[#23a559]',
    offline: 'bg-[#80848e]',
    busy: 'bg-[#ed4245]',
    away: 'bg-[#f0b232]',
  };

  const statusSizes = {
    sm: 'w-2.5 h-2.5 border',
    md: 'w-3 h-3 border-2',
    lg: 'w-3.5 h-3.5 border-2',
    xl: 'w-4 h-4 border-2',
  };

  const initial = name?.charAt(0).toUpperCase() || '?';

  return (
    <div className={`relative inline-block ${className}`}>
      <div 
        className={`
          ${sizes[size]} 
          rounded-full 
          flex items-center justify-center 
          text-white font-semibold
          overflow-hidden
          ring-2 ring-transparent
          hover:ring-[#35363c]
          transition-all duration-200
        `}
        style={{ backgroundColor: src ? undefined : theme.primary }}
      >
        {src ? (
          <img 
            src={src} 
            alt={name} 
            className="w-full h-full object-cover"
          />
        ) : (
          initial
        )}
      </div>
      {status && (
        <div 
          className={`
            absolute bottom-0 right-0 
            ${statusSizes[size]} 
            ${statusColors[status]} 
            rounded-full 
            border-[#2b2d31]
          `}
        />
      )}
    </div>
  );
}
