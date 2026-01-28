import express , { type Request, type Response } from 'express';
import healthRouter from '@monitoring/interfaces/health.route.js';

const router = express.Router();

router.get('/', (_req: Request, res: Response) => res.send('Hello Kitty!'));
router.use(healthRouter);

export default router;
