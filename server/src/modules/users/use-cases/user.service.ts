import type { IHashService } from '@modules/users/domain/IHash.service.js';
import type { UserEntity } from '@modules/users/domain/user.entity.js';
import type { IUserRepository } from '@modules/users/domain/user.repo.js';
import type {
  CreateUserDTO,
  FindAllQueryUserDTO,
  SafeUserResponseDTO,
} from '@modules/users/use-cases/user.dtos.js';
import { ErrorUserCodes } from '@shared/core/error.enum.js';
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from '@shared/core/error.response.js';
import { USER_ROLE } from '@shared/enum/userRole.enum.js';
import { USER_STATUS } from '@shared/enum/userStatus.enum.js';
import type { PaginatedResult } from '@shared/interfaces/pagination.model.js';

const LAYER = 'Service';
const MODULE = 'User';

interface UserServiceDependencies {
  userRepo: IUserRepository;
  hashService: IHashService;
}

export class UserService {
  private readonly _userRepo: IUserRepository;
  private readonly _hashService: IHashService;

  constructor({ userRepo, hashService }: UserServiceDependencies) {
    this._userRepo = userRepo;
    this._hashService = hashService;
  }
  public async findAll(
    dto: FindAllQueryUserDTO,
  ): Promise<PaginatedResult<UserEntity>> {
    const query = this._toFindAllQuery(dto);
    const { data, totalElements } = await this._userRepo.findAll(query);
    return this._toPaginatedResponse(data, totalElements, dto);
  }

  public async findById(id: string, status?: USER_STATUS): Promise<UserEntity> {
    const user = await this._userRepo.findById(id, status);
    if (!user) throw new NotFoundError(ErrorUserCodes.USER_NOT_FOUND);
    return this._toSafeResponse(user);
  }

  /**
   * Finds a user by their email address.
   * Returns null instead of throwing an error to support validation flows
   * (e.g., checking email uniqueness during registration or authentication).
   */ public async findByEmail(
    email: string,
    status?: USER_STATUS,
  ): Promise<UserEntity | null> {
    const user = await this._userRepo.findByEmail(email, status);
    return this._toSafeResponse(user);
  }

  /**
   * Same as findByEmail but for phone
   */
  public async findByPhone(
    phone: string,
    status?: USER_STATUS,
  ): Promise<UserEntity | null> {
    const user = await this._userRepo.findByPhone(phone, status);
    return this._toSafeResponse(user);
  }

  public async verifyCredentials(
    email: string,
    passwordPlain: string,
  ): Promise<UserEntity | null> {
    const user = await this._userRepo.findByEmail(email, USER_STATUS.ACTIVE);
    if (!user || !user.password)
      throw new UnauthorizedError(ErrorUserCodes.INVALID_CREDENTIALS);

    const isMatch = await this._hashService.compare(
      passwordPlain,
      user.password,
    );

    if (!isMatch)
      throw new UnauthorizedError(ErrorUserCodes.INVALID_CREDENTIALS);
    return this._toSafeResponse(user);
  }

  public async create(dto: CreateUserDTO): Promise<UserEntity> {
    // TODO: Transaction
    await Promise.all([
      this._validateEmailUniqueness(dto.email),
      dto.phone ? this._validatePhoneUniqueness(dto.phone) : Promise.resolve(),
    ]);
    const passwordHash = await this._hashService.hash(dto.password);
    const entityData = this._toCreateEntity({ ...dto, password: passwordHash });
    const user = await this._userRepo.create(entityData);
    return this._toSafeResponse(user);
  }

  public async changePassword(
    id: string,
    newPasswordPlain: string,
  ): Promise<UserEntity | null> {
    await this.findById(id, USER_STATUS.ACTIVE);
    const passwordHash = await this._hashService.hash(newPasswordPlain);
    const user = await this._userRepo.update(id, { password: passwordHash });
    return this._toSafeResponse(user);
  }

  public async changeEmail(
    id: string,
    newEmail: string,
  ): Promise<UserEntity | null> {
    await Promise.all([
      this.findById(id, USER_STATUS.ACTIVE),
      this._validateEmailUniqueness(newEmail, id),
    ]);
    const user = await this._userRepo.update(id, { email: newEmail });
    return this._toSafeResponse(user);
  }

  public async changePhone(
    id: string,
    newPhone: string,
  ): Promise<UserEntity | null> {
    await Promise.all([
      this.findById(id, USER_STATUS.ACTIVE),
      this._validatePhoneUniqueness(newPhone, id),
    ]);
    const user = await this._userRepo.update(id, { phone: newPhone });
    return this._toSafeResponse(user);
  }

  public async updateStatusAccount(
    id: string,
    status: USER_STATUS,
  ): Promise<UserEntity | null> {
    await this.findById(id, USER_STATUS.ACTIVE);
    const user = await this._userRepo.update(id, { status });
    return this._toSafeResponse(user);
  }

  public async verifyAccount(
    id: string,
    isVerified: boolean,
  ): Promise<UserEntity | null> {
    const existingUser = await this.findById(id, USER_STATUS.ACTIVE);

    const user = await this._userRepo.update(id, {
      isVerified,
      version: existingUser.version ?? 0,
    });
    
    return this._toSafeResponse(user);
  }

  /**
   * DTO -> Repository Query (Translate request from Client to Repository Query)
   */
  private _toFindAllQuery(dto: FindAllQueryUserDTO) {
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
   * Domain Entity -> Safe Response (Prepare data for Client)
   */
  private _toSafeResponse(user: UserEntity): SafeUserResponseDTO {
    const userObj = (user as any).toObject ? (user as any).toObject() : user;
    const { password, __v, ...safeData } = userObj;
    return safeData as SafeUserResponseDTO;
  }

  /**
   * Domain Result -> Paginated Response (Encapsulate data and pagination info)
   */
  private _toPaginatedResponse(
    data: UserEntity[],
    total: number,
    dto: FindAllQueryUserDTO,
  ): PaginatedResult<SafeUserResponseDTO> {
    const limit = Number(dto.limit) || 10;

    const sanitizedData = data.map((user) => this._toSafeResponse(user));

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
  private _toCreateEntity(dto: CreateUserDTO): Omit<UserEntity, 'id'> {
    return {
      ...dto,
      status: USER_STATUS.ACTIVE,
      isVerified: false,
      role: dto.role || USER_ROLE.USER,
      addresses: dto.addresses || [],
    };
  }

  /**
   * Validate Email uniqueness
   */
  private async _validateEmailUniqueness(
    email: string,
    excludeId?: string,
  ): Promise<void> {
    const user = await this._userRepo.findByEmail(email);
    if (user && user.id !== excludeId) {
      throw new ConflictError(ErrorUserCodes.EMAIL_ALREADY_EXISTS, [
        { field: 'email', message: ErrorUserCodes.EMAIL_ALREADY_EXISTS },
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
    const user = await this._userRepo.findByPhone(phone);
    if (user && user.id !== excludeId) {
      throw new ConflictError(ErrorUserCodes.PHONE_ALREADY_EXISTS, [
        { field: 'phone', message: ErrorUserCodes.PHONE_ALREADY_EXISTS },
      ]);
    }
  }
}
