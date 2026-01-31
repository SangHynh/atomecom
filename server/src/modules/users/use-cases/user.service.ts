import type { User } from '@modules/users/domain/user.domain.js';
import type { IUserRepository } from '@modules/users/domain/user.repo.js';
import type {
  CreateUserDTO,
  FindAllUserDTO,
  UpdateUserDTO,
} from '@modules/users/interfaces/user.dtos.js';
import { ConflictError, NotFoundError } from '@shared/core/error.response.js';
import { USER_ROLE } from '@shared/enum/userRole.enum.js';
import { USER_STATUS } from '@shared/enum/userStatus.enum.js';
import type { PaginatedResult } from '@shared/interfaces/IPagination.js';

export class UserService {
  constructor(private readonly userRepo: IUserRepository) {}

  public async findAll(dto: FindAllUserDTO): Promise<PaginatedResult<User>> {
    const query = this._toFindAllQuery(dto);
    const { data, totalElements } = await this.userRepo.findAll(query);
    return this._toPaginatedResponse(data, totalElements, dto);
  }

  public async findById(id: string): Promise<User | null> {
    return await this.userRepo.findById(id);
  }

  public async findByEmail(email: string): Promise<User | null> {
    return await this.userRepo.findByEmail(email);
  }

  public async findByPhone(phone: string): Promise<User | null> {
    return await this.userRepo.findByPhone(phone);
  }

  public async create(dto: CreateUserDTO): Promise<User> {
    // TODO: Transaction
    await Promise.all([
      this._validateEmailUniqueness(dto.email),
      dto.phone ? this._validatePhoneUniqueness(dto.phone) : Promise.resolve(),
    ]);
    const entityData = this._toCreateEntity(dto);
    return await this.userRepo.create(entityData);
  }

  public async changePassword(
    id: string,
    passwordHash: string,
  ): Promise<User | null> {
    return await this.userRepo.update(id, { password: passwordHash });
  }

  public async changeEmail(id: string, newEmail: string): Promise<User | null> {
    await Promise.all([
      this._getExistingUser(id),
      this._validateEmailUniqueness(newEmail, id),
    ]);
    return await this.userRepo.update(id, { email: newEmail });
  }

  public async changePhone(id: string, newPhone: string): Promise<User | null> {
    await Promise.all([
      this._getExistingUser(id),
      this._validatePhoneUniqueness(newPhone, id),
    ])
    return await this.userRepo.update(id, { phone: newPhone });
  }

  public async updateStatusAccount(id: string, status: USER_STATUS): Promise<User | null> {
    await this._getExistingUser(id);
    return await this.userRepo.update(id, { status });
  }

  public async verifyAccount(id: string, isVerified: boolean): Promise<User | null> {
    await this._getExistingUser(id);
    return await this.userRepo.update(id, { isVerified });
  }

  /**
   * DTO -> Repository Query (Translate request from Client to Repository Query)
   */
  private _toFindAllQuery(dto: FindAllUserDTO) {
    const page = Number(dto.page) || 1;
    const limit = Number(dto.limit) || 10;

    return {
      offset: (page - 1) * limit,
      limit,
      ...(dto.status && { status: dto.status }),
      ...(dto.keyword && { keyword: dto.keyword }),
      ...(dto.role && { role: dto.role }),
    };
  }

  /**
   * Domain Result -> Paginated Response (Encapsulate data and pagination info)
   */
  private _toPaginatedResponse(
    data: User[],
    total: number,
    dto: FindAllUserDTO,
  ): PaginatedResult<User> {
    const limit = Number(dto.limit) || 10;
    return {
      data,
      pagination: {
        totalElements: total,
        totalPage: Math.ceil(total / limit),
        currentPage: Number(dto.page) || 1,
        elementsPerPage: limit,
      },
    };
  }

  /**
   * DTO -> Domain Entity (Prepare data for Domain/Database)
   */
  private _toCreateEntity(dto: CreateUserDTO): Omit<User, 'id'> {
    return {
      ...dto,
      status: USER_STATUS.ACTIVE,
      isVerified: false,
      role: dto.role || USER_ROLE.USER,
      addresses: dto.addresses || [],
    };
  }

  /**
   * Validate user existence
   */
  private async _getExistingUser(id: string): Promise<User> {
    const user = await this.userRepo.findById(id);
    if (!user) {
      throw new NotFoundError('USER_NOT_FOUND');
    }
    return user;
  }

  /**
   * Validate Email uniqueness
   */
  private async _validateEmailUniqueness(
    email: string,
    excludeId?: string,
  ): Promise<void> {
    const user = await this.userRepo.findByEmail(email);
    if (user && user.id !== excludeId) {
      throw new ConflictError('EMAIL_ALREADY_EXISTS', [
        { field: 'email', message: 'EMAIL_ALREADY_EXISTS' },
      ]);
    }
  }

  /**
   * Validate Phone uniqueness
   */
  private async _validatePhoneUniqueness(
    phone: string,
    excludeId?: string,
  ): Promise<void> {
    const user = await this.userRepo.findByPhone(phone);
    if (user && user.id !== excludeId) {
      throw new ConflictError('PHONE_ALREADY_EXISTS', [
        { field: 'phone', message: 'PHONE_ALREADY_EXISTS' },
      ]);
    }
  }
}
