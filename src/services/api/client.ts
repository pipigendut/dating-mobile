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
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response Interceptor for Error Normalization and Refresh Token
apiClient.interceptors.response.use(
  (response) => {
    if (response.data && response.data.data !== undefined) {
      return {
        ...response,
        data: response.data.data
      };
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Ignore refresh failures themselves (prevent infinite loop)
    if (error.response?.status === 401 && originalRequest.url === '/auth/refresh') {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = 'Bearer ' + token;
          return apiClient(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = await SecureStore.getItemAsync('auth_refresh_token');
      const deviceId = await SecureStore.getItemAsync('device_id_tracking');

      if (!refreshToken || !deviceId) {
        SecureStore.deleteItemAsync('auth_token');
        SecureStore.deleteItemAsync('auth_refresh_token');
        isRefreshing = false;
        return Promise.reject(error);
      }

      return new Promise((resolve, reject) => {
        axios.post(`${apiClient.defaults.baseURL}/auth/refresh`, {
          refresh_token: refreshToken,
          device_id: deviceId
        })
          .then(async ({ data }) => {
            const newAccessToken = data.data.token;
            const newRefreshToken = data.data.refresh_token;

            await SecureStore.setItemAsync('auth_token', newAccessToken);
            await SecureStore.setItemAsync('auth_refresh_token', newRefreshToken);

            apiClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

            processQueue(null, newAccessToken);
            resolve(apiClient(originalRequest));
          })
          .catch(err => {
            processQueue(err, null);
            SecureStore.deleteItemAsync('auth_token');
            SecureStore.deleteItemAsync('auth_refresh_token');
            reject(err);
          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    }
    return Promise.reject(error);
  }
);

export default apiClient;
