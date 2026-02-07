export interface IEmailService{
    sendVerificationEmail(to: string, token: string): Promise<void>;
    sendResetPasswordEmail(to: string, token: string): Promise<void>;
}