import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'https://api.example.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor for Injection Token
apiClient.interceptors.request.use(
  (config) => {
    // Logic to get token from storage can go here
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor for Error Normalization
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Global error handling (e.g., 401 logout)
    if (error.response?.status === 401) {
      // Logic to logout
    }
    return Promise.reject(error);
  }
);

export default apiClient;
