import { create } from 'zustand';
import { userService } from '../services/api/user';
import { useUserStore } from './useUserStore';

export interface NotificationSetting {
  id: string;
  type: string;
  title: string;
  description: string;
  is_enable: boolean;      // Global master setting
  is_user_enable: boolean; // Specific user preference
}

interface NotificationState {
  /** Master toggle — reflects OS permission granted state (Local only) */
  pushEnabled: boolean;
  /** Settings fetched from backend */
  settings: NotificationSetting[];
  isLoading: boolean;

  setPushEnabled: (enabled: boolean) => void;
  setSetting: (settingId: string, value: boolean) => Promise<void>;
  /** Load settings from backend and sync with local stash if needed */
  initialize: () => Promise<void>;
  /** Disable all settings locally */
  deactivateAll: () => void;
  /** Helper to check if a specific type is enabled */
  isTypeEnabled: (type: string) => boolean;
}


export const useNotificationStore = create<NotificationState>((set, get) => ({
  pushEnabled: true,
  settings: [],
  isLoading: false,

  setPushEnabled: (enabled) => set({ pushEnabled: enabled }),

  setSetting: async (settingId, value) => {
    // 1. Update local state for immediate UI feedback (update is_user_enable)
    const updated = get().settings.map(s => 
      s.id === settingId ? { ...s, is_user_enable: value } : s
    );
    set({ settings: updated });

    // 2. Sync to backend
    try {
      await userService.updateNotificationSetting(settingId, value);
    } catch (e) {
      console.error('[NotificationStore] Failed to sync setting to backend:', e);
    }
  },

  initialize: async () => {
    const { isLoggedIn } = useUserStore.getState();
    if (!isLoggedIn) return;

    set({ isLoading: true });
    try {
      const response = await userService.getNotificationSettings();
      // Since userService already returns response.data (which is unwrapped by the interceptor),
      // 'response' here is already the array of settings.
      if (Array.isArray(response)) {
        set({ settings: response });
      } else if (response && response.data) {
        // Fallback in case it's not unwrapped
        set({ settings: response.data });
      }
    } catch (e) {
      console.error('[NotificationStore] Failed to load settings:', e);
    } finally {
      set({ isLoading: false });
    }
  },

  deactivateAll: () => {
    const disabled = get().settings.map(s => ({ ...s, is_user_enable: false }));
    set({ settings: disabled, pushEnabled: false });
  },

  isTypeEnabled: (type: string) => {
    const { pushEnabled, settings } = get();
    if (!pushEnabled) return false;

    const setting = settings.find(s => s.type === type);
    // Logic: both global master AND user preference must be TRUE
    if (!setting) return true; // Default to true if not found in backend yet
    return setting.is_enable && setting.is_user_enable;
  },


}));



