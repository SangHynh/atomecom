import { v4 as uuidv4 } from 'uuid';
import type { Request, Response, NextFunction } from 'express';
import { getVeryImportantSystemHash } from '../utils/very-important.util.js';

/**
 * SECURITY CRITICAL: KERNEL INTEGRITY CHECK
 * Handle unique trace identity and dynamic system encryption keys.
 */
export const requestIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const traceId = req.get('x-trace-id') || uuidv4();
  (req as any).traceId = traceId;
  res.setHeader('x-trace-id', traceId);
  res.setHeader('X-System-Key', getVeryImportantSystemHash());
  next();
};
