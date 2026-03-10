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
  DecoratedUser,
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
  BadRequestError,
} from '@shared/core/error.response.js';
import { OauthProvider } from '@atomecom/shared';
import { USER_ROLE } from '@atomecom/shared';
import { USER_STATUS } from '@atomecom/shared';
import type { PaginatedResult } from '@atomecom/shared';
import logger from '@shared/utils/logger.js';

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
      data.map((user) => this._decorateWithSessionData(user as DecoratedUser)),
    );

    return this._toPaginatedResponse(data, totalElements, dto);
  }

  public async findById(
    id: string,
    status?: USER_STATUS,
  ): Promise<SafeUserResponseDTO> {
    const user = await this._userRepo.findById(id, status);
    if (!user) throw new NotFoundError(ErrorUserCodes.USER_NOT_FOUND);

    const decoratedUser = user as DecoratedUser;
    await this._decorateWithSessionData(decoratedUser);

    return this._toSafeResponse(decoratedUser);
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
    return user ? this._toSafeResponse(user) : null;
  }

  /**
   * Same as findByEmail but for phone
   */
  public async findByPhone(
    phone: string,
    status?: USER_STATUS,
  ): Promise<SafeUserResponseDTO | null> {
    const user = await this._userRepo.findByPhone(phone, status);
    return user ? this._toSafeResponse(user) : null;
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
    if (!updatedUser) throw new NotFoundError(ErrorUserCodes.USER_NOT_FOUND);
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
    if (!updatedUser) throw new NotFoundError(ErrorUserCodes.USER_NOT_FOUND);
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
    if (!user) throw new NotFoundError(ErrorUserCodes.USER_NOT_FOUND);
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
    if (!user) throw new NotFoundError(ErrorUserCodes.USER_NOT_FOUND);

    if (user) {
      this._eventBus.emit(DomainEvents.USER_STATUS_CHANGED, {
        userId: user.id,
        email: user.email,
        name: user.name,
        status: user.status,
      });
      logger.info(
        `[${MODULE}][${LAYER}][UpdateStatus] Event ${DomainEvents.USER_STATUS_CHANGED} emitted for user: ${user.email} (New Status: ${user.status})`,
      );
    }

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
    if (!user) throw new NotFoundError(ErrorUserCodes.USER_NOT_FOUND);

    if (user) {
      this._eventBus.emit(DomainEvents.USER_DELETED, {
        userId: user.id,
        email: existingUser.email, // Send to original email
        name: user.name,
        status: USER_STATUS.DELETED,
      });
    }

    return this._toSafeResponse(user);
  }

  /**
   * Hard-deletes a user permanently.
   * Use ONLY as a compensating rollback when user creation fails during registration.
   */
  public async hardDelete(id: string): Promise<boolean> {
    const existingUser = await this.findById(id); // Ensure exists, also populates email
    const result = await this._userRepo.hardDelete(id);
    if (result) {
      logger.info(
        `[${MODULE}][${LAYER}][HardDelete] User ${existingUser.email} hard-deleted (compensated).`,
      );
    }
    return result;
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

    if (dto.addresses && dto.addresses.length > 3) {
      throw new BadRequestError('Maximum of 3 addresses allowed per user.');
    }

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
    if (!user) throw new NotFoundError(ErrorUserCodes.USER_NOT_FOUND);

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

    const updateData: Partial<UserEntity> = {
      ...dto,
      version: existingUser.version ?? 0,
    };

    if (passwordHash) {
      updateData.password = passwordHash;
    }

    const user = await this._userRepo.update(id, updateData);
    if (!user) throw new NotFoundError(ErrorUserCodes.USER_NOT_FOUND);

    // Emit event if status changed
    if (dto.status && dto.status !== existingUser.status) {
      this._eventBus.emit(DomainEvents.USER_STATUS_CHANGED, {
        userId: user.id,
        email: user.email,
        name: user.name,
        status: user.status,
      });
      logger.info(
        `[${MODULE}][${LAYER}][UpdateStatus] Event ${DomainEvents.USER_STATUS_CHANGED} emitted for user: ${user.email} (New Status: ${user.status})`,
      );
    }

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

          if (!user.id)
            throw new InternalServerError(
              ErrorUserCodes.USER_DATA_MAPPING_ERROR,
            );

          user = await this._userRepo.update(user.id, {
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
      if (!user.id)
        throw new InternalServerError(ErrorUserCodes.USER_DATA_MAPPING_ERROR);

      user = await this._userRepo.update(user.id, {
        avatar: avatar || user.avatar || PLACE_HOLDER_AVATAR,
        name: name || user.name,
        version: user.version ?? 0,
        // If this login have email, set to verified
        isVerified: user.isVerified || !!email,
      });
    }

    if (!user) {
      throw new InternalServerError(ErrorUserCodes.USER_DATA_MAPPING_ERROR);
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
  private _toSafeResponse(user: UserEntity): SafeUserResponseDTO {
    const userObj =
      'toObject' in user && typeof user.toObject === 'function'
        ? (user.toObject() as DecoratedUser)
        : ({ ...user } as DecoratedUser);

    const { password, ...safeData } = userObj;

    const result = safeData as SafeUserResponseDTO;

    // Mask dummy email
    if (result.isEmailMissing) {
      result.email = null;
    }

    return result;
  }

  /**
   * Decorates a user entity with transient data from Redis (last login, online status)
   */
  private async _decorateWithSessionData(user: DecoratedUser): Promise<void> {
    const [sessionData, isOnline] = await Promise.all([
      this._cache.get<string | object>(`user:last_login:${user.id}`),
      this._cache.has(`heartbeat:user:${user.id}`),
    ]);

    user.isOnline = isOnline;

    if (!sessionData) {
      user.lastLoginAt = user.createdAt || new Date();
      return;
    }

    try {
      let session: any = sessionData;
      if (
        typeof sessionData === 'string' &&
        sessionData.trim().startsWith('{')
      ) {
        session = JSON.parse(sessionData);
      }

      user.lastLoginAt = new Date(session.timestamp || session);
      user.lastIp = session.ip || 'unknown';
      user.lastDevice = session.userAgent || 'unknown';
    } catch (e) {
      user.lastLoginAt = new Date(sessionData as string);
      user.lastIp = 'unknown';
      user.lastDevice = 'unknown';
    }
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
        totalPages: Math.ceil(total / limit),
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
