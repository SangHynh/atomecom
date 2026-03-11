import type { Request } from 'express';
import type { TokenPayload } from '@modules/auth/domain/IToken.service.js';

export interface AuthRequest extends Request {
  user?: TokenPayload;
  traceId?: string;
  startTime?: number;
}
