import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../interfaces/AuthRequest.js';

export const performanceMiddleware = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
) => {
  req.startTime = performance.now();
  next();
};
