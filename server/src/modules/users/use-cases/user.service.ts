import type { IHashService } from '@modules/users/domain/IHash.service.js';
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
} from '@modules/users/use-cases/user.dtos.js';
import { ErrorUserCodes } from '@shared/core/error.enum.js';
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from '@shared/core/error.response.js';
import type { OauthProvider } from '@shared/enum/oauthProvider.enum.js';
import { USER_ROLE } from '@shared/enum/userRole.enum.js';
import { USER_STATUS } from '@shared/enum/userStatus.enum.js';
import type { PaginatedResult } from '@shared/interfaces/pagination.model.js';

const LAYER = 'Service';
const MODULE = 'User';
const PLACE_HOLDER_AVATAR = `https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y`;

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
  ): Promise<UserEntity | null> {
    const user = await this._userRepo.findByPhone(phone, status);
    if (!user) return null;
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
  ): Promise<UserEntity | null> {
    const existingUser = await this.findById(id, USER_STATUS.ACTIVE);
    await this._validateEmailUniqueness(newEmail, id);
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
  ): Promise<UserEntity | null> {
    const existingUser = await this.findById(id, USER_STATUS.ACTIVE);
    await this._validatePhoneUniqueness(newPhone, id);
    const user = await this._userRepo.update(id, {
      phone: newPhone,
      version: existingUser.version ?? 0,
    });
    return this._toSafeResponse(user);
  }

  public async updateStatusAccount(
    id: string,
    status: USER_STATUS,
  ): Promise<UserEntity | null> {
    const existingUser = await this.findById(id);
    const user = await this._userRepo.update(id, {
      status,
      version: existingUser.version ?? 0,
    });
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
          });
        }
      }
    }

    // 3. If still not found (new user), create a new account with the first provider
    if (!user) {
      const newUserData: Omit<UserEntity, 'id'> = {
        name,
        ...(email && { email }),
        avatar: avatar || PLACE_HOLDER_AVATAR,
        providers: [providerInfo],
        status: USER_STATUS.ACTIVE,
        isVerified: true,
        role: USER_ROLE.USER,
        addresses: [],
        isEmailMissing: !email,
        isExternal: true,
      };
      user = await this._userRepo.create(newUserData);
    } else {
      // 4. If user exists, update basic profile information if necessary
      user = await this._userRepo.update(user.id!, {
        avatar: avatar || user.avatar || PLACE_HOLDER_AVATAR,
        name: name || user.name,
        version: user.version ?? 0,
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
      ...(dto.status && { status: dto.status }),
      ...(dto.keyword && { keyword: dto.keyword }),
      ...(dto.role && { role: dto.role }),
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
    email?: string | null;
    name: string;
    avatar?: string;
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
