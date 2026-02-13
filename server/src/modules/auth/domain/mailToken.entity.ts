export interface MailTokenEntity {
  userId: string;
  email: string;
  token: string;
  type: 'EMAIL_VERIFICATION' | 'RESET_PASSWORD';
  isUsed: boolean;
  expiresAt: Date;
}