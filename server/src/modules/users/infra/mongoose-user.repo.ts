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

    // St1: Build dynamic filter query based on input params
    const query: any = {};
    if (status) query.status = status;
    if (role) query.role = role;
    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { email: { $regex: keyword, $options: 'i' } },
      ];
    }

    // St2: Execute data fetching and counting in parallel for performance
    const [data, totalElements] = await Promise.all([
      UserModel.find(query)
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .lean(),
      UserModel.countDocuments(query),
    ]);

    return {
      data: data as unknown as User[],
      totalElements,
    };
  }

  public async findByEmail(email: string): Promise<User | null> {
    const result = await UserModel.findOne({ email }).select('+password').lean();
    return result as unknown as User;
  }

  public async findByPhone(phone: string): Promise<User | null> {
    const result = await UserModel.findOne({ phone }).select('+password').lean();
    return result as unknown as User;
  }

  public async findById(id: string): Promise<User | null> {
    throw new Error('Method not implemented.');
  }

  public async update(id: string, data: any): Promise<User | null> {
    const updatedUser = await UserModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    ).lean();
    return updatedUser as unknown as User;
  }

  public async create(user: any): Promise<User> {
    const newUser = new UserModel(user);
    const savedUser = await newUser.save();
    return savedUser.toJSON() as unknown as User;
  }
}
