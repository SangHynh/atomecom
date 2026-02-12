import rateLimit from 'express-rate-limit';
import { type Request, type Response, type NextFunction } from 'express';

export const globalRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (_req: Request, res: Response, _next: NextFunction) => {
    res.status(429).json({
      status: 'error',
      statusCode: 429,
      module: 'RATE_LIMIT',
      layer: 'MIDDLEWARE',
      message: 'TOO_MANY_REQUESTS',
      errors: [
        {
          field: 'rate-limit',
          message: 'TOO_MANY_REQUESTS',
        },
      ],
    });
  },
});
