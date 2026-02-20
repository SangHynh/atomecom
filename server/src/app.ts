import express from 'express';

import compression from 'compression';
import router from './shared/index.route.js';
import { httpLogger } from '@shared/utils/logger.js';
import { requestIdMiddleware } from '@shared/middlewares/requestID.middleware.js';
import { performanceMiddleware } from '@shared/middlewares/perfomance.middleware.js';
import { globalRateLimiter } from '@shared/middlewares/ratelimit.middleware.js';
import { errorHandler } from '@shared/middlewares/error.middleware.js';
import { helmetMiddleware } from '@shared/middlewares/helmet.middleware.js';
import { corsMiddleware } from '@shared/middlewares/cors.middleware.js';
import { blacklistMiddlewareImpl } from './container.js';
import cookieParser from 'cookie-parser';

const app = express();

// middleware
app.use(blacklistMiddlewareImpl);
app.use(express.json());
app.use(cookieParser());
app.use(requestIdMiddleware);
app.use(performanceMiddleware);
app.use(express.urlencoded({ extended: true }));
app.use(helmetMiddleware);
app.set('trust proxy', 1);
app.use(corsMiddleware);
app.use(httpLogger);
app.use(compression());
app.use(globalRateLimiter);
app.set('view engine', 'hbs');

// routes
app.use(router);

// error handlers
app.use(errorHandler);

export default app;
