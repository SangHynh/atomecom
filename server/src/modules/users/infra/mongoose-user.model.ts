import type { UserEntity, UserAddress } from '@modules/users/domain/user.entity.js';
import { USER_ROLE } from '@shared/enum/userRole.enum.js';
import mongoose, { Schema, Document } from 'mongoose';

// 1. Address Sub-schema
const AddressSchema = new Schema<UserAddress>(
  {
    isDefault: { type: Boolean, default: false },
    street: { type: String, required: true },
    city: { type: String, required: true },
    version: { type: Number, default: 1 },
  },
  { _id: false },
);

// 2. Main User Schema
const UserSchema = new Schema<UserEntity & Document>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, trim: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: USER_ROLE,
    },
    addresses: [AddressSchema],
    status: { type: String, default: 'ACTIVE' },
    isVerified: { type: Boolean, default: false },
    version: { type: Number, default: 1 },
  },
  {
    timestamps: true,
    collection: 'users',
    toJSON: {
      transform: (_doc, ret) => {
        const { _id, __v, ...rest } = ret;
        return { id: _id, ...rest };
      },
    },
  },
);

// 3. Indexing

export const UserModel = mongoose.model<UserEntity & Document>('User', UserSchema);
