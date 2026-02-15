import { authControllerImpl } from 'src/container.js';
import { asyncHandler } from '@shared/core/asyncHandler.js';
import { Router } from 'express';
import { validate } from '@shared/middlewares/validate.middleware.js';
import { 
  RegisterRequestSchema, 
  LoginRequestSchema, 
  TokenRequestSchema, 
  VerifyEmailRequestSchema, 
  EmailOnlyRequestSchema, 
  ResetPasswordRequestSchema 
} from '@modules/auth/presentation/auth.validator.js';

const authRouter = Router();

// Basic
authRouter.post('/auth/register', validate(RegisterRequestSchema), asyncHandler(authControllerImpl.register));
authRouter.post('/auth/login', validate(LoginRequestSchema), asyncHandler(authControllerImpl.login));
authRouter.post('/auth/refresh-token', validate(TokenRequestSchema), asyncHandler(authControllerImpl.refresh));
authRouter.post('/auth/logout', validate(TokenRequestSchema), asyncHandler(authControllerImpl.logout));

// Email & Password
authRouter.get('/auth/verify-email', validate(VerifyEmailRequestSchema), asyncHandler(authControllerImpl.verifyEmail));
authRouter.post('/auth/resend-verification', validate(EmailOnlyRequestSchema), asyncHandler(authControllerImpl.resendVerification));
authRouter.post('/auth/forgot-password', validate(EmailOnlyRequestSchema), asyncHandler(authControllerImpl.forgotPassword));
authRouter.post('/auth/reset-password', validate(ResetPasswordRequestSchema), asyncHandler(authControllerImpl.resetPassword));

export default authRouter;