import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { UserData } from '../shared/types/user';

const TOKEN_KEY = 'auth_token';

interface UserState {
  userData: UserData;
  token: string | null;
  isLoggedIn: boolean;
  onboardingComplete: boolean;
  setUserData: (data: Partial<UserData> | ((prev: UserData) => UserData)) => void;
  setToken: (token: string | null) => Promise<void>;
  setIsLoggedIn: (value: boolean) => void;
  setOnboardingComplete: (value: boolean) => void;
  resetUser: () => Promise<void>;
  initialize: () => Promise<void>;
}

const initialUserData: UserData = {
  subscriptionPlan: 'free'
};

export const useUserStore = create<UserState>((set) => ({
  userData: initialUserData,
  token: null,
  isLoggedIn: false,
  onboardingComplete: false,
  setUserData: (data) => set((state) => ({
    userData: typeof data === 'function' ? data(state.userData) : { ...state.userData, ...data }
  })),
  setToken: async (token) => {
    if (token) {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      console.log('✅ Auth Token Saved to SecureStore');
    } else {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      console.log('⚠️ Auth Token Deleted from SecureStore');
    }
    set({ token });
  },
  setIsLoggedIn: (value) => set({ isLoggedIn: value }),
  setOnboardingComplete: (value) => set({ onboardingComplete: value }),
  resetUser: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    set({ userData: initialUserData, token: null, isLoggedIn: false, onboardingComplete: false });
  },
  initialize: async () => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (token) {
        // In a real app, you might want to validate the token here
        // or fetch user profile to see if onboarding is complete
        set({ token, isLoggedIn: true });
        console.log('Auth Token Restored from SecureStore');
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
