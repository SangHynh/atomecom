import type { User } from "@modules/users/domain/user.domain.js";
import type { IUserRepository } from "@modules/users/domain/user.repo.js";
import type { CreateUserDTO, FindAllUserDTO } from "@modules/users/interfaces/user.dtos.js";
import { ConflictError } from "@shared/core/error.response.js";
import { USER_ROLE } from "@shared/enum/userRole.enum.js";
import { USER_STATUS } from "@shared/enum/userStatus.enum.js";
import type { PaginatedResult } from "@shared/interfaces/IPagination.js";

export class UserService {
  constructor(private readonly userRepo: IUserRepository) {}

  public async findAll(dto: FindAllUserDTO): Promise<PaginatedResult<User>> {
    const query = this._toRepositoryQuery(dto);
    const { data, totalElements } = await this.userRepo.findAll(query);
    return this._toPaginatedResponse(data, totalElements, dto);
  }

  public async create(dto: CreateUserDTO): Promise<User> {
    await this._validateUniqueness(dto.email, dto.phone);
    const entityData = this._toCreateEntity(dto);
    return await this.userRepo.create(entityData);
  }

  /* ============================================================================== */
  /* INTERNAL MAPPERS                                                               */
  /* ============================================================================== */

  /**
   * DTO -> Repository Query (Translate request from Client to Repository Query)
   */
  private _toRepositoryQuery(dto: FindAllUserDTO) {
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
  private _toPaginatedResponse(data: User[], total: number, dto: FindAllUserDTO): PaginatedResult<User> {
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
      verified: false,
      role: dto.role || USER_ROLE.USER,
      addresses: dto.addresses || [],
    };
  }

  /* ============================================================================== */
  /* INTERNAL VALIDATORS                                                            */
  /* ============================================================================== */

  private async _validateUniqueness(email: string, phone?: string): Promise<void> {
    const errors: any[] = [];
    
    const [emailExists, phoneExists] = await Promise.all([
      this.userRepo.findByEmail(email),
      phone ? this.userRepo.findByPhone(phone) : null
    ]);

    if (emailExists) errors.push({ field: 'email', message: 'EMAIL_ALREADY_EXISTS' });
    if (phoneExists) errors.push({ field: 'phone', message: 'PHONE_ALREADY_EXISTS' });

    if (errors.length > 0) {
      throw new ConflictError('USER_ALREADY_EXISTS', errors);
    }
  }
}