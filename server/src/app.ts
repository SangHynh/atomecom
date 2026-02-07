import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import router from './shared/index.route.js';
import { httpLogger } from '@shared/utils/logger.js';
import { requestIdMiddleware } from '@shared/middlewares/requestID.middleware.js';
import { performanceMiddleware } from '@shared/middlewares/perfomance.middleware.js';
import { globalRateLimiter } from '@shared/middlewares/ratelimit.middleware.js';
import { errorHandler } from '@shared/middlewares/error.middleware.js';

const app = express();

// middleware
app.use(express.json());
app.use(requestIdMiddleware);
app.use(performanceMiddleware);
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(cors());
app.use(httpLogger);
app.use(compression());
app.use(globalRateLimiter);
// routes
app.use(router);

// error handlers
app.use(errorHandler);

export default app;
