import mongoose, { Schema, Document } from 'mongoose';
import { PRODUCT_STATUS } from '@atomecom/shared';
import type { CategoryEntity } from '../../domain/entities/category.entity.js';

const CategorySchema = new Schema<CategoryEntity & Document>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    path: { type: String, required: true, index: true }, // Hierarchy path using IDs (e.g., ",65a1,65b2,")
    description: { type: String },
    icon: { type: String },
    status: {
      type: String,
      enum: Object.values(PRODUCT_STATUS),
      default: PRODUCT_STATUS.PUBLISHED,
    },
    attributeDefinitions: [
      {
        key: { type: String, required: true },
        label: { type: String, required: true },
        type: {
          type: String,
          enum: ['text', 'number', 'select'],
          required: true,
        },
        options: { type: [String], default: undefined },
        _id: false,
      },
    ],
    deletedAt: { type: Date, default: null },
    version: { type: Number, default: 1 },
  },
  {
    timestamps: true,
    collection: 'categories',
    toJSON: {
      transform: (_doc, ret: any) => {
        const targetId = ret._id || ret.id;
        const { _id, __v, id, ...rest } = ret;
        return { id: targetId.toString(), ...rest };
      },
    },
  },
);

CategorySchema.index({ deletedAt: 1 });

const excludeDeletedMiddleware = function (this: any) {
  const query = this.getQuery();
  this.setQuery({ ...query, deletedAt: null });
};

CategorySchema.pre(/^find/, excludeDeletedMiddleware);
CategorySchema.pre('countDocuments', excludeDeletedMiddleware);
CategorySchema.pre('aggregate', function (this: any) {
  this.pipeline().unshift({ $match: { deletedAt: null } });
});

export const CategoryModel = mongoose.model<CategoryEntity & Document>(
  'Category',
  CategorySchema,
);
