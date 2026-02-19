import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Define the API base URL from environment variable or default to localhost
const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3636/v1/api';
const API_URL = BASE_URL.endsWith('/') ? BASE_URL : `${BASE_URL}/`;

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
};

export const getAccessToken = () => accessToken;

// Request Interceptor: Attach Token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
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

    // Check if error is 401 (Unauthorized) and we haven't retried yet
    // Do NOT retry for login/register endpoints as 401 there means invalid credentials
    const isAuthEndpoint =
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/register');

    if (
      error.response?.status === 401 &&
      !isAuthEndpoint &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        // Call refresh endpoint - Cookie will be sent automatically
        const response = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );

        const { accessToken: newAccessToken } = response.data.data.tokens;

        // Update accessToken in memory
        setAccessToken(newAccessToken);

        // Update Authorization header for the original request
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        // Update default headers for future requests
        api.defaults.headers.common['Authorization'] =
          `Bearer ${newAccessToken}`;

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear tokens and redirect to login
        setAccessToken(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken'); // Just in case, cleanup legacy
          // Optional: Redirect to login page
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors (optional: show toast notifications here)
    return Promise.reject(error);
  },
);
