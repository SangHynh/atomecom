import type { SafeUserResponseDTO } from '@modules/users/use-cases/user.dtos.js';

export interface AuthResponseDTO {
  user: SafeUserResponseDTO;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface RegisterInputDTO {
  name: string;
  email: string;
  password: string;
  phone?: string;
  honey_pot?: string;
}

export interface LoginInputDTO {
  email: string;
  password: string;
  honey_pot?: string;
}
