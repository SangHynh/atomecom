import express, { type Request, type Response } from 'express';
import healthRouter from '@monitoring/interfaces/health.route.js';
import userRouter from '@modules/users/interfaces/user.route.js';

const router = express.Router();
const VERSION = 'v1';
router.get('/', (_req: Request, res: Response) => res.send('Hello Kitty!'));
router.use(healthRouter);
router.use(`/${VERSION}/api`,userRouter)

export default router;
