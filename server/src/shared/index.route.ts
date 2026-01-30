import express, {
  type NextFunction,
  type Request,
  type Response,
} from 'express';
import healthRouter from '@monitoring/interfaces/health.route.js';
import userRouter from '@modules/users/interfaces/user.route.js';
import { NotFoundError } from '@shared/core/error.response.js';

const router = express.Router();
const VERSION = 'v1';
router.get('/', (_req: Request, res: Response) => res.send('Hello Kitty!'));
router.use(healthRouter);
router.use(`/${VERSION}/api`, userRouter);

router.use((_req: Request, _res: Response, next: NextFunction) => {
  const error = new NotFoundError('Route not found');
  next(error);
});

export default router;
