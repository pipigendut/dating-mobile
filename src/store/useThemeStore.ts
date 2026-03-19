import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

export type ThemeMode = 'light' | 'dark' | 'system';
const THEME_KEY = 'app_theme_mode';

interface ThemeState {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  initialize: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set) => ({
  themeMode: 'system',
  setThemeMode: async (mode: ThemeMode) => {
    await SecureStore.setItemAsync(THEME_KEY, mode);
    set({ themeMode: mode });
  },
  initialize: async () => {
    try {
      const savedMode = await SecureStore.getItemAsync(THEME_KEY);
      if (savedMode) {
        set({ themeMode: savedMode as ThemeMode });
      }
    } catch (error) {
      console.error('Failed to load theme preference:', error);
    }
  },
}));
