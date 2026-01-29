import type { USER_STATUS } from '@enum/userStatus.enum.js';
import type { User } from './user.domain.js';

export interface UserRepository {
  findAll(params: {
    status?: USER_STATUS;
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
  create(user: User): Promise<User>;
  update(id: string, data: Partial<User>): Promise<User | null>;
}
