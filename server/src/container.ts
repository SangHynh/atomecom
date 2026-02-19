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
import { ResendMailService } from '@modules/emails/infra/resend-mail.service.js';
import { EmailListener } from '@modules/emails/use-cases/email.listener.js';
import { EventBus } from '@shared/infra/event-bus.js';
import { MongooseMailTokenRepo } from '@modules/auth/infra/mongoose-mailToken.repo.js';
import { MailTokenService } from '@modules/auth/use-cases/mailToken.service.js';
import { GoogleProvider } from '@modules/auth/infra/google-oauth.adapter.js';
import { FacebookProvider } from '@modules/auth/infra/facebook-oauth.adapter.js';
import { OauthFactory } from '@modules/auth/use-cases/oauth.factory.js';
import type { IOAuthProvider } from '@modules/auth/domain/IOauthProvider.service.js';

// 1. INFRA LAYER
export const db = new MongoDatabase(appConfig!.db.uri);
export const cache = new RedisCache(appConfig!.cache.uri);
const eventBus = new EventBus();
const emailService = new ResendMailService();

const userRepo = new MongooseUserRepo();
const hashService = new BcryptHashAdapter();
const tokenService = new JwtTokenAdapter();
const mailTokenRepo = new MongooseMailTokenRepo();
const googleProvider = new GoogleProvider();
const facebookProvider = new FacebookProvider();
const providers: IOAuthProvider[] = [googleProvider, facebookProvider];
const oauthFactory = new OauthFactory(providers);

// 2. USE-CASES (APPLICATION) LAYER
const healthService = new HealthService(db, cache);
const userService = new UserService({ userRepo, hashService, eventBus });
const sessionService = new SessionService(cache);
const mailTokenService = new MailTokenService(mailTokenRepo);
const authService = new AuthService({
  tokenService,
  userService,
  sessionService,
  mailTokenService,
  oauthFactory,
  eventBus,
});

// 4. LISTENERS (EDA)
new EmailListener({ eventBus, emailService, mailTokenService });

// 3. PRESENTATION LAYER
export const healthControllerImpl = new HealthController(healthService);
export const userControllerImpl = new UserController(userService);
export const authControllerImpl = new AuthController(authService);
export const authMiddlewareImpl = authMiddleware(tokenService);
