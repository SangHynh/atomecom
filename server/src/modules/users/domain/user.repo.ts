import type { USER_STATUS } from '@enum/userStatus.enum.js';
import type { User } from './user.domain.js';

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
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByPhone(phone: string): Promise<User | null>;
  create(user: Omit<User, 'id'>): Promise<User>;
  update(id: string, data: Partial<Omit<User, 'id'>>): Promise<User | null>;
}
