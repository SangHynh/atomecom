// src/modules/auth/presentation/auth.routes.ts

import { authControllerImpl } from 'src/container.js';
import { asyncHandler } from '@shared/core/asyncHandler.js';
import { Router } from 'express';
import { validate } from '@shared/middlewares/validate.middleware.js';
import { RegisterRequestSchema } from '@modules/auth/presentation/auth.validator.js';

const authRouter = Router();

authRouter.post(
  '/auth/register',
  validate(RegisterRequestSchema),
  asyncHandler(authControllerImpl.register),
);

authRouter.post(
  '/auth/login',
  // validate(LoginRequestSchema),
  asyncHandler(authControllerImpl.login),
);

authRouter.post('/auth/refresh-token', authControllerImpl.refresh);
authRouter.post('/auth/logout', authControllerImpl.logout);

export default authRouter;
