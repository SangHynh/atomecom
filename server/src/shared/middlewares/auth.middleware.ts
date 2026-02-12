import type { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '@shared/core/error.response.js';
import type { ITokenService } from '@modules/auth/domain/IToken.service.js';

export const authMiddleware = (tokenService: ITokenService) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. Get access token from header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedError('UNAUTHORIZED_MISSING_TOKEN');
      }

      const accessToken = authHeader.split(' ')[1];

      // 2. Verify token
      const payload = await tokenService.verifyAccessToken(accessToken);
      if (!payload) {
        throw new UnauthorizedError('UNAUTHORIZED_INVALID_TOKEN');
      }

      // 3. Assign payload to req.user
      (req as any).user = payload;

      next();
    } catch (error) {
      next(error);
    }
  };
};
