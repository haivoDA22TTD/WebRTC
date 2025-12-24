import { useEffect, useState } from 'react';
import { useThemeStore, themeColors } from '../../stores/themeStore';

interface LoadingScreenProps {
  message?: string;
  onComplete?: () => void;
  duration?: number;
}

export function LoadingScreen({ message = 'Đang tải...', onComplete, duration = 2000 }: LoadingScreenProps) {
  const { themeColor } = useThemeStore();
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, duration / 50);

    return () => clearInterval(interval);
  }, [duration]);

  useEffect(() => {
    if (progress >= 100) {
      setTimeout(() => {
        setFadeOut(true);
        setTimeout(() => {
          onComplete?.();
        }, 500);
      }, 300);
    }
  }, [progress, onComplete]);

  const primaryColor = themeColors[themeColor].primary;

  return (
    <div 
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#1e1f22] transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
    >
      {/* Logo animation */}
      <div className="relative mb-8">
        <div 
          className="w-20 h-20 rounded-2xl flex items-center justify-center animate-pulse"
          style={{ backgroundColor: primaryColor }}
        >
          <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
          </svg>
        </div>
        {/* Ripple effect */}
        <div 
          className="absolute inset-0 rounded-2xl animate-ping opacity-20"
          style={{ backgroundColor: primaryColor }}
        />
      </div>

      {/* App name */}
      <h1 className="text-3xl font-bold text-white mb-2 animate-fade-in">
        WebRTC Meet
      </h1>
      <p className="text-[#b5bac1] mb-8 animate-fade-in-delay">{message}</p>

      {/* Progress bar */}
      <div className="w-64 h-1 bg-[#35363c] rounded-full overflow-hidden">
        <div 
          className="h-full transition-all duration-100 ease-out rounded-full"
          style={{ 
            width: `${progress}%`,
            backgroundColor: primaryColor
          }}
        />
      </div>
      <p className="text-[#6d6f78] text-sm mt-2">{progress}%</p>
    </div>
  );
}

export function PageLoader() {
  const { themeColor } = useThemeStore();
  const primaryColor = themeColors[themeColor].primary;

  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="relative">
        <div 
          className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin"
          style={{ borderColor: `${primaryColor}33`, borderTopColor: primaryColor }}
        />
      </div>
    </div>
  );
}

export function ButtonLoader() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
