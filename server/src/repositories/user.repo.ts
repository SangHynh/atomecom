import type { User } from '../core/domain/user.domain.js';
import type { USER_STATUS } from '../core/enum/userStatus.enum.js';

export interface UserRepository {
  findAll(): Promise<User[]>;
  findUserById(id: string): Promise<User | null>;
  findUserByEmail(email: string): Promise<User | null>;
  create(user: User): Promise<User>;
  update(id: string, data: Partial<User>): Promise<User | null>;
  updateStatus(id: string, status: USER_STATUS): Promise<void>;
  updateVerified(id: string, verified: boolean): Promise<void>;
}
