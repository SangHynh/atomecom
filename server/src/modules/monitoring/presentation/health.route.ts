import express from 'express';
import { asyncHandler } from '@shared/core/asyncHandler.js';
import { healthControllerImpl } from 'src/container.js';
const healthRouter = express.Router();

healthRouter.get('/health', asyncHandler(healthControllerImpl.getStatus));

export default healthRouter;
