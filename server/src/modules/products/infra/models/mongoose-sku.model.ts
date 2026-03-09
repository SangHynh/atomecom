import mongoose, { Schema, Document } from 'mongoose';
import type { SkuEntity } from '../../domain/entities/sku.entity.js';

const PriceHistorySchema = new Schema(
  {
    basePrice: { type: Number, required: true },
    salePrice: { type: Number },
    type: { type: String, enum: ['MANUAL', 'PROMOTION'], required: true },
    reason: { type: String },
    appliedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const SkuSchema = new Schema<SkuEntity & Document>(
  {
    productId: {
      type: Schema.Types.ObjectId as any,
      ref: 'Product',
      required: true,
    },
    skuCode: { type: String, required: true, unique: true, trim: true },
    barcode: { type: String, trim: true },
    name: { type: String, required: true, trim: true },
    attributes: [
      {
        key: { type: String, required: true },
        value: { type: String, required: true },
        label: { type: String, required: true },
        _id: false,
      },
    ],
    price: {
      basePrice: { type: Number, required: true },
      salePrice: { type: Number },
    },
    priceHistory: { type: [PriceHistorySchema], default: [] },
    images: { type: [String], default: [] },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
    },
    version: { type: Number, default: 1 },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    collection: 'skus',
    toJSON: {
      transform: (_doc, ret: any) => {
        const targetId = ret._id || ret.id;
        const { _id, __v, id, ...rest } = ret;
        return { id: targetId.toString(), ...rest };
      },
    },
  },
);

SkuSchema.index({ productId: 1 });
SkuSchema.index({ deletedAt: 1 });

const excludeDeletedMiddleware = function (this: any) {
  const query = this.getQuery();
  this.setQuery({ ...query, deletedAt: null });
};

SkuSchema.pre(/^find/, excludeDeletedMiddleware);
SkuSchema.pre('countDocuments', excludeDeletedMiddleware);
SkuSchema.pre('aggregate', function (this: any) {
  this.pipeline().unshift({ $match: { deletedAt: null } });
});

export const SkuModel = mongoose.model<SkuEntity & Document>('Sku', SkuSchema);
