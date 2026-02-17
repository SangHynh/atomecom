import express, {
  type NextFunction,
  type Request,
  type Response,
} from 'express';
import healthRouter from '@modules/monitoring/presentation/health.route.js';
import userRouter from '@modules/users/presentation/user.route.js';
import authRouter from '@modules/auth/presentation/auth.route.js';
import { NotFoundError } from '@shared/core/error.response.js';
import docsRouter from '@shared/docs.route.js';
import testUIRouter from './test-ui.route.js';
import { NODE_ENV } from '@config/app.config.js';
import { isDev } from '@shared/utils/common.js';

const router = express.Router();
router.get('/', (_req: Request, res: Response) => res.send('Hello Kitty!'));
router.use('/v1/health', healthRouter);

router.use(`/v1/api`, userRouter);
router.use(`/v1/api`, authRouter);
router.use(`/v1/docs`, docsRouter);

// Dev-only routes for testing HTML files
if (isDev) {
  router.use('/test-ui', testUIRouter);
}

router.use((_req: Request, _res: Response, next: NextFunction) => {
  const error = new NotFoundError('RESOURCE_NOT_FOUND');
  next(error);
});

export default router;
