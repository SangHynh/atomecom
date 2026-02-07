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

// 1. INFRA LAYER
const db = new MongoDatabase(appConfig!.db.uri);
const userRepo = new MongooseUserRepo();
const hashService = new BcryptHashAdapter();
const tokenService = new JwtTokenAdapter();

// 2. USE-CASES LAYER
const healthService = new HealthService(db);
const userService = new UserService({ userRepo, hashService });
const authService = new AuthService({ tokenService, userService });

// 3. INTERFACES LAYER
export const healthControllerImpl = new HealthController(healthService);
export const userControllerImpl = new UserController(userService);
export const authControllerImpl = new AuthController(authService);