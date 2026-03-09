import type { BrandEntity } from '../../domain/entities/brand.entity.js';
import type { IBrandRepository } from '../../domain/repositories/brand.repo.js';
import { BrandModel } from '../models/mongoose-brand.model.js';
import { ConflictError } from '@shared/core/error.response.js';
import mongoose from 'mongoose';

export class MongooseBrandRepo implements IBrandRepository {
  public async findAll(params: {
    keyword?: string;
    offset: number;
    limit: number;
    sortField?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ data: BrandEntity[]; totalElements: number }> {
    const { keyword, offset, limit, sortField, sortOrder } = params;

    const query: any = { deletedAt: null };
    if (keyword) {
      query.name = { $regex: keyword, $options: 'i' };
    }

    const sortOptions: any = {};
    if (sortField) {
      sortOptions[sortField] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sortOptions.createdAt = -1;
    }

    const [data, totalElements] = await Promise.all([
      BrandModel.find(query).sort(sortOptions).skip(offset).limit(limit).lean(),
      BrandModel.countDocuments(query),
    ]);

    return {
      data: data.map((d) => this._toDomain(d)!),
      totalElements,
    };
  }

  public async findById(id: string): Promise<BrandEntity | null> {
    const brand = await BrandModel.findOne({
      _id: new mongoose.Types.ObjectId(id),
      deletedAt: null,
    } as any).lean();
    return this._toDomain(brand);
  }

  public async findBySlug(slug: string): Promise<BrandEntity | null> {
    const brand = await BrandModel.findOne({ slug, deletedAt: null }).lean();
    return this._toDomain(brand);
  }

  public async create(brand: BrandEntity): Promise<BrandEntity> {
    const { id: _, ...brandData } = brand;
    const saved = await BrandModel.create(brandData as any);
    return this._toDomain(saved.toObject())!;
  }

  public async update(
    id: string,
    data: Partial<BrandEntity>,
  ): Promise<BrandEntity | null> {
    const { version, ...updateData } = data;
    const query: any = { _id: new mongoose.Types.ObjectId(id) };

    if (version !== undefined) {
      query.version = version;
    }

    const updated = await BrandModel.findOneAndUpdate(
      query,
      {
        $set: updateData,
        $inc: { version: 1 },
      },
      { new: true },
    ).lean();

    if (!updated && version !== undefined) {
      throw new ConflictError(
        'Data modified concurrently, Brand not found or deleted',
      );
    }

    return this._toDomain(updated);
  }

  public async delete(id: string, deletedAt?: Date): Promise<boolean> {
    const result = await BrandModel.updateOne(
      { _id: new mongoose.Types.ObjectId(id), deletedAt: null } as any,
      { $set: { deletedAt: deletedAt || new Date() } },
    );
    return result.modifiedCount > 0;
  }

  private _toDomain(doc: any): BrandEntity | null {
    if (!doc) return null;
    const data = doc.toObject ? doc.toObject() : doc;
    const { _id, id: _idValue, __v, ...rest } = data;
    return {
      ...rest,
      id: (_id || _idValue).toString(),
    } as BrandEntity;
  }
}
