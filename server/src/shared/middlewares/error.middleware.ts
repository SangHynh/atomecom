import { type Response, type NextFunction } from 'express';
import { ZodError } from 'zod';
import appConfig from '@shared/configs/app.config.js';
import type { AuthRequest } from '../interfaces/AuthRequest.js';
import logger from '../utils/logger.js';

const appCfg = appConfig!;

export const errorHandler = (
  err: any,
  req: AuthRequest,
  res: Response,
  _next: NextFunction,
) => {
  try {
    const statusCode = err.statusCode || err.status || 500;
    const message = err.message || 'Internal Server Error';

    // St1: Specific error patterns
    if (err.name === 'ValidationError' || err.name === 'ZodError' || err instanceof ZodError) {
      const formattedErrors = ((err as any).issues || []).map((issue: any) => ({
        ...issue,
        field: issue.path ? issue.path.join('.') : undefined,
      }));
      return res.status(400).json({
        status: 'error',
        statusCode: 400,
        message: 'VALIDATION_ERROR',
        errors: formattedErrors.length > 0 ? formattedErrors : (err as any).errors || [],
      });
    }

    if (err.code === 11000) {
      return res.status(409).json({
        status: 'error',
        statusCode: 409,
        message: 'DUPLICATE_KEY_ERROR',
      });
    }

    // St2: Log error for debug
    if (statusCode >= 500) {
      logger.error(
        `[${err.module || 'App'}][${err.layer || 'App'}][Error] ${message} - Stack: ${err.stack}`,
      );
    } else {
      logger.warn(
        `[${err.module || 'App'}][${err.layer || 'App'}][Warn] ${message}`,
      );
    }

    // St3: Send response
    const isInternalError = statusCode >= 500;
    const isProduction = appCfg.app.isProduction;
    const responseMessage =
      isInternalError && isProduction ? 'INTERNAL_SERVER_ERROR' : message;

    return res.status(statusCode).json({
      status: 'error',
      statusCode,
      module: err.module || 'App',
      layer: err.layer || 'App',
      message: responseMessage,
      stack: !isProduction ? err.stack : undefined,
    });
  } catch (criticalError) {
    logger.error(`CRITICAL ERROR IN ERROR HANDLER: ${criticalError}`);
    return res.status(500).json({ status: 'error', message: 'CRITICAL_ERROR' });
  }
};
