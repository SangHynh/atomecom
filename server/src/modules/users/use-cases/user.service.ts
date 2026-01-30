import type { User } from '@modules/users/domain/user.domain.js';
import type { UserRepository } from '@modules/users/domain/user.repo.js';
import type { CreateUserDTO } from '@modules/users/interfaces/user.dtos.js';
import { ConflictError } from '@shared/core/error.response.js';
import { USER_ROLE } from '@shared/enum/userRole.enum.js';
import { USER_STATUS } from '@shared/enum/userStatus.enum.js';

export class UserService {
  constructor(private readonly userRepo: UserRepository) {}

  public async create(dto: CreateUserDTO): Promise<User> {
    await this._validateUserUniqueness(dto.email);
    const persistenceData = this._toPersistence(dto);
    const newUser = await this.userRepo.create(persistenceData);
    return newUser;
  }

  /* ============================================================================== */
  private async _validateUserUniqueness(
    email: string,
    phone?: string,
  ): Promise<void> {
    const validationErrors: any[] = [];

    // St1: Check Email
    const emailExists = await this.userRepo.findByEmail(email);
    if (emailExists) {
      validationErrors.push({
        field: 'email',
        message: 'EMAIL_ALREADY_EXISTS',
      });
    }

    // St2: Check phone
    if (phone) {
      const phoneExists = await this.userRepo.findByPhone(phone);
      if (phoneExists) {
        validationErrors.push({
          field: 'phone',
          message: 'PHONE_ALREADY_EXISTS',
        });
      }
    }

    if (validationErrors.length > 0) {
      const error = new ConflictError('USER_ALREADY_EXISTS', validationErrors);
      error.layer = 'USE-CASES';
      error.module = 'USERS';
      throw error;
    }
  }

  private _toPersistence(dto: CreateUserDTO): Omit<User, 'id'> {
    return {
      ...dto,
      status: USER_STATUS.ACTIVE,
      verified: false,
      role: USER_ROLE.USER,
      addresses: dto.addresses || [],
    };
  }
}
