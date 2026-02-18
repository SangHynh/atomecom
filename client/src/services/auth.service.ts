import { api } from "@/lib/axios";
import {
  AuthResponse,
  LoginInput,
  RefreshTokenInput,
  SignUpInput,
} from '@atomecom/shared';

export const AuthService = {
  login: async (data: LoginInput) => {
    const response = await api.post<AuthResponse>("auth/login", data);
    return response.data;
  },

  register: async (data: SignUpInput) => {
    const response = await api.post<AuthResponse>("auth/register", data);
    return response.data;
  },

  logout: async (data: { refreshToken: string }) => {
    await api.post("auth/logout", data);
  },

  refreshToken: async (data: RefreshTokenInput) => {
    const response = await api.post<AuthResponse>("auth/refresh", data);
    return response.data;
  },

  verifyEmail: async (token: string) => {
    const response = await api.get<AuthResponse>(`auth/verify-email?token=${token}`);
    return response.data;
  },
};
