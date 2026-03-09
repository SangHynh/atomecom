import mongoose, { Schema, Document } from 'mongoose';
import type { ProductEntity } from '../../domain/entities/product.entity.js';
import { PRODUCT_STATUS } from '@shared/enum/productStatus.enum.js';

const ProductSchema = new Schema<ProductEntity & Document>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    brandId: {
      type: Schema.Types.ObjectId as any,
      ref: 'Brand',
      required: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId as any,
      ref: 'Category',
      required: true,
    },
    description: { type: String, required: true },
    shortDescription: { type: String, required: true },
    thumbnail: { type: String, required: true },
    images: { type: [String], default: [] },
    specs: [
      {
        key: { type: String, required: true },
        value: { type: String, required: true },
        _id: false,
      },
    ],
    seo: {
      title: { type: String },
      description: { type: String },
      keywords: { type: [String], default: [] },
    },
    status: {
      type: String,
      enum: Object.values(PRODUCT_STATUS),
      default: PRODUCT_STATUS.DRAFT,
    },
    avgRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    version: { type: Number, default: 1 }, // Optimistic locking version
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    collection: 'products',
    toJSON: {
      transform: (_doc, ret: any) => {
        const targetId = ret._id || ret.id;
        const { _id, __v, id, ...rest } = ret;
        return { id: targetId.toString(), ...rest };
      },
    },
  },
);

ProductSchema.index({ categoryId: 1, status: 1 });
ProductSchema.index({ brandId: 1, status: 1 });
ProductSchema.index({ deletedAt: 1 });
ProductSchema.index({
  name: 'text',
  description: 'text',
  shortDescription: 'text',
});

// Automatically exclude deleted items from all queries
const excludeDeletedMiddleware = function (this: any) {
  const query = this.getQuery();
  this.setQuery({ ...query, deletedAt: null });
};

ProductSchema.pre(/^find/, excludeDeletedMiddleware);
ProductSchema.pre('countDocuments', excludeDeletedMiddleware);
ProductSchema.pre('aggregate', function (this: any) {
  this.pipeline().unshift({ $match: { deletedAt: null } });
});

export const ProductModel = mongoose.model<ProductEntity & Document>(
  'Product',
  ProductSchema,
);
