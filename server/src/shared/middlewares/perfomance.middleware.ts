import { type Request, type Response, type NextFunction } from 'express';
export const performanceMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  (req as any).startTime = performance.now();
  next();
};
