import type { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '@shared/core/error.response.js';
import type { ITokenService } from '@modules/auth/domain/IToken.service.js';
import type { EventBus } from '@shared/infra/event-bus.js';
import { DomainEvents } from '@shared/constants/event.constants.js';
import { ErrorAuthCodes } from '@atomecom/shared';

export const authMiddleware = (
  tokenService: ITokenService,
  eventBus: EventBus,
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. Get access token from header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedError(ErrorAuthCodes.UNAUTHORIZED_MISSING_TOKEN);
      }

      const accessToken = authHeader.split(' ')[1];

      // 2. Verify token
      const payload = await tokenService.verifyAccessToken(accessToken);
      if (!payload) {
        throw new UnauthorizedError(ErrorAuthCodes.UNAUTHORIZED_INVALID_TOKEN);
      }

      // 3. Assign payload to req.user
      (req as any).user = payload;

      // 4. Record Activity (Heartbeat) via Event Bus (EDA)
      // This decouples Auth from activity tracking logic

      // Cloudflare & Proxy Support
      // Since app.set('trust proxy', 1) is enabled, req.ip is reliable for standard proxies
      const ip =
        (req.headers['cf-connecting-ip'] as string) || // Cloudflare (Highest priority)
        req.ip || // Express 'trust proxy' (Covers X-Forwarded-For & Remote Address)
        'unknown';
      const userAgent = req.headers['user-agent'] || 'unknown';

      eventBus.emit(DomainEvents.USER_ACTIVITY, {
        userId: payload.userId,
        ip,
        userAgent,
      });

      next();
    } catch (error) {
      next(error);
    }
  };
};
