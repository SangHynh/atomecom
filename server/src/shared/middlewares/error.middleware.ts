import { isDev } from '@shared/utils/common.js';
import { type Request, type Response, type NextFunction } from 'express';
import { ZodError } from 'zod';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const statusCode = err.status || 500;

  // St1: Validation error
  if (err instanceof ZodError) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      module: 'VALIDATION',
      layer: 'INTERFACE',
      message: 'VALIDATION_ERROR',
      errors: err.issues.map((e) => ({
        field: e.path.join('.'),
        message: e.message.toUpperCase().replace(/ /g, '_'),
      })),
    });
  }

  // St2: Log error
  if (statusCode >= 500) {
    console.error(`[Error][${err.module || 'SYSTEM'}]:`, err);
  }

  // St3: Send response
  const isInternalError = statusCode >= 500;
  const responseMessage =
    isInternalError && !isDev
      ? 'INTERNAL_SERVER_ERROR' // Hide detail internal errors if not development environment
      : err.message?.toUpperCase().replace(/ /g, '_') ||
        'INTERNAL_SERVER_ERROR';

  const responseErrors =
    isInternalError && !isDev
      ? [] // Hide internal errors
      : err.errors || [];

  return res.status(statusCode).json({
    status: 'error',
    statusCode,
    module: err.module || 'App',
    layer: err.layer || 'App',
    message: responseMessage,
    errors: responseErrors,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};
