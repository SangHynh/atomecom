import type { IMailTokenRepo } from '@modules/auth/domain/IMailToken.repo.js';
import { MailTokenModel } from './mongoose-mailToken.model.js';
import type { MailTokenEntity } from '@modules/auth/domain/mailToken.entity.js';

export class MongooseMailTokenRepo implements IMailTokenRepo {
  /**
   * Create a new mail token record in the database
   */
  public async create(mailTokenEntity: MailTokenEntity): Promise<void> {
    await MailTokenModel.create({
      userId: mailTokenEntity.userId,
      email: mailTokenEntity.email,
      token: mailTokenEntity.token,
      type: mailTokenEntity.type,
      isUsed: mailTokenEntity.isUsed,
      expiresAt: mailTokenEntity.expiresAt,
    });
  }

  /**
   * Find a token record by its value and type.
   * This is used to retrieve data for detailed business logic validation in the service layer.
   */
  public async findByToken(
    token: string,
    type: 'EMAIL_VERIFICATION' | 'RESET_PASSWORD',
  ): Promise<MailTokenEntity | null> {
    const record = await MailTokenModel.findOne({ token, type }).lean();

    if (!record) return null;

    return {
      userId: record.userId.toString(),
      email: record.email,
      token: record.token,
      type: record.type as 'EMAIL_VERIFICATION' | 'RESET_PASSWORD',
      isUsed: record.isUsed,
      expiresAt: record.expiresAt,
    };
  }

  /**
   * Mark a token as used after successful verification.
   */
  public async markAsUsed(token: string): Promise<void> {
    await MailTokenModel.updateOne(
      { token },
      { $set: { isUsed: true } }
    );
  }
}