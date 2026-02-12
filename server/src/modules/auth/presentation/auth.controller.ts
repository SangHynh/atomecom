// src/modules/auth/presentation/auth.controller.ts

import type { AuthService } from '@modules/auth/use-cases/auth.service.js';
import { Created, NoContent, OK } from '@shared/core/success.response.js';
import type { Request, Response, NextFunction } from 'express';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  public register = async (
    req: Request,
    res: Response,
    _next: NextFunction,
  ) => {
    const result = await this.authService.register(req.body);
    /**
     * TODO: Refactor to HttpOnly Cookie for Refresh Token to mitigate XSS risks.
     * Recommendation: Set the refresh token in a cookie and only return the access token/user in the body.
     */
    return new Created({
      message: 'REGISTER_SUCCESS',
      data: result,
    }).send(res);
  };

  public login = async (req: Request, res: Response, _next: NextFunction) => {
    const result = await this.authService.login(req.body);

    return new OK({
      message: 'LOGIN_SUCCESS',
      data: result,
    }).send(res);
  };

  public refresh = async (req: Request, res: Response, _next: NextFunction) => {
    const { refreshToken } = req.body;
    const result = await this.authService.refresh(refreshToken);
    return new OK({
      message: 'REFRESH_TOKEN_SUCCESS',
      data: result,
    }).send(res);
  };

  public logout = async (req: Request, res: Response, _next: NextFunction) => {
    const { refreshToken } = req.body;
    await this.authService.logout(refreshToken);
    return new NoContent('LOGOUT_SUCCESS').send(res);
  };
}
