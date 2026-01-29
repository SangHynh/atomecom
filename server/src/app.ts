import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import router from './shared/index.route.js';
import { NotFoundError } from './shared/core/error.response.js';
import { httpLogger } from '@shared/utils/logger.js';
import { ZodError } from 'zod';

const app = express();

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(cors());
app.use(httpLogger);
app.use(compression());
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
  }),
);
// routes
app.use(router);

// error handlers
app.use((_req: Request, _res: Response, next: NextFunction) => {
  const error = new NotFoundError('Route not found');
  next(error);
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
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
    console.error(`[Error][${err.module || 'App'}]:`, err);
  }

  // St3: App error
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    module: err.module || 'App',
    layer: err.layer || 'App',
    message: err.message.toUpperCase().replace(/ /g, '_') || 'INTERNAL_SERVER_ERROR',
    errors: err.errors || [],
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

export default app;
