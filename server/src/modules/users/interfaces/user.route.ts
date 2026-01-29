import { userControllerImpl } from "@shared/container.js";
import { asyncHandler } from "@shared/core/asyncHandler.js";
import { Router } from "express";
import { 
  CreateUserRequestSchema, 
  UpdateUserRequestSchema 
} from "./user.dto.js";
import { validate } from "@shared/middlewares/validate.middleware.js";


const userRouter = Router();

userRouter.post('/users',validate(CreateUserRequestSchema), asyncHandler(userControllerImpl.create));

export default userRouter;