import { userControllerImpl } from "@shared/container.js";
import { asyncHandler } from "@shared/core/asyncHandler.js";
import { Router } from "express";
import { validate } from "@shared/middlewares/validate.middleware.js";
import { CreateUserRequestSchema } from "@modules/users/interfaces/user.validator.js";

const userRouter = Router();

userRouter.get('/users', asyncHandler(userControllerImpl.findAll));
userRouter.post('/users',validate(CreateUserRequestSchema), asyncHandler(userControllerImpl.create));

export default userRouter;