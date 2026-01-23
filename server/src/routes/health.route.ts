import express from 'express';
import { asyncHandler } from '../core/asyncHandler.js';
import HealthService from '../services/health.service.js';
import HealthController from '../controllers/health.controller.js';
import { MongoDatabase } from '../infra/mongoose.db.js';
import appConfig from '../configs/app.config.js';

const db = new MongoDatabase(appConfig!.db.uri);
const healthRouter = express.Router();
const healthService = new HealthService(db);
const healthController = new HealthController(healthService);


healthRouter.get('/health', asyncHandler(healthController.getStatus));

export default healthRouter;