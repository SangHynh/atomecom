import express from 'express';
import { asyncHandler } from '../../../shared/core/asyncHandler.js';
import { healthController } from '../../../shared/container.js';
const healthRouter = express.Router();

healthRouter.get('/health', asyncHandler(healthController.getStatus));

export default healthRouter;
