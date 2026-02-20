export interface IEmailService {
  sendVerificationEmail(to: string, token: string): Promise<void>;
  resendVerificationEmail(to: string, token: string): Promise<void>;
  sendResetPasswordEmail(to: string, token: string): Promise<void>;
  sendStatusChangeEmail(
    to: string,
    userName: string,
    status: string,
  ): Promise<void>;
}
