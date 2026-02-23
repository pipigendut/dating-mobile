import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || (Platform.OS === 'android' ? 'http://localhost:8080/api/v1' : 'http://localhost:8080/api/v1'),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});


// Request Interceptor for Injection Token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      if (__DEV__) {
        console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url} - Token Injected`);
      }
    } else {
      if (__DEV__) {
        console.warn(`[API Request] ${config.method?.toUpperCase()} ${config.url} - No Token Found`);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor for Error Normalization
apiClient.interceptors.response.use(
  (response) => {
    // If the backend wraps the actual data in a "data" property (standard BaseResponse)
    // we unwrap it here so that services get the clean object.
    if (response.data && response.data.data !== undefined) {
      return {
        ...response,
        data: response.data.data
      };
    }
    return response;
  },
  (error) => {
    // Global error handling (e.g., 401 logout)
    if (error.response?.status === 401) {
      SecureStore.deleteItemAsync('auth_token');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
