import appConfig from '@config/app.config.js';
import { MongooseUserRepo } from '@modules/users/infra/mongoose-user.repo.js';
import { UserController } from '@modules/users/presentation/user.controller.js';
import { UserService } from '@modules/users/use-cases/user.service.js';
import HealthController from '@modules/monitoring/presentation/health.controller.js';
import HealthService from '@monitoring/use-cases/health.service.js';
import { MongoDatabase } from '@shared/infra/mongoose.db.js';
import { AuthService } from '@modules/auth/use-cases/auth.service.js';
import { BcryptHashAdapter } from '@modules/users/infra/bcryptHash.adapter.js';
import { JwtTokenAdapter } from '@modules/auth/infra/jwtToken.adapter.js';
import { AuthController } from '@modules/auth/presentation/auth.controller.js';
import { RedisCache } from '@shared/infra/ioredis.cache.js';
import { authMiddleware } from '@shared/middlewares/auth.middleware.js';
import { SessionService } from '@modules/auth/use-cases/session.service.js';
import { ResendMailService } from '@shared/infra/resend-mail.service.js';
import { MongooseMailTokenRepo } from '@modules/auth/infra/mongoose-mailToken.repo.js';
import { MailTokenService } from '@modules/auth/use-cases/mailToken.service.js';

// 1. INFRA LAYER
export const db = new MongoDatabase(appConfig!.db.uri);
export const cache = new RedisCache(appConfig!.cache.uri);
const emailService = new ResendMailService();

const userRepo = new MongooseUserRepo();
const hashService = new BcryptHashAdapter();
const tokenService = new JwtTokenAdapter();
const mailTokenRepo = new MongooseMailTokenRepo();

// 2. USE-CASES LAYER
const healthService = new HealthService(db, cache);
const userService = new UserService({ userRepo, hashService });
const sessionService = new SessionService(cache);
const mailTokenService = new MailTokenService(mailTokenRepo);
const authService = new AuthService({
  tokenService,
  userService,
  sessionService,
  emailService,
  mailTokenService,
});

// 3. PRESENTATION LAYER
export const healthControllerImpl = new HealthController(healthService);
export const userControllerImpl = new UserController(userService);
export const authControllerImpl = new AuthController(authService);
export const authMiddlewareImpl = authMiddleware(tokenService);
