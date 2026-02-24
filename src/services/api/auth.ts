import apiClient from './client';
import { getDeviceInfo } from '../../utils/device';
import * as SecureStore from 'expo-secure-store';

export interface AuthUserResponse {
  id: string;
  email?: string;
  status: 'onboarding' | 'active' | 'banned';
  full_name?: string;
  date_of_birth?: string;
  gender?: string;
  height_cm?: number;
  looking_for?: string[];
  interested_in?: string[];
  interests?: string[];
  languages?: string[];
  location_city?: string;
  location_country?: string;
  latitude?: number;
  longitude?: number;
  bio?: string;
  photos?: { id: string; url: string; is_main: boolean }[];
  created_at: string;
}

export interface AuthResponse {
  token: string;
  refresh_token: string;
  user: AuthUserResponse;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface PhotoRequest {
  url: string;
  is_main: boolean;
}

export interface RegisterData {
  id?: string;
  email: string;
  password: string;
  full_name: string;
  date_of_birth: string; // YYYY-MM-DD
  gender?: string;
  height_cm?: number;
  bio?: string;
  interested_in?: string;
  looking_for?: string;
  location_city?: string;
  location_country?: string;
  latitude?: number;
  longitude?: number;
  interests?: string[];
  languages?: string[];
  photos?: PhotoRequest[];
}

export interface GoogleLoginData {
  id?: string;
  email: string;
  google_id: string;
  full_name: string;
  profile_picture?: string;
  date_of_birth?: string;
  gender?: string;
  height_cm?: number;
  bio?: string;
  interested_in?: string;
  looking_for?: string;
  location_city?: string;
  location_country?: string;
  latitude?: number;
  longitude?: number;
  interests?: string[];
  languages?: string[];
  photos?: PhotoRequest[];
}

export const authService = {
  /**
   * Check if email exists
   */
  checkEmail: async (email: string): Promise<{ exists: boolean }> => {
    const response = await apiClient.post('/auth/check-email', { email });
    return response.data;
  },

  /**
   * Login via Email
   */
  login: async (data: LoginData): Promise<AuthResponse> => {
    const device = await getDeviceInfo();
    const response = await apiClient.post('/auth/login', {
      ...data, device: {
        device_id: device.deviceId,
        device_name: device.deviceName,
        device_model: device.deviceModel,
        os_version: device.osVersion,
        app_version: device.appVersion,
      }
    });
    return response.data;
  },

  /**
   * Register via Email
   */
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const device = await getDeviceInfo();
    const response = await apiClient.post('/auth/register', {
      ...data, device: {
        device_id: device.deviceId,
        device_name: device.deviceName,
        device_model: device.deviceModel,
        os_version: device.osVersion,
        app_version: device.appVersion,
      }
    });
    return response.data;
  },

  /**
   * Google OAuth Login
   */
  googleLogin: async (data: GoogleLoginData): Promise<AuthResponse> => {
    const device = await getDeviceInfo();
    const response = await apiClient.post('/auth/google', {
      ...data, device: {
        device_id: device.deviceId,
        device_name: device.deviceName,
        device_model: device.deviceModel,
        os_version: device.osVersion,
        app_version: device.appVersion,
      }
    });
    return response.data;
  },

  /**
   * Logout
   */
  logout: async (): Promise<void> => {
    const deviceId = await SecureStore.getItemAsync('device_id_tracking');
    await apiClient.post('/auth/logout', { device_id: deviceId });
  },
};
