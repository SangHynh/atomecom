import mongoose, { Schema, Document } from 'mongoose';
import type { InventoryEntity } from '../../domain/entities/inventory.entity.js';

const InventorySchema = new Schema<InventoryEntity & Document>(
  {
    skuId: {
      type: Schema.Types.ObjectId as any,
      ref: 'Sku',
      required: true,
      unique: true,
    },
    quantity: { type: Number, default: 0 },
    reserved: { type: Number, default: 0 },
    available: { type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: 10 },
    location: { type: String },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    collection: 'inventory',
    toJSON: {
      transform: (_doc, ret: any) => {
        const { _id, __v, ...rest } = ret;
        return { ...rest };
      },
    },
  },
);

InventorySchema.index({ deletedAt: 1 });

const excludeDeletedMiddleware = function (this: any) {
  const query = this.getQuery();
  this.setQuery({ ...query, deletedAt: null });
};

InventorySchema.pre(/^find/, excludeDeletedMiddleware);
InventorySchema.pre('countDocuments', excludeDeletedMiddleware);
InventorySchema.pre('aggregate', function (this: any) {
  this.pipeline().unshift({ $match: { deletedAt: null } });
});

export const InventoryModel = mongoose.model<InventoryEntity & Document>(
  'Inventory',
  InventorySchema,
);
