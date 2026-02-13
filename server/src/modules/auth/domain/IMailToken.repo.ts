import type { MailTokenEntity } from '@modules/auth/domain/mailToken.entity.js';

/**
 * Repository interface for persisting mail-related tokens (Opaque Tokens).
 */
export interface IMailTokenRepo {
  create(mailTokenEntity: MailTokenEntity): Promise<void>;

  /**
   * Find a valid token.
   */
  findByToken(
    token: string,
    type: 'EMAIL_VERIFICATION' | 'RESET_PASSWORD',
  ): Promise<MailTokenEntity | null>;

  /**
   * Update it as used in one atomic operation.
   * This ensures "One-time use" and prevents race conditions.
   */
  markAsUsed(token: string): Promise<void>;
}
