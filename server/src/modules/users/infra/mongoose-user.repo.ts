import type { User } from '@modules/users/domain/user.entity.js';
import type { IUserRepository } from '@modules/users/domain/user.repo.js';
import { UserModel } from '@modules/users/infra/mongoose-user.model.js';
import {
  ConflictError,
  InternalServerError,
} from '@shared/core/error.response.js';

const LAYER = 'Repository';
const MODULE = 'User';

export class MongooseUserRepo implements IUserRepository {
  public async findAll(params: {
    status?: string | undefined;
    keyword?: string | undefined;
    role?: string | undefined;
    offset: number;
    limit: number;
  }): Promise<{ data: User[]; totalElements: number }> {
    const { status, keyword, role, offset = 0, limit = 10 } = params;

    const query: any = {};
    if (status) query.status = status;
    if (role) query.role = role;
    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { email: { $regex: keyword, $options: 'i' } },
      ];
    }

    const [data, totalElements] = await Promise.all([
      UserModel.find(query)
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .lean(),
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
  ): Promise<User | null> {
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
  ): Promise<User | null> {
    const result = await UserModel.findOne({
      phone,
      ...(status && { status }),
    })
      .select('+password')
      .lean();

    return this._toDomain(result);
  }

  public async findById(id: string, status?: string): Promise<User | null> {
    const result = await UserModel.findOne({
      _id: id,
      ...(status && { status }),
    }).lean();

    return this._toDomain(result);
  }

  public async update(
    id: string,
    data: Partial<Omit<User, 'id'>>,
  ): Promise<User | null> {
    const { version, ...updateData } = data;
    if (version === undefined) {
      const error = new InternalServerError('DATA_MAPPING_ERROR', [
        {
          field: 'version',
          message: 'VERSION_IS_REQUIRED',
        },
      ]);
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
      { new: true },
    ).lean();
    // Another user has modified the data at the same time
    if (!updatedUser) {
      throw new ConflictError('DATA_MODIFIED_CONCURRENTLY');
    }
    return this._toDomain(updatedUser);
  }

  public async create(user: Omit<User, 'id'>): Promise<User> {
    const newUser = new UserModel(user);
    const savedUser = await newUser.save();
    return this._toDomain(savedUser.toJSON())!;
  }

  // Mapper to Domain Entity
  private _toDomain(doc: any): User | null {
    if (!doc) return null;
    const data = doc.toObject ? doc.toObject() : doc;
    const targetId = data._id || data.id;
    if (!targetId) {
      const error = new InternalServerError('DATA_MAPPING_ERROR');
      error.layer = LAYER;
      error.module = MODULE;
      throw error;
    }
    const { _id, id, __v, ...rest } = data;
    return {
      ...rest,
      id: targetId.toString(),
    } as User;
  }
}
