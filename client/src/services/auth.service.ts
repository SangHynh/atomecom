import { api } from '@/lib/axios';
import {
  AuthResponse,
  LoginInput,
  RefreshTokenInput,
  SignUpInput,
} from '@atomecom/shared';

export const AuthService = {
  login: async (data: LoginInput) => {
    const response = await api.post<AuthResponse>('auth/login', data);
    return response.data;
  },

  register: async (data: SignUpInput) => {
    const response = await api.post<AuthResponse>('auth/register', data);
    return response.data;
  },

  logout: async () => {
    await api.post('auth/logout');
  },

  refreshToken: async () => {
    const response = await api.post<AuthResponse>('auth/refresh');
    return response.data;
  },

  verifyEmail: async (token: string) => {
    const response = await api.get<AuthResponse>(
      `auth/verify-email?token=${token}`,
    );
    return response.data;
  },

  socialLogin: async (provider: string, token: string) => {
    const response = await api.post<AuthResponse>(`auth/social/${provider}`, {
      token,
    });
    return response.data;
  },
};
