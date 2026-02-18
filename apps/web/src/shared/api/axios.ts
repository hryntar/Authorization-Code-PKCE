import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

const API_URL = import.meta.env.VITE_PUBLIC_API_URL || 'http://localhost:3001';

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
  config: InternalAxiosRequestConfig;
}> = [];

function processQueue(error: AxiosError | null) {
  failedQueue.forEach(({ resolve, reject, config }) => {
    if (error) {
      reject(error);
    } else {
      resolve(apiClient(config));
    }
  });
  failedQueue = [];
}

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
  response => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;

    // Only attempt refresh for 401s that aren't the refresh endpoint itself
    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      originalRequest.url !== '/auth/refresh'
    ) {
      if (isRefreshing) {
        // Queue the request while refresh is in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await apiClient.post('/auth/refresh');
        processQueue(null);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as AxiosError);
        console.warn('[API] Session expired, refresh failed');
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (status !== 401) {
      console.error(`[API] Error ${status}: ${originalRequest?.url}`, error.response?.data);
    }

    return Promise.reject(error);
  }
);
