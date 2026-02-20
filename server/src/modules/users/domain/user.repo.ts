import { USER_STATUS } from '@atomecom/shared';
import type { UserEntity } from './user.entity.js';

export interface IUserRepository {
  findAll(params: {
    status?: USER_STATUS | undefined;
    keyword?: string;
    role?: string;
    sortField?: string;
    sortOrder?: 'asc' | 'desc';
    offset: number;
    limit: number;
  }): Promise<{
    data: UserEntity[];
    totalElements: number;
  }>;

  findById(id: string, status?: USER_STATUS): Promise<UserEntity | null>;
  findByEmail(email: string, status?: USER_STATUS): Promise<UserEntity | null>;
  findByPhone(phone: string, status?: USER_STATUS): Promise<UserEntity | null>;
  create(user: Omit<UserEntity, 'id'>): Promise<UserEntity>;
  update(
    id: string,
    data: Partial<Omit<UserEntity, 'id'>>,
  ): Promise<UserEntity | null>;
  findByOAuthId(
    provider: string,
    providerId: string,
    status?: USER_STATUS,
  ): Promise<UserEntity | null>;
  count(filter: any): Promise<number>;
}
