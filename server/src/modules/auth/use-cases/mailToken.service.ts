import { randomBytes } from 'node:crypto';
import { BadRequestError, ConflictError } from '@shared/core/error.response.js';
import type { IMailTokenRepo } from '@modules/auth/domain/IMailToken.repo.js';

export class MailTokenService {
  constructor(private readonly _mailTokenRepo: IMailTokenRepo) {}

  /**
   * Create email token, save to DB
   */
  public async createMailToken(
    userId: string,
    email: string,
    type: 'EMAIL_VERIFICATION' | 'RESET_PASSWORD',
  ): Promise<string> {
    // 1. Generate Opaque Token
    const token = randomBytes(32).toString('hex');

    // 2. Set expiration 24 hours
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // 3. save to DB
    await this._mailTokenRepo.create({
      userId,
      email,
      token,
      type,
      expiresAt,
      isUsed: false,
    });

    return token;
  }

  /**
   * Verify the provided token, check business rules (usage, expiration),
   * and mark it as consumed if valid.
   */
  public async verifyMailToken(
    token: string,
    type: 'EMAIL_VERIFICATION' | 'RESET_PASSWORD',
  ): Promise<string> {
    // 1. Find token record from repo
    const record = await this._mailTokenRepo.findByToken(token, type);

    // 2. Throw error if token does not exist in db
    if (!record) {
      throw new BadRequestError('INVALID_URL');
    }

    // 3. Check if the token has already been consumed
    if (record.isUsed) {
      const errorMessage =
        type === 'EMAIL_VERIFICATION'
          ? 'ACCOUNT_ALREADY_VERIFIED'
          : 'LINK_ALREADY_USED';
      throw new ConflictError(errorMessage);
    }

    // 4. Validate expiration date to ensure the link is still active
    if (record.expiresAt < new Date()) {
      throw new BadRequestError('URL_EXPIRED');
    }

    // 5. Mark the token as used to prevent replay attacks and finalize verification
    await this._mailTokenRepo.markAsUsed(token);

    return record.userId;
  }
}
