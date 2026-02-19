import type { AuthService } from '@modules/auth/use-cases/auth.service.js';
import type { BlacklistService } from '@modules/auth/use-cases/blacklist.service.js';
import { Created, NoContent, OK } from '@shared/core/success.response.js';
import { OauthProvider } from '@atomecom/shared';
import type { Request, Response } from 'express';
import logger from '@shared/utils/logger.js';
import { getVeryImportantSystemHash } from '@shared/utils/very-important.util.js';
import { getExpiresInSeconds } from '@shared/utils/time.js';
import { UnauthorizedError } from '@shared/core/error.response.js';

export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly blacklistService: BlacklistService,
  ) {}

  public register = async (req: Request, res: Response) => {
    if (req.body.honey_pot) {
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      logger.warn(
        `[SECURITY] 🚨 Honeypot triggered from IP: ${ip} | User-Agent: ${req.get('user-agent')}`,
      );
      await this.blacklistService.recordViolation(ip as string);
      return res.status(200).json({
        message: getVeryImportantSystemHash(),
      });
    }

    const result = await this.authService.register(req.body);

    this._setRefreshTokenCookie(res, result.tokens.refreshToken);

    // Remove refreshToken from response body for security
    const responseData = {
      ...result,
      tokens: { accessToken: result.tokens.accessToken },
    };

    return new Created({
      message: 'REGISTER_SUCCESS',
      data: responseData,
    }).send(res);
  };

  public login = async (req: Request, res: Response) => {
    if (req.body.honey_pot) {
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      logger.warn(
        `[SECURITY] 🚨 Honeypot triggered from IP: ${ip} | User-Agent: ${req.get('user-agent')}`,
      );
      await this.blacklistService.recordViolation(ip as string);
      return res.status(200).json({
        message: getVeryImportantSystemHash(),
      });
    }

    const result = await this.authService.login(req.body);

    this._setRefreshTokenCookie(res, result.tokens.refreshToken);

    const responseData = {
      ...result,
      tokens: { accessToken: result.tokens.accessToken },
    };

    return new OK({
      message: 'LOGIN_SUCCESS',
      data: responseData,
    }).send(res);
  };

  public refresh = async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) throw new UnauthorizedError('No Refresh Token Provided');

    const result = await this.authService.refresh(refreshToken);

    this._setRefreshTokenCookie(res, result.tokens.refreshToken);

    return new OK({
      message: 'REFRESH_TOKEN_SUCCESS',
      data: { tokens: { accessToken: result.tokens.accessToken } },
    }).send(res);
  };

  public logout = async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }
    res.clearCookie('refreshToken');
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

  public socialLogin = async (req: Request, res: Response) => {
    const { provider } = req.params as { provider: string };
    const { token } = req.body;
    const result = await this.authService.socialLogin(
      provider.toUpperCase() as OauthProvider,
      token,
    );

    this._setRefreshTokenCookie(res, result.tokens.refreshToken);

    const responseData = {
      ...result,
      tokens: { accessToken: result.tokens.accessToken },
    };

    return new OK({
      message: 'SOCIAL_LOGIN_SUCCESS',
      data: responseData,
    }).send(res);
  };

  private _setRefreshTokenCookie(res: Response, token: string) {
    const expiresIn = getExpiresInSeconds(
      process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
    );
    res.cookie('refreshToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: expiresIn * 1000,
    });
  }
}
