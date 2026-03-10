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
import { BlacklistService } from '@modules/auth/use-cases/blacklist.service.js';
import { blacklistMiddleware } from '@shared/middlewares/blacklist.middleware.js';

import { MongooseBrandRepo } from '@modules/products/infra/repositories/mongoose-brand.repo.js';
import { MongooseCategoryRepo } from '@modules/products/infra/repositories/mongoose-category.repo.js';
import { MongooseProductRepo } from '@modules/products/infra/repositories/mongoose-product.repo.js';
import { MongooseSkuRepo } from '@modules/products/infra/repositories/mongoose-sku.repo.js';
import { MongooseInventoryRepo } from '@modules/inventory/infra/repositories/mongoose-inventory.repo.js';
import { ProductService } from '@modules/products/use-cases/services/product.service.js';
import { SkuService } from '@modules/products/use-cases/services/sku.service.js';
import { CategoryService } from '@modules/products/use-cases/services/category.service.js';
import { BrandService } from '@modules/products/use-cases/services/brand.service.js';
import { InventoryService } from '@modules/inventory/use-cases/inventory.service.js';
import { ProductController } from '@modules/products/presentation/controllers/product.controller.js';
import { CategoryController } from '@modules/products/presentation/controllers/category.controller.js';
import { BrandController } from '@modules/products/presentation/controllers/brand.controller.js';
import { SkuController } from '@modules/products/presentation/controllers/sku.controller.js';
import { InventoryController } from '@modules/inventory/presentation/inventory.controller.js';

import { UserActivityListener } from '@modules/users/use-cases/user-activity.listener.js';

// 1. INFRA LAYER
export const db = new MongoDatabase(appConfig!.db.uri);
export const cache = new RedisCache(appConfig!.cache.uri);
const eventBus = new EventBus();
const emailService = new ResendMailService();

const userRepo = new MongooseUserRepo();
const hashService = new BcryptHashAdapter();
const tokenService = new JwtTokenAdapter();
const mailTokenRepo = new MongooseMailTokenRepo();
const googleService = new GoogleProvider();
const facebookService = new FacebookProvider();
const providers: IOAuthProvider[] = [googleService, facebookService];
const oauthFactory = new OauthFactory(providers);

const brandRepo = new MongooseBrandRepo();
const categoryRepo = new MongooseCategoryRepo();
const productRepo = new MongooseProductRepo();
const skuRepo = new MongooseSkuRepo();
const inventoryRepo = new MongooseInventoryRepo();

// 2. USE-CASES (APPLICATION) LAYER
const healthService = new HealthService(db, cache);
const sessionService = new SessionService(cache);
const userService = new UserService({
  userRepo,
  hashService,
  eventBus,
  cache,
});
export const blacklistService = new BlacklistService(cache);
const mailTokenService = new MailTokenService(mailTokenRepo);
const authService = new AuthService({
  tokenService,
  userService,
  sessionService,
  mailTokenService,
  oauthFactory,
  eventBus,
});

const categoryService = new CategoryService({
  categoryRepo,
  productRepo,
  cacheRepo: cache,
});
const brandService = new BrandService({ brandRepo, productRepo });
const skuService = new SkuService({ skuRepo });
const inventoryService = new InventoryService({
  inventoryRepo,
  cacheRepo: cache,
});

const productService = new ProductService({
  productRepo,
  skuService,
  inventoryService,
  categoryService,
  brandService,
});

// 4. LISTENERS (EDA)
new EmailListener({ eventBus, emailService, mailTokenService });
new UserActivityListener({ eventBus, cache });

// 3. PRESENTATION LAYER
export const healthControllerImpl = new HealthController(healthService);
export const userControllerImpl = new UserController(userService);
export const authControllerImpl = new AuthController(
  authService,
  blacklistService,
);
export const productControllerImpl = new ProductController(productService);
export const categoryControllerImpl = new CategoryController(categoryService);
export const brandControllerImpl = new BrandController(brandService);
export const skuControllerImpl = new SkuController(skuService);
export const inventoryControllerImpl = new InventoryController(
  inventoryService,
);

export const authMiddlewareImpl = authMiddleware(tokenService, eventBus);
export const blacklistMiddlewareImpl = blacklistMiddleware(blacklistService);
