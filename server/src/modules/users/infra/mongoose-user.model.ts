import type {
  UserEntity,
  UserAddress,
} from '@modules/users/domain/user.entity.js';
import { USER_ROLE } from '@shared/enum/userRole.enum.js';
import { USER_STATUS } from '@shared/enum/userStatus.enum.js';
import { OauthProvider } from '@shared/enum/oauthProvider.enum.js';
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

// 2. Social Link Sub-schema
const UserSocialLinkSchema = new Schema(
  {
    provider: {
      type: String,
      enum: Object.values(OauthProvider),
      required: true,
    },
    providerId: { type: String, required: true },
  },
  { _id: false },
);

// 3. Main User Schema
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
    phone: {
      type: String,
      trim: true,
      unique: true,
      sparse: true, // allow null value and no duplicate
    },
    password: {
      type: String,
      required: false, // Oauth no need
    },
    role: {
      type: String,
      required: true,
      enum: Object.values(USER_ROLE),
    },
    addresses: [AddressSchema],
    status: {
      type: String,
      enum: Object.values(USER_STATUS),
      default: USER_STATUS.ACTIVE,
    },
    isVerified: { type: Boolean, default: false },
    avatar: { type: String },
    version: { type: Number, default: 1 },

    // OAuth Fields
    providers: [UserSocialLinkSchema],
    isExternal: { type: Boolean, default: false },
    isEmailMissing: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    collection: 'users',
    toJSON: {
      transform: (_doc, ret) => {
        const { _id, __v, password, ...rest } = ret;
        return { id: _id, ...rest };
      },
    },
  },
);

// 3. Indexing
UserSchema.index(
  { 'providers.provider': 1, 'providers.providerId': 1 },
  {
    unique: true,
    partialFilterExpression: { 'providers.0': { $exists: true } }, // unique at least one provider
  },
);

export const UserModel = mongoose.model<UserEntity & Document>(
  'User',
  UserSchema,
);
