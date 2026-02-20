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
import toolRouter from './tools.route.js';
import { isDev } from '@shared/utils/common.js';
import { ErrorSystemCodes } from '@atomecom/shared';
import { getVeryImportantSystemHash } from '@shared/utils/very-important.util.js';
import logger from '@shared/utils/logger.js';

const router = express.Router();
router.get('/', (_req: Request, res: Response) => res.send('Hello Kitty!'));

router.use('/health', healthRouter);

router.use(`/v1/api`, userRouter);
router.use(`/v1/api`, authRouter);
router.use(`/docs`, docsRouter);

// Dev-only routes for testing HTML files
if (isDev) {
  router.use('/tools', toolRouter);
}

// 🍯 Honeypot Route -> very important system lmao
router.get('/v1/system/admin/keys', async (req: Request, res: Response) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  logger.warn(
    `[SECURITY] 🚨 Honeypot triggered from IP: ${ip} | User-Agent: ${req.get('user-agent')}`,
  );

  // Dynamic import or passed service (for simplicity we'll use the exported instance)
  const { blacklistService } = await import('../container.js');
  await blacklistService.recordViolation(ip as string);

  res.status(200).json({
    message: getVeryImportantSystemHash(),
  });
});

router.use((_req: Request, _res: Response, next: NextFunction) => {
  const error = new NotFoundError(ErrorSystemCodes.RESOURCE_NOT_FOUND);
  next(error);
});

export default router;
