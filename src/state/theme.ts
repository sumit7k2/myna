import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage } from '@/lib/storage';

export type ThemeName = 'light' | 'dark' | 'system';

type ThemeState = {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (t) => set({ theme: t })
    }),
    {
      name: 'theme',
      storage: createJSONStorage(() => ({
        setItem: (k, v) => storage.set(k, v),
        getItem: (k) => storage.getString(k) ?? null,
        removeItem: (k) => storage.delete(k)
      }))
    }
  )
);
