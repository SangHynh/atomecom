import type { User } from '@modules/users/domain/user.domain.js';
import type { UserRepository } from '@modules/users/domain/user.repo.js';
import { UserModel } from '@modules/users/infra/mongoose-user.model.js';

export class MongooseUserRepo implements UserRepository {
  public async findAll(params: {
    status?: string;
    keyword?: string;
    role?: string;
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

  public async findByEmail(email: string): Promise<User | null> {
    const result = await UserModel.findOne({ email })
      .select('+password')
      .lean();
    return this._toDomain(result);
  }

  public async findByPhone(phone: string): Promise<User | null> {
    const result = await UserModel.findOne({ phone })
      .select('+password')
      .lean();
    return this._toDomain(result);
  }

  public async findById(id: string): Promise<User | null> {
    const result = await UserModel.findById(id).lean();
    return this._toDomain(result);
  }

  public async update(
    id: string,
    data: Partial<Omit<User, 'id'>>,
  ): Promise<User | null> {
    const updatedUser = await UserModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true },
    ).lean();

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
    const { _id, ...rest } = doc;
    return {
      ...rest,
      id: _id.toString(),
    } as User;
  }
}