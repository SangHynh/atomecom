import type { InventoryEntity } from '../../domain/entities/inventory.entity.js';
import type { IInventoryRepository } from '../../domain/repositories/inventory.repo.js';
import { InventoryModel } from '../models/mongoose-inventory.model.js';
import mongoose from 'mongoose';

export class MongooseInventoryRepo implements IInventoryRepository {
  public async findBySkuId(skuId: string): Promise<InventoryEntity | null> {
    const inventory = await InventoryModel.findOne({
      skuId: new mongoose.Types.ObjectId(skuId),
      deletedAt: null,
    } as any).lean();
    return this._toDomain(inventory);
  }

  public async updateStock(
    skuId: string,
    quantityDelta: number,
    reservedDelta: number,
  ): Promise<InventoryEntity | null> {
    const updated = await InventoryModel.findOneAndUpdate(
      { skuId: new mongoose.Types.ObjectId(skuId), deletedAt: null } as any,
      [
        {
          $set: {
            quantity: { $add: ['$quantity', quantityDelta] },
            reserved: { $add: ['$reserved', reservedDelta] },
          },
        },
        {
          $set: {
            available: { $subtract: ['$quantity', '$reserved'] },
          },
        },
      ],
      { new: true },
    ).lean();

    return this._toDomain(updated);
  }

  public async reserveStock(skuId: string, quantity: number): Promise<boolean> {
    const result = await InventoryModel.updateOne(
      {
        skuId: new mongoose.Types.ObjectId(skuId),
        $expr: {
          $gte: [{ $subtract: ['$quantity', '$reserved'] }, quantity],
        },
      } as any,
      {
        $inc: {
          reserved: quantity,
          available: -quantity,
        },
      },
    );

    return result.modifiedCount > 0;
  }

  public async releaseStock(skuId: string, quantity: number): Promise<boolean> {
    const result = await InventoryModel.updateOne(
      {
        skuId: new mongoose.Types.ObjectId(skuId),
        reserved: { $gte: quantity },
      } as any,
      {
        $inc: {
          reserved: -quantity,
          available: quantity,
        },
      },
    );

    return result.modifiedCount > 0;
  }

  public async confirmStock(skuId: string, quantity: number): Promise<boolean> {
    const result = await InventoryModel.updateOne(
      {
        skuId: new mongoose.Types.ObjectId(skuId),
        reserved: { $gte: quantity },
        quantity: { $gte: quantity },
      } as any,
      {
        $inc: {
          quantity: -quantity,
          reserved: -quantity,
        },
      },
    );

    return result.modifiedCount > 0;
  }

  public async create(inventory: InventoryEntity): Promise<InventoryEntity> {
    const newInventory = new InventoryModel({
      ...inventory,
      skuId: new mongoose.Types.ObjectId(inventory.skuId),
      available: (inventory.quantity || 0) - (inventory.reserved || 0),
      deletedAt: null,
    } as any);
    const saved = await newInventory.save();
    return this._toDomain(saved.toObject())!;
  }

  public async delete(skuId: string, deletedAt?: Date): Promise<boolean> {
    const result = await InventoryModel.updateOne(
      { skuId: new mongoose.Types.ObjectId(skuId), deletedAt: null } as any,
      { $set: { deletedAt: deletedAt || new Date() } },
    );
    return result.modifiedCount > 0;
  }

  private _toDomain(doc: any): InventoryEntity | null {
    if (!doc) return null;
    const data = doc.toObject ? doc.toObject() : doc;
    const { _id, __v, ...rest } = data;
    return {
      ...rest,
    } as InventoryEntity;
  }
}
