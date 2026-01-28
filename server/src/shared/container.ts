import { MongoDatabase } from '@monitoring/infra/mongoose.db.js';
import appConfig from '@config/app.config.js';
import HealthController from '@monitoring/interfaces/health.controller.js';
import HealthService from '@monitoring/use-cases/health.service.js';

// 1. Init DB
const db = new MongoDatabase(appConfig!.db.uri);

// 2. Init Services
const healthService = new HealthService(db);

// 3. Init Controllers
export const healthController = new HealthController(healthService);
