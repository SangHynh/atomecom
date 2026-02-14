import { userControllerImpl } from 'src/container.js';
import { asyncHandler } from '@shared/core/asyncHandler.js';
import { Router } from 'express';
import { validate } from '@shared/middlewares/validate.middleware.js';
import {
  CreateUserRequestSchema,
  FindUserByEmailSchema,
  FindUserByIdSchema,
  FindUserByPhoneSchema,
} from '@modules/users/presentation/user.validator.js';

const userRouter = Router();

userRouter.get(
  '/users',
  // TODO: Validate schema
  asyncHandler(userControllerImpl.findAll),
);
userRouter.post(
  '/users',
  validate(CreateUserRequestSchema),
  asyncHandler(userControllerImpl.create),
);
userRouter.get(
  '/users/:id',
  validate(FindUserByIdSchema),
  asyncHandler(userControllerImpl.findById),
);
userRouter.get(
  '/users/email/:email',
  validate(FindUserByEmailSchema),
  asyncHandler(userControllerImpl.findByEmail),
);
userRouter.get(
  '/users/phone/:phone',
  validate(FindUserByPhoneSchema),
  asyncHandler(userControllerImpl.findByPhone),
);

export default userRouter;
