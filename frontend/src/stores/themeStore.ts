import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeColor = 'purple' | 'blue' | 'green' | 'pink' | 'orange' | 'red';

interface ThemeState {
  themeColor: ThemeColor;
  setThemeColor: (color: ThemeColor) => void;
}

export const themeColors: Record<ThemeColor, { primary: string; hover: string; name: string }> = {
  purple: { primary: '#5865f2', hover: '#4752c4', name: 'Tím' },
  blue: { primary: '#3b82f6', hover: '#2563eb', name: 'Xanh dương' },
  green: { primary: '#22c55e', hover: '#16a34a', name: 'Xanh lá' },
  pink: { primary: '#ec4899', hover: '#db2777', name: 'Hồng' },
  orange: { primary: '#f97316', hover: '#ea580c', name: 'Cam' },
  red: { primary: '#ef4444', hover: '#dc2626', name: 'Đỏ' },
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      themeColor: 'purple',
      setThemeColor: (themeColor) => set({ themeColor }),
    }),
    { name: 'theme-storage' }
  )
);
