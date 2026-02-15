import type { AuthService } from '@modules/auth/use-cases/auth.service.js';
import { Created, NoContent, OK } from '@shared/core/success.response.js';
import type { Request, Response } from 'express';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  public register = async (req: Request, res: Response) => {
    const result = await this.authService.register(req.body);
    return new Created({
      message: 'REGISTER_SUCCESS',
      data: result,
    }).send(res);
  };

  public login = async (req: Request, res: Response) => {
    const result = await this.authService.login(req.body);
    return new OK({
      message: 'LOGIN_SUCCESS',
      data: result,
    }).send(res);
  };

  public refresh = async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    const result = await this.authService.refresh(refreshToken);
    return new OK({
      message: 'REFRESH_TOKEN_SUCCESS',
      data: result,
    }).send(res);
  };

  public logout = async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    await this.authService.logout(refreshToken);
    return new NoContent('LOGOUT_SUCCESS').send(res);
  };

  public verifyEmail = async (req: Request, res: Response) => {
    const { token } = req.query as { token: string };
    const result = await this.authService.verifyEmail(token);
    return new OK({
      message: 'ACCOUNT_VERIFICATION_SUCCESS',
      data: result,
    }).send(res);
  };

  public resendVerification = async (req: Request, res: Response) => {
    const { email } = req.body;
    await this.authService.resendVerificationEmail(email);
    return new OK({
      message: 'RESEND_VERIFICATION_SUCCESS',
    }).send(res);
  };

  public forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body;
    await this.authService.forgotPassword(email);
    return new OK({
      message: 'FORGOT_PASSWORD_EMAIL_SENT',
    }).send(res);
  };

  public resetPassword = async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;
    await this.authService.resetPassword(token, newPassword);
    return new OK({
      message: 'RESET_PASSWORD_SUCCESS',
    }).send(res);
  };
}