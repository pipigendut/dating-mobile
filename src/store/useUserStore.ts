import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { UserData } from '../shared/types/user';

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';
const DEVICE_ID_KEY = 'device_id_tracking';

interface UserState {
  userData: UserData;
  token: string | null;
  refreshToken: string | null;
  deviceId: string | null;
  isLoggedIn: boolean;
  isRegistering: boolean;
  userStatus: 'onboarding' | 'active' | 'banned' | null;
  setUserData: (data: Partial<UserData> | ((prev: UserData) => UserData)) => void;
  setTokens: (token: string | null, refreshToken: string | null) => Promise<void>;
  setIsLoggedIn: (value: boolean) => void;
  setIsRegistering: (value: boolean) => void;
  setUserStatus: (value: 'onboarding' | 'active' | 'banned' | null) => void;
  resetUser: () => Promise<void>;
  initialize: () => Promise<void>;
}

const initialUserData: UserData = {
  subscriptionPlan: 'free'
};

export const useUserStore = create<UserState>((set) => ({
  userData: initialUserData,
  token: null,
  refreshToken: null,
  deviceId: null,
  isLoggedIn: false,
  isRegistering: false,
  userStatus: null,
  setUserData: (data) => set((state) => ({
    userData: typeof data === 'function' ? data(state.userData) : { ...state.userData, ...data }
  })),
  setTokens: async (token, refreshToken) => {
    if (token && refreshToken) {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
      console.log('✅ Auth Tokens Saved to SecureStore');
    } else {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      console.log('⚠️ Auth Tokens Deleted from SecureStore');
    }
    set({ token, refreshToken });
  },
  setIsLoggedIn: (value) => set({ isLoggedIn: value }),
  setIsRegistering: (value) => set({ isRegistering: value }),
  setUserStatus: (value) => set({ userStatus: value }),
  resetUser: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    set({ userData: initialUserData, token: null, refreshToken: null, isLoggedIn: false, isRegistering: false, userStatus: null });
  },
  initialize: async () => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      const deviceId = await SecureStore.getItemAsync(DEVICE_ID_KEY);
      if (token && refreshToken) {
        set({ token, refreshToken, deviceId, isLoggedIn: true });
        console.log('✅ Auth Tokens Restored from SecureStore');
      } else if (deviceId) {
        set({ deviceId });
      }
    } catch (error) {
      console.error('Failed to initialize user session:', error);
    }
  },
}));

// Professional State Debugging with Reactotron
if (__DEV__) {
  const Reactotron = require('../shared/config/reactotron').default;
  useUserStore.subscribe((state) => {
    Reactotron.display({
      name: 'USER_STORE_UPDATE',
      value: state,
      preview: 'State Changed',
    });
  });
}
