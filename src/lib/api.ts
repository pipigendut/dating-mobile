import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { authEvents } from '../utils/authEvents';

export const API_VERSION = 'v1';
export const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.100.55:8080';

const createInstance = (version: string) => {
  const instance = axios.create({
    baseURL: `${BASE_URL}/api/${version}`,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
    paramsSerializer: {
      indexes: null // to send genders=1&genders=2 instead of genders[0]=1&genders[1]=2
    }
  });

  // Request Interceptor for Injection Token
  instance.interceptors.request.use(
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
  let failedQueue: { resolve: (token: string) => void; reject: (err: any) => void }[] = [];

  const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token!);
      }
    });
    failedQueue = [];
  };

  const forceLogout = async () => {
    await SecureStore.deleteItemAsync('auth_token');
    await SecureStore.deleteItemAsync('auth_refresh_token');
    authEvents.emit('logout');
  };

  // Response Interceptor for Error Normalization and Refresh Token
  instance.interceptors.response.use(
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

      if (error.response?.status === 401 && originalRequest._isRefreshRequest) {
        isRefreshing = false;
        processQueue(error, null);
        await forceLogout();
        return Promise.reject(error);
      }

      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(token => {
            originalRequest.headers.Authorization = 'Bearer ' + token;
            return instance(originalRequest);
          }).catch(err => {
            return Promise.reject(err);
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = await SecureStore.getItemAsync('auth_refresh_token');
        const deviceId = await SecureStore.getItemAsync('device_id_tracking');

        if (!refreshToken || !deviceId) {
          isRefreshing = false;
          processQueue(error, null);
          await forceLogout();
          return Promise.reject(error);
        }

        return new Promise((resolve, reject) => {
          axios.post(
            `${instance.defaults.baseURL}/auth/refresh`,
            { refresh_token: refreshToken, device_id: deviceId },
            { headers: { 'Content-Type': 'application/json' } }
          )
            .then(async ({ data }) => {
              const newAccessToken = data?.data?.token || data?.token;
              const newRefreshToken = data?.data?.refresh_token || data?.refresh_token;

              if (!newAccessToken || !newRefreshToken) {
                throw new Error('Refresh response missing token fields');
              }

              await SecureStore.setItemAsync('auth_token', newAccessToken);
              await SecureStore.setItemAsync('auth_refresh_token', newRefreshToken);

              instance.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

              processQueue(null, newAccessToken);
              resolve(instance(originalRequest));
            })
            .catch(async (err) => {
              processQueue(err, null);
              await forceLogout();
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

  return instance;
};

export const apiV1 = createInstance(API_VERSION);
export default apiV1;
