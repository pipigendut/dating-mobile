import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import * as FileSystem from 'expo-file-system/legacy';
import { UserData } from '../shared/types/user';
import { mapUserResponseToData } from '../utils/userMapper';

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';
const DEVICE_ID_KEY = 'device_id_tracking';
const USER_DATA_PATH = `${FileSystem.documentDirectory}user_data.json`;

interface UserState {
  userData: UserData;
  token: string | null;
  refreshToken: string | null;
  isLoggedIn: boolean;
  isRegistering: boolean;
  userStatus: string | null;
  setUserData: (data: Partial<UserData> | ((prev: UserData) => UserData)) => void;
  setTokens: (token: string, refreshToken: string) => Promise<void>;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  setIsRegistering: (isRegistering: boolean) => void;
  setUserStatus: (status: string | null) => void;
  resetUser: () => Promise<void>;
  initialize: () => Promise<void>;
}

const initialUserData: UserData = {
  email: '',
  fullName: '',
};

export const useUserStore = create<UserState>((set, get) => ({
  userData: initialUserData,
  token: null,
  refreshToken: null,
  isLoggedIn: false,
  isRegistering: false,
  userStatus: null,
  setUserData: (update) => {
    const state = get();
    const nextUserData = typeof update === 'function' ? update(state.userData) : update;
    const newUserData = { ...state.userData, ...nextUserData };
    
    set({ userData: newUserData });

    // Background write
    FileSystem.writeAsStringAsync(USER_DATA_PATH, JSON.stringify(newUserData)).catch(err => {
      console.error('Failed to save user data to file system', err);
    });
  },
  setTokens: async (token, refreshToken) => {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    set({ token, refreshToken });
  },
  setIsLoggedIn: (isLoggedIn) => set({ isLoggedIn }),
  setIsRegistering: (isRegistering) => set({ isRegistering }),
  setUserStatus: (userStatus) => set({ userStatus }),
  resetUser: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    await SecureStore.deleteItemAsync('saved_user_data'); // Cleanup legacy key
    try {
      await FileSystem.deleteAsync(USER_DATA_PATH, { idempotent: true });
    } catch (e) {
      console.error('Failed to delete user data file', e);
    }
    set({ userData: initialUserData, token: null, refreshToken: null, isLoggedIn: false, isRegistering: false, userStatus: null });
  },
  initialize: async () => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      
      let parsedUserData = initialUserData;
      try {
        const fileInfo = await FileSystem.getInfoAsync(USER_DATA_PATH);
        if (fileInfo.exists) {
          const savedData = await FileSystem.readAsStringAsync(USER_DATA_PATH);
          parsedUserData = JSON.parse(savedData);
        }
      } catch (e) {
        console.error('Failed to load user data from storage', e);
      }

      if (token && refreshToken) {
        set({ token, refreshToken, isLoggedIn: true, userData: parsedUserData, userStatus: parsedUserData.status || 'active' });
      } else {
        set({ userData: parsedUserData, isLoggedIn: false });
      }
    } catch (error) {
      console.error('Failed to initialize user store:', error);
    }
  },
}));
