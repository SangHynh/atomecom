import type { SkuEntity } from '../../domain/entities/sku.entity.js';
import type { ISkuRepository } from '../../domain/repositories/sku.repo.js';
import { SkuModel } from '../models/mongoose-sku.model.js';
import { ConflictError } from '@shared/core/error.response.js';
import mongoose from 'mongoose';

export class MongooseSkuRepo implements ISkuRepository {
  public async findAllByProductId(productId: string): Promise<SkuEntity[]> {
    const skus = await SkuModel.find({
      productId: new mongoose.Types.ObjectId(productId),
      deletedAt: null,
    } as any).lean();
    return skus.map((s) => this._toDomain(s)!);
  }

  public async findById(id: string): Promise<SkuEntity | null> {
    const sku = await SkuModel.findOne({
      _id: new mongoose.Types.ObjectId(id),
      deletedAt: null,
    } as any).lean();
    return this._toDomain(sku);
  }

  public async findBySkuCode(skuCode: string): Promise<SkuEntity | null> {
    const sku = await SkuModel.findOne({ skuCode, deletedAt: null }).lean();
    return this._toDomain(sku);
  }

  public async create(sku: SkuEntity): Promise<SkuEntity> {
    const saved = await SkuModel.create({
      skuCode: sku.skuCode,
      name: sku.name,
      productId: new mongoose.Types.ObjectId(sku.productId),
      barcode: sku.barcode,
      attributes: sku.attributes,
      price: sku.price,
      priceHistory: sku.priceHistory,
      images: sku.images,
      status: sku.status,
      version: sku.version || 1,
      deletedAt: null,
    } as any);
    return this._toDomain(saved.toObject())!;
  }

  public async update(
    id: string,
    data: Partial<SkuEntity>,
  ): Promise<SkuEntity | null> {
    const { version, ...updateData } = data;
    const query: any = { _id: id };

    if (version !== undefined) {
      query.version = version;
    }

    const updated = await SkuModel.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id), version } as any,
      {
        $set: updateData,
        ...((data as any).$push ? { $push: (data as any).$push } : {}),
        $inc: { version: 1 },
      },
      { new: true },
    ).lean();

    if (!updated && version !== undefined) {
      throw new ConflictError(
        'Data modified concurrently, SKU not found or deleted',
      );
    }

    return this._toDomain(updated);
  }

  public async delete(id: string, deletedAt?: Date): Promise<boolean> {
    const result = await SkuModel.updateOne(
      { _id: new mongoose.Types.ObjectId(id), deletedAt: null } as any,
      { $set: { deletedAt: deletedAt || new Date() } },
    );
    return result.modifiedCount > 0;
  }

  /** Hard-deletes a SKU permanently. Use ONLY for compensating transaction rollback. */
  public async hardDelete(id: string): Promise<boolean> {
    const result = await SkuModel.deleteOne({
      _id: new mongoose.Types.ObjectId(id),
    } as any);
    return result.deletedCount > 0;
  }

  public async deleteByProductId(
    productId: string,
    deletedAt?: Date,
  ): Promise<boolean> {
    const now = deletedAt || new Date();
    const result = await SkuModel.collection.updateMany(
      {
        productId: new mongoose.Types.ObjectId(productId),
        deletedAt: null,
      } as any,
      [
        {
          $set: {
            deletedAt: now,
            skuCode: {
              $concat: [
                '$skuCode',
                '-deleted-',
                { $toString: { $toLong: now.getTime() } },
              ],
            },
          },
        },
      ],
    );
    return result.acknowledged;
  }

  private _toDomain(doc: any): SkuEntity | null {
    if (!doc) return null;
    const data = doc.toObject ? doc.toObject() : doc;
    const { _id, id: _idValue, __v, ...rest } = data;
    return {
      ...rest,
      id: (_id || _idValue).toString(),
    } as SkuEntity;
  }
}
