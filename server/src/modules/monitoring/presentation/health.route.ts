import express from 'express';
import { asyncHandler } from '@shared/core/asyncHandler.js';
import { healthControllerImpl } from '@shared/container.js';
const healthRouter = express.Router();

healthRouter.get('/health', asyncHandler(healthControllerImpl.getStatus));

export default healthRouter;
