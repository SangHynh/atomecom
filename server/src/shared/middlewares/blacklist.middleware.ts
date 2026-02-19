import type { Request, Response, NextFunction } from 'express';
import type { BlacklistService } from '../../modules/auth/use-cases/blacklist.service.js';
import { ForbiddenError } from '../core/error.response.js';
import rateLimit from 'express-rate-limit';

export const blacklistMiddleware = (blacklistService: BlacklistService) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const ip =
      req.ip ||
      req.headers['x-forwarded-for']?.toString() ||
      req.socket.remoteAddress ||
      'unknown';

    try {
      const status = await blacklistService.checkStatus(ip);

      if (status.isBanned) {
        throw new ForbiddenError('IP_BANNED_DUE_TO_SUSPICIOUS_ACTIVITY');
      }

      if (status.limit) {
        // Enforce the dynamic limit
        const isRateLimited = await blacklistService.isRateLimited(
          ip,
          status.limit,
        );
        if (isRateLimited) {
          // Stay "seamless" or return 429?
          // 429 is standard, but the user mentioned "seamless".
          // However, for rate limiting, 429 is necessary to stop the flow.
          res.status(429).json({
            message: 'TOO_MANY_REQUESTS',
          });
          return;
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
