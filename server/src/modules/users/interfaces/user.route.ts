import { userControllerImpl } from "@shared/container.js";
import { asyncHandler } from "@shared/core/asyncHandler.js";
import { Router } from "express";
import { validate } from "@shared/middlewares/validate.middleware.js";
import { CreateUserRequestSchema } from "@modules/users/interfaces/user.validator.js";

const userRouter = Router();

userRouter.get('/users', asyncHandler(userControllerImpl.findAll));
userRouter.post('/users',validate(CreateUserRequestSchema), asyncHandler(userControllerImpl.create));
userRouter.get('/users/:id', asyncHandler(userControllerImpl.findById));
userRouter.get('/users/email/:email', asyncHandler(userControllerImpl.findByEmail));
userRouter.get('/users/phone/:phone', asyncHandler(userControllerImpl.findByPhone));

export default userRouter;