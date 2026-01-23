import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { NotFoundError } from './core/error.response.js';
import { register } from 'node:module';
import router from './routes/index.route.js';

const app = express();

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
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
app.use((req: Request, res: Response, next: NextFunction) => {
  const error = new NotFoundError('Route not found');
  next(error);
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.status || 500;
  if (statusCode >= 500) {
    console.error(`[Error][${err.module || 'App'}]:`, err);
  }
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    errorCode: err.errorCode,
    module: err.module || 'App',
    layer: err.layer || 'App',
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

export default app;
