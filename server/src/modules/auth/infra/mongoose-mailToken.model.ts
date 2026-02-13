import type { MailTokenEntity } from '@modules/auth/domain/mailToken.entity.js';
import mongoose, { Schema, Document } from 'mongoose';

export interface IMailTokenDocument extends Omit<MailTokenEntity, 'userId'>, Document {
  userId: mongoose.Types.ObjectId; 
}

const MailTokenSchema = new Schema<IMailTokenDocument>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User', index: true },
    token: { type: String, required: true, unique: true, index: true },
    type: { type: String, required: true, enum: ['EMAIL_VERIFICATION', 'RESET_PASSWORD'] },
    isUsed: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true },
  },
  {
    timestamps: true,
    collection: 'mail_tokens',
  }
);

MailTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const MailTokenModel = mongoose.model<IMailTokenDocument>('MailToken', MailTokenSchema);