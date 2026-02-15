import type { USER_STATUS } from '@enum/userStatus.enum.js';
import type { UserEntity } from './user.entity.js';

export interface IUserRepository {
  findAll(params: {
    status?: USER_STATUS | undefined;
    keyword?: string;
    role?: string;
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
  update(id: string, data: Partial<Omit<UserEntity, 'id'>>): Promise<UserEntity | null>;
}
