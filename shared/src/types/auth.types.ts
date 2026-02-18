import type { User } from './user.types.js';
import type { SuccessResponse } from './api.types.js';

export interface LoginInput {
  email: string;
  password: string;
}

export interface SignUpInput {
  name: string;
  email: string;
  password: string;
}

export interface RefreshTokenInput {
  refreshToken: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthData {
  user: User;
  tokens: AuthTokens;
}

export type AuthResponse = SuccessResponse<AuthData>;
