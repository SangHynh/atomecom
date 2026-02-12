import type { USER_STATUS } from '@enum/userStatus.enum.js';
import type { User } from './user.entity.js';

export interface IUserRepository {
  findAll(params: {
    status?: USER_STATUS | undefined;
    keyword?: string;
    role?: string;
    offset: number;
    limit: number;
  }): Promise<{
    data: User[];
    totalElements: number;
  }>;
  findById(id: string, status?: USER_STATUS): Promise<User | null>;
  findByEmail(email: string, status?: USER_STATUS): Promise<User | null>;
  findByPhone(phone: string, status?: USER_STATUS): Promise<User | null>;
  create(user: Omit<User, 'id'>): Promise<User>;
  update(id: string, data: Partial<Omit<User, 'id'>>): Promise<User | null>;
}
