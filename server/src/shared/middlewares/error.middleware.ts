import { isDev } from '@shared/utils/common.js';
import { type Request, type Response, type NextFunction } from 'express';
import { ZodError, type ZodIssue } from 'zod';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  try {
    const statusCode = err.statusCode || err.status || 500;
    const message = err.message || 'Internal Server Error';

    // St1: Specific error patterns
    if (err.name === 'ValidationError' || err instanceof ZodError) {
      return res.status(400).json({
        status: 'error',
        statusCode: 400,
        message: 'VALIDATION_ERROR',
        errors: err.issues || err.errors || [],
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
    if (statusCode >= 400) {
      console.log(`[DEBUG-ERR-MID][${err.module || 'SYSTEM'}]:`, err);
    }

    // St3: Send response
    const isInternalError = statusCode >= 500;
    const responseMessage =
      isInternalError && process.env.NODE_ENV !== 'development'
        ? 'INTERNAL_SERVER_ERROR'
        : message;

    return res.status(statusCode).json({
      status: 'error',
      statusCode,
      module: err.module || 'App',
      layer: err.layer || 'App',
      message: responseMessage,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
  } catch (criticalError) {
    console.error('CRITICAL ERROR IN ERROR HANDLER:', criticalError);
    return res.status(500).json({ status: 'error', message: 'CRITICAL_ERROR' });
  }
};
