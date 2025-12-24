import { Heart } from 'lucide-react';
import { useThemeStore, themeColors } from '../../stores/themeStore';

export function Footer() {
  const { themeColor } = useThemeStore();
  const theme = themeColors[themeColor];

  return (
    <footer className="h-10 bg-[#1e1f22] border-t border-[#35363c] flex items-center justify-center px-4 text-xs text-[#6d6f78]">
      <span className="flex items-center gap-1">
        © 2025 haivoDev. Made with <Heart size={12} style={{ color: theme.primary }} className="inline" /> in Vietnam
      </span>
    </footer>
  );
}
