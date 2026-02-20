import type { IHashService } from '@modules/users/domain/IHash.service.js';
import { DomainEvents } from '@shared/constants/event.constants.js';
import type { EventBus } from '@shared/infra/event-bus.js';
import type {
  IUserSocialLink,
  UserAddress,
  UserEntity,
} from '@modules/users/domain/user.entity.js';
import type { IUserRepository } from '@modules/users/domain/user.repo.js';
import type {
  CreateUserDTO,
  FindAllQueryUserDTO,
  SafeUserResponseDTO,
  UpdateUserDTO,
} from '@modules/users/use-cases/user.dtos.js';
import { ErrorUserCodes } from '@atomecom/shared';
import {
  ConflictError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
} from '@shared/core/error.response.js';
import { OauthProvider } from '@atomecom/shared';
import { USER_ROLE } from '@atomecom/shared';
import { USER_STATUS } from '@atomecom/shared';
import type { PaginatedResult } from '@shared/interfaces/pagination.model.js';

const LAYER = 'Service';
const MODULE = 'User';
const PLACE_HOLDER_AVATAR = `https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y`;

import type { ICacheRepo } from '@shared/interfaces/ICache.repo.js';

interface UserServiceDependencies {
  userRepo: IUserRepository;
  hashService: IHashService;
  eventBus: EventBus;
  cache: ICacheRepo;
}

export class UserService {
  private readonly _userRepo: IUserRepository;
  private readonly _hashService: IHashService;
  private readonly _eventBus: EventBus;
  private readonly _cache: ICacheRepo;

  constructor({
    userRepo,
    hashService,
    eventBus,
    cache,
  }: UserServiceDependencies) {
    this._userRepo = userRepo;
    this._hashService = hashService;
    this._eventBus = eventBus;
    this._cache = cache;
  }

  public async getStats() {
    const [total, active, banned, deactive, verified] = await Promise.all([
      this._userRepo.count({}), // Model middleware handles skipping DELETED
      this._cache.countByPattern('heartbeat:user:*'),
      this._userRepo.count({ status: USER_STATUS.BANNED }),
      this._userRepo.count({ status: USER_STATUS.DEACTIVE }),
      this._userRepo.count({ isVerified: true }),
    ]);

    return {
      total,
      active,
      banned,
      deactive,
      verified,
    };
  }
  public async findAll(
    dto: FindAllQueryUserDTO,
  ): Promise<PaginatedResult<SafeUserResponseDTO>> {
    const query = this._toFindAllQuery(dto);
    const { data, totalElements } = await this._userRepo.findAll(query);

    // Decorate with Last Login & Online Status from Redis
    await Promise.all(
      data.map(async (user) => {
        const [sessionData, isOnline] = await Promise.all([
          this._cache.get<any>(`user:last_login:${user.id}`),
          this._cache.has(`heartbeat:user:${user.id}`),
        ]);

        if (sessionData) {
          try {
            let session = sessionData;
            if (typeof sessionData === 'string') {
              session = JSON.parse(sessionData);
            }

            (user as any).lastLoginAt = new Date(session.timestamp);
            (user as any).lastIp = session.ip;
            (user as any).lastDevice = session.userAgent;
          } catch (e) {
            console.warn(`[UserService] JSON Parse Error for ${user.id}:`, e);
            // Fallback for old simple string format
            (user as any).lastLoginAt = new Date(sessionData);
          }
        } else {
          (user as any).lastLoginAt = user.createdAt;
        }

        (user as any).isOnline = isOnline;
      }),
    );

    return this._toPaginatedResponse(data, totalElements, dto);
  }

  public async findById(
    id: string,
    status?: USER_STATUS,
  ): Promise<SafeUserResponseDTO> {
    const user = await this._userRepo.findById(id, status);
    if (!user) throw new NotFoundError(ErrorUserCodes.USER_NOT_FOUND);

    // Decorate with Last Login & Online Status from Redis
    const [sessionJson, isOnline] = await Promise.all([
      this._cache.get<string>(`user:last_login:${id}`),
      this._cache.has(`heartbeat:user:${id}`),
    ]);

    if (sessionJson) {
      try {
        const session = JSON.parse(sessionJson);
        (user as any).lastLoginAt = new Date(session.timestamp);
        (user as any).lastIp = session.ip;
        (user as any).lastDevice = session.userAgent;
      } catch (e) {
        // Fallback for old simple string format
        (user as any).lastLoginAt = new Date(sessionJson);
      }
    } else {
      (user as any).lastLoginAt = user.createdAt;
    }

    (user as any).isOnline = isOnline;

    return this._toSafeResponse(user);
  }

  /**
   * Finds a user by their email address.
   * * @returns The user data or null if no record matches. Returning null instead
   * of throwing an error provides flexibility for various business flows, such
   * as email uniqueness validation or conditional authentication logic.
   */
  public async findByEmail(
    email: string,
    status?: USER_STATUS,
  ): Promise<SafeUserResponseDTO | null> {
    const user = await this._userRepo.findByEmail(email, status);
    if (!user) return null;
    return this._toSafeResponse(user);
  }

  /**
   * Same as findByEmail but for phone
   */
  public async findByPhone(
    phone: string,
    status?: USER_STATUS,
  ): Promise<SafeUserResponseDTO | null> {
    const user = await this._userRepo.findByPhone(phone, status);
    if (!user) return null;
    return this._toSafeResponse(user);
  }

  public async verifyCredentials(
    email: string,
    passwordPlain: string,
  ): Promise<SafeUserResponseDTO | null> {
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

  public async create(dto: CreateUserDTO): Promise<SafeUserResponseDTO> {
    // TODO: Transaction
    await Promise.all([
      this._validateEmailUniqueness(dto.email),
      dto.phone ? this._validatePhoneUniqueness(dto.phone) : Promise.resolve(),
    ]);
    const passwordHash = await this._hashService.hash(dto.password);
    const entityData = this._toCreateEntity({ ...dto, password: passwordHash });
    const user = await this._userRepo.create(entityData);

    // Emit event for Email module or other listeners
    this._eventBus.emit(DomainEvents.USER_CREATED, {
      userId: user.id,
      email: user.email,
    });

    return this._toSafeResponse(user);
  }

  public async changePassword(
    id: string,
    newPasswordPlain: string,
  ): Promise<SafeUserResponseDTO | null> {
    const user = await this.findById(id, USER_STATUS.ACTIVE);
    const passwordHash = await this._hashService.hash(newPasswordPlain);
    const updatedUser = await this._userRepo.update(id, {
      password: passwordHash,
      version: user.version ?? 0,
    });
    return this._toSafeResponse(updatedUser);
  }

  public async changeEmail(
    id: string,
    newEmail: string,
  ): Promise<SafeUserResponseDTO | null> {
    const [existingUser] = await Promise.all([
      this.findById(id, USER_STATUS.ACTIVE),
      this._validateEmailUniqueness(newEmail, id),
    ]);

    const updatedUser = await this._userRepo.update(id, {
      email: newEmail,
      isEmailMissing: false,
      isVerified: false,
      version: existingUser.version ?? 0,
    });
    return this._toSafeResponse(updatedUser);
  }

  public async changePhone(
    id: string,
    newPhone: string,
  ): Promise<SafeUserResponseDTO | null> {
    const [existingUser] = await Promise.all([
      this.findById(id, USER_STATUS.ACTIVE),
      this._validatePhoneUniqueness(newPhone, id),
    ]);

    const user = await this._userRepo.update(id, {
      phone: newPhone,
      version: existingUser.version ?? 0,
    });
    return this._toSafeResponse(user);
  }

  public async updateStatusAccount(
    id: string,
    status: USER_STATUS,
  ): Promise<SafeUserResponseDTO | null> {
    const existingUser = await this.findById(id);
    const user = await this._userRepo.update(id, {
      status,
      version: existingUser.version ?? 0,
    });
    return this._toSafeResponse(user);
  }

  public async delete(id: string): Promise<SafeUserResponseDTO | null> {
    const existingUser = await this.findById(id);

    if (!existingUser.email) {
      throw new InternalServerError(ErrorUserCodes.USER_DATA_MAPPING_ERROR);
    }
    const timestamp = new Date().getTime();

    const updateData: Partial<UserEntity> = {
      deletedAt: new Date(),
      status: USER_STATUS.DELETED,
      email: `deleted_${timestamp}_${existingUser.email}`,
      version: existingUser.version ?? 0,
      providers: [], // Clear social links to free up unique index
    };

    if (existingUser.phone) {
      updateData.phone = `deleted_${timestamp}_${existingUser.phone}`;
    }

    const user = await this._userRepo.update(id, updateData);
    return this._toSafeResponse(user);
  }

  public async updateProfile(
    id: string,
    dto: {
      name?: string;
      avatar?: string;
      addresses?: UserAddress[];
    },
  ): Promise<SafeUserResponseDTO> {
    const existingUser = await this.findById(id, USER_STATUS.ACTIVE);

    const user = await this._userRepo.update(id, {
      ...dto,
      version: existingUser.version ?? 0,
    });

    if (!user) throw new NotFoundError(ErrorUserCodes.USER_NOT_FOUND);

    return this._toSafeResponse(user);
  }

  public async verifyAccount(
    id: string,
    isVerified: boolean,
  ): Promise<SafeUserResponseDTO | null> {
    const existingUser = await this.findById(id, USER_STATUS.ACTIVE);

    const user = await this._userRepo.update(id, {
      isVerified,
      version: existingUser.version ?? 0,
    });

    return this._toSafeResponse(user);
  }

  public async updateUser(
    id: string,
    dto: UpdateUserDTO,
  ): Promise<SafeUserResponseDTO> {
    const existingUser = await this.findById(id);

    // If password is provided, hash it
    let passwordHash: string | undefined;
    if (dto.password) {
      passwordHash = await this._hashService.hash(dto.password);
    }

    // Check uniqueness if email/phone changed
    await Promise.all([
      dto.email && dto.email !== existingUser.email
        ? this._validateEmailUniqueness(dto.email, id)
        : Promise.resolve(),
      dto.phone && dto.phone !== existingUser.phone
        ? this._validatePhoneUniqueness(dto.phone, id)
        : Promise.resolve(),
    ]);

    const updateData: any = {
      ...dto,
      version: existingUser.version ?? 0,
    };

    if (passwordHash) {
      updateData.password = passwordHash;
    }

    const user = await this._userRepo.update(id, updateData);
    if (!user) throw new NotFoundError(ErrorUserCodes.USER_NOT_FOUND);

    return this._toSafeResponse(user);
  }

  // --- OAuth methods ---

  public async findByOAuthId(
    provider: OauthProvider,
    providerId: string,
    status?: USER_STATUS,
  ): Promise<SafeUserResponseDTO | null> {
    const user = await this._userRepo.findByOAuthId(
      provider,
      providerId,
      status,
    );
    if (!user) return null;
    return this._toSafeResponse(user);
  }

  public async upsertOAuthUser(dto: {
    providerInfo: {
      provider: OauthProvider;
      providerId: string;
    };
    email?: string;
    name: string;
    avatar?: string;
  }): Promise<SafeUserResponseDTO> {
    const { providerInfo, email, name, avatar } = dto;

    // 1. Check if the user already exists by specific provider and providerId
    let user = await this._userRepo.findByOAuthId(
      providerInfo.provider,
      providerInfo.providerId,
    );

    // 2. If not found by provider, try to find by email to perform account linking
    if (!user && email) {
      user = await this._userRepo.findByEmail(email);

      if (user) {
        // Check if this provider is already linked to the account to prevent duplicates
        const isAlreadyLinked = user.providers.some(
          (p) => p.provider === providerInfo.provider,
        );

        if (!isAlreadyLinked) {
          // Link new provider to existing account instead of overwriting
          user.providers.push(providerInfo);

          user = await this._userRepo.update(user.id!, {
            providers: user.providers,
            avatar: avatar || user.avatar || PLACE_HOLDER_AVATAR,
            version: user.version ?? 0,
            isVerified: true,
          });
        }
      }
    }

    // 3. If still not found (new user), create a new account with the first provider
    if (!user) {
      const newUserData = this._toCreateOAuthEntity({
        providerInfo,
        email,
        name,
        avatar,
      });
      user = await this._userRepo.create(newUserData);
    } else {
      // 4. If user exists, update basic profile information if necessary
      user = await this._userRepo.update(user.id!, {
        avatar: avatar || user.avatar || PLACE_HOLDER_AVATAR,
        name: name || user.name,
        version: user.version ?? 0,
        // If this login have email, set to verified
        isVerified: user.isVerified || !!email,
      });
    }

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
      ...(dto.role && { role: dto.role }),
      ...(dto.status && { status: dto.status }),
      ...(dto.keyword && { keyword: dto.keyword }),
      ...(dto.sortField && { sortField: dto.sortField }),
      ...(dto.sortOrder && { sortOrder: dto.sortOrder }),
    };
  }

  /**
   * Domain Entity -> Safe Response (Prepare data for Client)
   */
  /**
   * Domain Entity -> Safe Response
   * Converts a UserEntity to a SafeUserResponseDTO for client-side consumption.
   */
  private _toSafeResponse(user: UserEntity | null): SafeUserResponseDTO {
    const userObj = (user as any).toObject ? (user as any).toObject() : user;
    const { password, __v, ...safeData } = userObj;

    /**
     * PREVENT DUMMY EMAIL EXPOSURE:
     * For OAuth users without a provided email, the system generates a placeholder
     * email (e.g., facebook_123@atomecom.dummy) to satisfy DB UNIQUE constraints.
     * * When returning data to the client, if 'isEmailMissing' is true, we mask this
     * dummy email as 'null'. This signals the Frontend to prompt the user for
     * a valid email address.
     */
    if (safeData.isEmailMissing) {
      safeData.email = null;
    }

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
      addresses: (dto.addresses as UserAddress[]) || ([] as UserAddress[]),
      isEmailMissing: false, // traditional auth email is required first
      providers: [] as IUserSocialLink[],
    };
  }

  /**
   * DTO -> Domain Entity (Prepare data for Domain/Database)
   */

  private _toCreateOAuthEntity(dto: {
    providerInfo: {
      provider: OauthProvider;
      providerId: string;
    };
    email?: string | null | undefined;
    name: string;
    avatar?: string | undefined;
  }): Omit<UserEntity, 'id'> {
    const { providerInfo, email, name, avatar } = dto;
    const isMissing = !email;

    // Create a dummy email if none is provided by the social provider
    const finalEmail =
      email ||
      `${providerInfo.provider.toLowerCase()}_${providerInfo.providerId}@atomecom.dummy`;

    return {
      name: name,
      email: finalEmail,
      avatar: avatar ?? PLACE_HOLDER_AVATAR,
      providers: [providerInfo],
      role: USER_ROLE.USER,
      status: USER_STATUS.ACTIVE,
      isVerified: !isMissing,
      isEmailMissing: isMissing,
      addresses: [] as UserAddress[],
      isExternal: true,
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
