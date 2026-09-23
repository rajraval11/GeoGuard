import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Attach bearer token if present
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('geoguard_auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for standardized error reporting
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 unauthenticated
    if (error.response?.status === 401) {
      localStorage.removeItem('geoguard_auth_token');
      // If needed, redirect or notify
    }
    return Promise.reject(error);
  }
);
