// src/modules/auth/presentation/auth.routes.ts

import { authControllerImpl } from "@shared/container.js";
import { asyncHandler } from "@shared/core/asyncHandler.js";
import { Router } from "express";
import { validate } from "@shared/middlewares/validate.middleware.js";
import { 
  RegisterRequestSchema, 
} from "@modules/auth/presentation/auth.validator.js";

const authRouter = Router();

authRouter.post(
  '/auth/register', 
  validate(RegisterRequestSchema), 
  asyncHandler(authControllerImpl.register)
);


// authRouter.post(
//   '/login', 
//   validate(LoginRequestSchema), 
//   asyncHandler(authControllerImpl.login)
// );

export default authRouter;