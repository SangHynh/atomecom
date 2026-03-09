import type { ProductEntity } from '../../domain/entities/product.entity.js';
import type { IProductRepository } from '../../domain/repositories/product.repo.js';
import { ProductModel } from '../models/mongoose-product.model.js';
import { PRODUCT_STATUS } from '@shared/enum/productStatus.enum.js';
import { ConflictError } from '@shared/core/error.response.js';
import mongoose from 'mongoose';

export class MongooseProductRepo implements IProductRepository {
  constructor() {
    console.log('[DEBUG-REPO] MongooseProductRepo constructor called');
  }
  public async findAll(params: {
    categoryId?: string;
    brandId?: string;
    status?: PRODUCT_STATUS;
    keyword?: string;
    minRating?: number;
    sortField?: string;
    sortOrder?: 'asc' | 'desc';
    offset: number;
    limit: number;
  }): Promise<{ data: ProductEntity[]; totalElements: number }> {
    const {
      categoryId,
      brandId,
      status,
      keyword,
      minRating,
      sortField,
      sortOrder,
      offset,
      limit,
    } = params;

    const query: any = { deletedAt: null };
    if (categoryId) query.categoryId = new mongoose.Types.ObjectId(categoryId);
    if (brandId) query.brandId = new mongoose.Types.ObjectId(brandId);
    if (status) query.status = status;
    if (minRating) query.avgRating = { $gte: minRating };
    if (keyword) {
      query.$text = { $search: keyword };
    }

    const sortOptions: any = {};
    if (sortField) {
      sortOptions[sortField] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sortOptions.createdAt = -1;
    }

    const [data, totalElements] = await Promise.all([
      ProductModel.find(query)
        .sort(sortOptions)
        .skip(offset)
        .limit(limit)
        .lean(),
      ProductModel.countDocuments(query),
    ]);

    return {
      data: data.map((d) => this._toDomain(d)!),
      totalElements,
    };
  }

  public async findById(id: string): Promise<ProductEntity | null> {
    const product = await ProductModel.findOne({
      _id: new mongoose.Types.ObjectId(id),
    } as any).lean();
    return this._toDomain(product);
  }

  public async findBySlug(slug: string): Promise<ProductEntity | null> {
    const product = await ProductModel.findOne({
      slug,
      deletedAt: null,
    }).lean();
    return this._toDomain(product);
  }

  public async create(product: ProductEntity): Promise<ProductEntity> {
    const saved = await ProductModel.create({
      name: product.name,
      slug: product.slug,
      description: product.description,
      shortDescription: product.shortDescription,
      thumbnail: product.thumbnail,
      categoryId: new mongoose.Types.ObjectId(product.categoryId),
      brandId: new mongoose.Types.ObjectId(product.brandId),
      images: product.images,
      specs: product.specs || [],
      seo: product.seo || { title: '', description: '', keywords: [] },
      status: product.status,
      avgRating: product.avgRating || 0,
      totalReviews: product.totalReviews || 0,
      version: product.version || 1,
      deletedAt: null,
    } as any);
    return this._toDomain(saved.toObject())!;
  }

  public async update(
    id: string,
    data: Partial<ProductEntity>,
  ): Promise<ProductEntity | null> {
    const { version, ...updateData } = data;
    if (version === undefined) {
      throw new Error('Version is required for optimistic locking');
    }

    const updated = await ProductModel.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id), version } as any,
      {
        $set: updateData,
        $inc: { version: 1 },
      },
      { new: true },
    ).lean();

    if (!updated) {
      throw new ConflictError(
        'Data modified concurrently, product not found or deleted',
      );
    }

    return this._toDomain(updated);
  }

  public async delete(id: string, deletedAt?: Date): Promise<boolean> {
    const result = await ProductModel.updateOne(
      { _id: new mongoose.Types.ObjectId(id), deletedAt: null } as any,
      { $set: { deletedAt: deletedAt || new Date() } },
    );
    return result.modifiedCount > 0;
  }

  /** Hard-deletes a product permanently. Use ONLY for compensating transaction rollback. */
  public async hardDelete(id: string): Promise<boolean> {
    const result = await ProductModel.deleteOne({
      _id: new mongoose.Types.ObjectId(id),
    } as any);
    return result.deletedCount > 0;
  }

  public async countByCategoryId(categoryId: string): Promise<number> {
    return ProductModel.countDocuments({
      categoryId: new mongoose.Types.ObjectId(categoryId),
      deletedAt: null,
    } as any);
  }

  public async countByBrandId(brandId: string): Promise<number> {
    return ProductModel.countDocuments({
      brandId: new mongoose.Types.ObjectId(brandId),
      deletedAt: null,
    } as any);
  }

  private _toDomain(doc: any): ProductEntity | null {
    if (!doc) return null;
    const data = doc.toObject ? doc.toObject() : doc;
    const { _id, id: _idValue, __v, ...rest } = data;
    return {
      ...rest,
      id: (_id || _idValue).toString(),
    } as ProductEntity;
  }
}
