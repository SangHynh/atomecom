import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useStore } from '@/store/useStore';

// Define the API base URL from environment variable or default to localhost
const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3636/v1/api';
const API_URL = BASE_URL.replace(/\/$/, '');

// Create a singleton Axios instance
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
  withCredentials: true,
});

let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export const getAccessToken = () => accessToken;

const isTokenExpired = (token: string, leewaySeconds: number = 30) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000;
    return Date.now() + leewaySeconds * 1000 > exp;
  } catch (e) {
    return true;
  }
};

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const refreshAccessToken = async () => {
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    });
  }

  isRefreshing = true;
  try {
    const response = await axios.post(
      `${API_URL}/auth/refresh-token`,
      {},
      { withCredentials: true },
    );
    const { accessToken: newAccessToken } = response.data.data.tokens;
    setAccessToken(newAccessToken);
    processQueue(null, newAccessToken);
    return newAccessToken;
  } catch (error) {
    processQueue(error, null);
    setAccessToken(null);

    // Only logout if the refresh token is explicitly invalid (401)
    // Avoid logging out on network errors or server 500s
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      useStore.getState().logout();
    }
    throw error;
  } finally {
    isRefreshing = false;
  }
};

// Request Interceptor: Attach Token & Proactive Refresh
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();

    // Do NOT proactive refresh for auth endpoints
    const isAuthEndpoint =
      config.url?.includes('auth/login') ||
      config.url?.includes('auth/register') ||
      config.url?.includes('auth/refresh-token') ||
      config.url?.includes('auth/logout');

    if (token && !isAuthEndpoint && isTokenExpired(token)) {
      try {
        const newToken = (await refreshAccessToken()) as string;
        if (config.headers) {
          config.headers.Authorization = `Bearer ${newToken}`;
        }
      } catch (e) {
        return Promise.reject(e);
      }
    } else if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response Interceptor: Handle Errors & Refresh Token
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    // Do NOT retry for login/register/refresh endpoints
    const isAuthEndpoint =
      originalRequest.url?.includes('auth/login') ||
      originalRequest.url?.includes('auth/register') ||
      originalRequest.url?.includes('auth/refresh-token') ||
      originalRequest.url?.includes('auth/logout');

    if (
      error.response?.status === 401 &&
      !isAuthEndpoint &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const newAccessToken = await refreshAccessToken();

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        return api(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
