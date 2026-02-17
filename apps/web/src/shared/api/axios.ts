import axios from 'axios';

const API_URL = import.meta.env.VITE_PUBLIC_API_URL || 'http://localhost:3001';

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  config => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  error => {
    console.error('[API] Request error:', error.message);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    const status = error.response?.status;
    const url = error.config?.url;

    if (status === 401) {
      console.warn(`[API] Unauthorized: ${url}`);
    } else {
      console.error(`[API] Error ${status}: ${url}`, error.response?.data);
    }

    return Promise.reject(error);
  }
);
