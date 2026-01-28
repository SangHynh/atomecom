import express from 'express';
import { asyncHandler } from '../core/utils/asyncHandler.js';
import { healthController } from '../infra/container.js';
const healthRouter = express.Router();

healthRouter.get('/health', asyncHandler(healthController.getStatus));

export default healthRouter;
