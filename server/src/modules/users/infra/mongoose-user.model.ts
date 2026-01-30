import type { User, UserAddress } from '@modules/users/domain/user.domain.js';
import { USER_ROLE } from '@shared/enum/userRole.enum.js';
import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';
// 1. Address Sub-schema
const AddressSchema = new Schema<UserAddress>(
  {
    isDefault: { type: Boolean, default: false },
    street: { type: String, required: true },
    city: { type: String, required: true },
    phone: { type: String, required: true },
    version: { type: Number, default: 1 },
  },
  { _id: false },
);

// 2. Main User Schema
const UserSchema = new Schema<User & Document>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      required: true,
      enum: USER_ROLE,
    },
    addresses: [AddressSchema],
    status: { type: String, default: 'ACTIVE' },
    verified: { type: Boolean, default: false },
    version: { type: Number, default: 1 },
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
UserSchema.index({ email: 1 });

// 4. Pre Hooks
UserSchema.pre('save', async function (this: any) {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password as string, salt);
});

UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

export const UserModel = mongoose.model<User & Document>('User', UserSchema);
