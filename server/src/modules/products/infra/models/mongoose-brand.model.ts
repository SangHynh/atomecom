import mongoose, { Schema, Document } from 'mongoose';
import { PRODUCT_STATUS } from '@atomecom/shared';
import type { BrandEntity } from '../../domain/entities/brand.entity.js';

const BrandSchema = new Schema<BrandEntity & Document>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    logo: { type: String, required: true },
    description: { type: String },
    status: {
      type: String,
      enum: Object.values(PRODUCT_STATUS),
      default: PRODUCT_STATUS.PUBLISHED,
    },
    deletedAt: { type: Date, default: null },
    version: { type: Number, default: 1 },
  },
  {
    timestamps: true,
    collection: 'brands',
    toJSON: {
      transform: (_doc, ret: any) => {
        const targetId = ret._id || ret.id;
        const { _id, __v, id, ...rest } = ret;
        return { id: targetId.toString(), ...rest };
      },
    },
  },
);

BrandSchema.index({ deletedAt: 1 });

const excludeDeletedMiddleware = function (this: any) {
  const query = this.getQuery();
  this.setQuery({ ...query, deletedAt: null });
};

BrandSchema.pre(/^find/, excludeDeletedMiddleware);
BrandSchema.pre('countDocuments', excludeDeletedMiddleware);
BrandSchema.pre('aggregate', function (this: any) {
  this.pipeline().unshift({ $match: { deletedAt: null } });
});

export const BrandModel = mongoose.model<BrandEntity & Document>(
  'Brand',
  BrandSchema,
);
