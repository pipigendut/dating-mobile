import apiClient from './client';

export interface AuthResponse {
  token: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  date_of_birth: string; // YYYY-MM-DD
}

export interface GoogleLoginData {
  email: string;
  google_id: string;
  full_name?: string;
  profile_picture?: string;
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
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  },

  /**
   * Register via Email
   */
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  /**
   * Google OAuth Login
   */
  googleLogin: async (data: GoogleLoginData): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/google', data);
    return response.data;
  },
};
