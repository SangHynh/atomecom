import type {
  IUserSocialLink,
  UserAddress,
  UserEntity,
} from '@modules/users/domain/user.entity.js';
import { OauthProvider } from '@atomecom/shared';
import { USER_ROLE } from '@atomecom/shared';
import { USER_STATUS } from '@atomecom/shared';

export interface FindAllQueryUserDTO {
  page?: number;
  limit?: number;
  status?: USER_STATUS;
  keyword?: string;
  role?: USER_ROLE;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  isDeleted?: boolean;
}

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: USER_ROLE;
  addresses?: UserAddress[];
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  role?: USER_ROLE;
  status?: USER_STATUS;
  isVerified?: boolean;
  addresses?: UserAddress[];
}

export interface UpsertOAuthUserDTO {
  name: string;
  email?: string;
  avatar?: string;
  providerInfo: {
    provider: OauthProvider;
    providerId: string;
  };
}

export interface SafeUserResponseDTO {
  id: string;
  name: string;
  email: string | null;
  phone?: string;
  role: USER_ROLE;
  status: USER_STATUS;
  isVerified: boolean;
  addresses: UserAddress[];
  providers: IUserSocialLink[]; // Oauth Providers
  version: number;
  createdAt: Date;
  updatedAt: Date;
  isEmailMissing: boolean;
  avatar?: string;
  lastLoginAt?: string | Date;
  isOnline?: boolean;
  lastIp?: string;
  lastDevice?: string;
}

export interface SafeOAuthResponseDTO extends Omit<
  SafeUserResponseDTO,
  'email'
> {
  // Override email
  email: string | null;
  provider: OauthProvider;
  isExternal: boolean;
  isEmailMissing: boolean;
  avatar?: string;
}

/**
 * Extension of UserEntity with transient fields from Redis/Session
 */
export type DecoratedUser = UserEntity & {
  lastLoginAt?: Date;
  lastIp?: string;
  lastDevice?: string;
  isOnline?: boolean;
};
