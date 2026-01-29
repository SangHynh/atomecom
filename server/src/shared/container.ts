import appConfig from '@config/app.config.js';
import { MongooseUserRepo } from '@modules/users/infra/mongoose-user.repo.js';
import { UserController } from '@modules/users/interfaces/user.controller.js';
import { UserService } from '@modules/users/use-cases/user.service.js';
import HealthController from '@monitoring/interfaces/health.controller.js';
import HealthService from '@monitoring/use-cases/health.service.js';
import { MongoDatabase } from '@shared/infra/mongoose.db.js';

// 1. INFRA LAYER
const db = new MongoDatabase(appConfig!.db.uri);

const userRepo = new MongooseUserRepo();

// 2. USE-CASES LAYER
const healthService = new HealthService(db);
const userService = new UserService(userRepo);

// 3. INTERFACES LAYER
export const healthControllerImpl = new HealthController(healthService);
export const userControllerImpl = new UserController(userService);