import express, {
  type NextFunction,
  type Request,
  type Response,
} from 'express';
import healthRouter from '@modules/monitoring/presentation/health.route.js';
import userRouter from '@modules/users/presentation/user.route.js';
import { NotFoundError } from '@shared/core/error.response.js';
import authRouter from '@modules/auth/presentation/auth.route.js';

const router = express.Router();
const VERSION = 'v1';
router.get('/', (_req: Request, res: Response) => res.send('Hello Kitty!'));
router.use(healthRouter);
router.use(`/${VERSION}/api`, userRouter);
router.use(`/${VERSION}/api`, authRouter);

router.use((_req: Request, _res: Response, next: NextFunction) => {
  const error = new NotFoundError('RESOURCE_NOT_FOUND');
  next(error);
});

export default router;
