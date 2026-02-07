import type { IHashService } from '@modules/users/domain/IHashService.interface.js';
import type { User } from '@modules/users/domain/user.domain.js';
import type { IUserRepository } from '@modules/users/domain/user.repo.js';
import type {
  CreateUserDTO,
  FindAllUserDTO,
  SafeUserResponseDTO,
  UpdateUserDTO,
} from '@modules/users/use-cases/user.dtos.js';
import { ConflictError, NotFoundError, UnauthorizedError } from '@shared/core/error.response.js';
import { USER_ROLE } from '@shared/enum/userRole.enum.js';
import { USER_STATUS } from '@shared/enum/userStatus.enum.js';
import type { PaginatedResult } from '@shared/interfaces/IPagination.js';

const LAYER = 'Service';
const MODULE = 'User';

interface UserServiceDependencies {
  userRepo: IUserRepository;
  hashService: IHashService;
}

export class UserService {
  private readonly userRepo: IUserRepository;
  private readonly hashService: IHashService;

  constructor({ userRepo, hashService }: UserServiceDependencies) {
    this.userRepo = userRepo;
    this.hashService = hashService;
  }
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

  public async verifyCredentials(
    email: string,
    passwordPlain: string,
  ): Promise<User | null> {
    const user = await this.userRepo.findByEmail(email);
    if (!user || !user.password) throw new UnauthorizedError('INVALID_CREDENTIALS');

    const isMatch = await this.hashService.compare(
      passwordPlain,
      user.password,
    );

    if (!isMatch) throw new UnauthorizedError('INVALID_CREDENTIALS');
    return user;
  }

  public async create(dto: CreateUserDTO): Promise<User> {
    // TODO: Transaction
    await Promise.all([
      this._validateEmailUniqueness(dto.email),
      dto.phone ? this._validatePhoneUniqueness(dto.phone) : Promise.resolve(),
    ]);
    const passwordHash = await this.hashService.hash(dto.password);
    const entityData = this._toCreateEntity({ ...dto, password: passwordHash });
    return await this.userRepo.create(entityData);
  }

  public async changePassword(
    id: string,
    newPasswordPlain: string,
  ): Promise<User | null> {
    await this._getExistingUser(id);
    const passwordHash = await this.hashService.hash(newPasswordPlain);
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
    ]);
    return await this.userRepo.update(id, { phone: newPhone });
  }

  public async updateStatusAccount(
    id: string,
    status: USER_STATUS,
  ): Promise<User | null> {
    await this._getExistingUser(id);
    return await this.userRepo.update(id, { status });
  }

  public async verifyAccount(
    id: string,
    isVerified: boolean,
  ): Promise<User | null> {
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
    data: any[],
    total: number,
    dto: FindAllUserDTO,
  ): PaginatedResult<SafeUserResponseDTO> {
    const limit = Number(dto.limit) || 10;

    const sanitizedData = data.map((item) => {
      const { password, __v, ...safeData } = item.toObject ? item.toObject() : item;
      return safeData as SafeUserResponseDTO;
    });
    
    return {
      data: sanitizedData,
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
