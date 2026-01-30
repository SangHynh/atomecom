import { v4 as uuidv4 } from 'uuid';
import type { Request, Response, NextFunction } from 'express';

export const requestIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const traceId = (req.headers['x-trace-id'] as string) || uuidv4();
  (req as any).traceId = traceId;
  res.setHeader('x-trace-id', traceId);
  next();
};
