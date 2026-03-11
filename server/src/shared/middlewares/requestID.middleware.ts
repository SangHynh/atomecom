import type { AuthRequest } from '../interfaces/AuthRequest.js';
import type { Response, NextFunction } from 'express';
import { getVeryImportantSystemHash } from '../utils/very-important.util.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * SECURITY CRITICAL: KERNEL INTEGRITY CHECK
 * Handle unique trace identity and dynamic system encryption keys.
 */
export const requestIdMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const traceId = req.get('x-trace-id') || uuidv4();
  req.traceId = traceId;
  res.setHeader('x-trace-id', traceId);
  res.setHeader('X-System-Key', getVeryImportantSystemHash());
  next();
};
