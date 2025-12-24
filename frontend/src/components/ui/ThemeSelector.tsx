import { Check } from 'lucide-react';
import { useThemeStore, themeColors, type ThemeColor } from '../../stores/themeStore';

interface ThemeSelectorProps {
  className?: string;
}

export function ThemeSelector({ className = '' }: ThemeSelectorProps) {
  const { themeColor, setThemeColor } = useThemeStore();

  return (
    <div className={`${className}`}>
      <label className="block text-xs font-bold text-[#b5bac1] uppercase mb-3">
        Màu chủ đề
      </label>
      <div className="flex flex-wrap gap-3">
        {(Object.keys(themeColors) as ThemeColor[]).map((color) => (
          <button
            key={color}
            onClick={() => setThemeColor(color)}
            className={`
              w-10 h-10 rounded-full 
              flex items-center justify-center
              transition-all duration-200
              hover:scale-110
              active:scale-95
              ${themeColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-[#1e1f22]' : ''}
            `}
            style={{ backgroundColor: themeColors[color].primary }}
            title={themeColors[color].name}
          >
            {themeColor === color && (
              <Check size={18} className="text-white" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ThemeSelectorCompact() {
  const { themeColor, setThemeColor } = useThemeStore();

  return (
    <div className="flex gap-2">
      {(Object.keys(themeColors) as ThemeColor[]).map((color) => (
        <button
          key={color}
          onClick={() => setThemeColor(color)}
          className={`
            w-6 h-6 rounded-full 
            transition-all duration-200
            hover:scale-110
            ${themeColor === color ? 'ring-2 ring-white' : ''}
          `}
          style={{ backgroundColor: themeColors[color].primary }}
          title={themeColors[color].name}
        />
      ))}
    </div>
  );
}
