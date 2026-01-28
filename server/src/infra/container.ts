import { MongoDatabase } from './configs/mongoose.db.js';
import appConfig from '../configs/app.config.js';
import HealthService from '../services/health.service.js';
import HealthController from '../controllers/health.controller.js';

// 1. Init DB
const db = new MongoDatabase(appConfig!.db.uri);

// 2. Init Services
const healthService = new HealthService(db);

// 3. Init Controllers
export const healthController = new HealthController(healthService);