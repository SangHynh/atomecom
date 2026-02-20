import type { UserEntity } from '@modules/users/domain/user.entity.js';
import type { IUserRepository } from '@modules/users/domain/user.repo.js';
import { UserModel } from '@modules/users/infra/mongoose-user.model.js';
import { ErrorUserCodes, ErrorInfraCodes, USER_STATUS } from '@atomecom/shared';
import {
  ConflictError,
  InternalServerError,
} from '@shared/core/error.response.js';
import { escapeRegExp } from '@shared/utils/regex.util.js';

const LAYER = 'Repository';
const MODULE = 'User';

export class MongooseUserRepo implements IUserRepository {
  public async findAll(params: {
    status?: string | undefined;
    keyword?: string | undefined;
    role?: string | undefined;
    sortField?: string | undefined;
    sortOrder?: 'asc' | 'desc' | undefined;
    offset: number;
    limit: number;
  }): Promise<{ data: UserEntity[]; totalElements: number }> {
    const {
      status,
      keyword,
      role,
      sortField,
      sortOrder,
      offset = 0,
      limit = 10,
    } = params;

    const query: any = {};

    if (status) query.status = status;
    if (role) query.role = role;
    if (keyword) {
      const safeKeyword = escapeRegExp(keyword);
      query.$or = [
        { name: { $regex: safeKeyword, $options: 'i' } },
        { email: { $regex: safeKeyword, $options: 'i' } },
      ];
    }

    const sortOptions: any = {};
    if (sortField) {
      sortOptions[sortField] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sortOptions.createdAt = -1;
    }

    const [data, totalElements] = await Promise.all([
      UserModel.find(query).sort(sortOptions).skip(offset).limit(limit).lean(),
      UserModel.countDocuments(query),
    ]);

    return {
      data: data.map((item) => this._toDomain(item)!),
      totalElements,
    };
  }

  public async findByEmail(
    email: string,
    status?: string,
  ): Promise<UserEntity | null> {
    const result = await UserModel.findOne({
      email,
      ...(status && { status }),
    })
      .select('+password')
      .lean();

    return this._toDomain(result);
  }

  public async findByPhone(
    phone: string,
    status?: string,
  ): Promise<UserEntity | null> {
    const result = await UserModel.findOne({
      phone,
      ...(status && { status }),
    })
      .select('+password')
      .lean();

    return this._toDomain(result);
  }

  public async findById(
    id: string,
    status?: string,
  ): Promise<UserEntity | null> {
    const result = await UserModel.findOne({
      _id: id,
      ...(status && { status }),
    }).lean();

    return this._toDomain(result);
  }

  public async findByOAuthId(
    provider: string,
    providerId: string,
    status?: string,
  ): Promise<UserEntity | null> {
    const result = await UserModel.findOne({
      provider,
      providerId,
      ...(status && { status }),
    }).lean();

    return this._toDomain(result);
  }

  public async update(
    id: string,
    data: Partial<Omit<UserEntity, 'id'>>,
  ): Promise<UserEntity | null> {
    const { version, ...updateData } = data;
    if (version === undefined) {
      const error = new InternalServerError(
        ErrorUserCodes.USER_DATA_MAPPING_ERROR,
        [
          {
            field: 'version',
            message: ErrorUserCodes.USER_VERSION_IS_REQUIRED,
          },
        ],
      );
      error.layer = LAYER;
      error.module = MODULE;
      throw error;
    }
    const query = { _id: id, version: version };
    const updatedUser = await UserModel.findOneAndUpdate(
      query,
      {
        $set: updateData,
        $inc: { version: 1 },
      },
      { returnDocument: 'after' },
    ).lean();
    // Another user has modified the data at the same time
    if (!updatedUser) {
      throw new ConflictError(ErrorInfraCodes.DATA_MODIFIED_CONCURRENTLY);
    }
    return this._toDomain(updatedUser);
  }

  public async create(user: Omit<UserEntity, 'id'>): Promise<UserEntity> {
    const newUser = new UserModel(user);
    const savedUser = await newUser.save();
    return this._toDomain(savedUser.toJSON())!;
  }

  public async count(filter: any): Promise<number> {
    return await UserModel.countDocuments(filter);
  }

  // Mapper to Domain Entity
  private _toDomain(doc: any): UserEntity | null {
    if (!doc) return null;
    const data = doc.toObject ? doc.toObject() : doc;
    const targetId = data._id || data.id;
    if (!targetId) {
      const error = new InternalServerError(
        ErrorUserCodes.USER_DATA_MAPPING_ERROR,
      );
      error.layer = LAYER;
      error.module = MODULE;
      throw error;
    }
    const { _id: _unusedId, id: _idValue, __v: _version, ...rest } = data;
    return {
      ...rest,
      id: targetId.toString(),
    } as UserEntity;
  }
}
