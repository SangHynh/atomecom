import { authMiddlewareImpl, userControllerImpl } from 'src/container.js';
import { asyncHandler } from '@shared/core/asyncHandler.js';
import { Router } from 'express';
import { validate } from '@shared/middlewares/validate.middleware.js';
import { requireRole } from '@shared/middlewares/role.middleware.js';
import {
  CreateUserRequestSchema,
  FindUserByEmailSchema,
  FindUserByIdSchema,
  FindUserByPhoneSchema,
  USER_ROLE,
} from '@atomecom/shared';

const userRouter = Router();

userRouter.get(
  '/users',
  authMiddlewareImpl,
  requireRole([USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN]),
  asyncHandler(userControllerImpl.findAll),
);
userRouter.post(
  '/users',
  authMiddlewareImpl,
  requireRole([USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN]),
  validate(CreateUserRequestSchema),
  asyncHandler(userControllerImpl.create),
);
userRouter.get(
  '/users/:id',
  authMiddlewareImpl,
  requireRole([USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN]),
  validate(FindUserByIdSchema),
  asyncHandler(userControllerImpl.findById),
);
userRouter.get(
  '/users/email/:email',
  authMiddlewareImpl,
  requireRole([USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN]),
  validate(FindUserByEmailSchema),
  asyncHandler(userControllerImpl.findByEmail),
);
userRouter.get(
  '/users/phone/:phone',
  authMiddlewareImpl,
  requireRole([USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN]),
  validate(FindUserByPhoneSchema),
  asyncHandler(userControllerImpl.findByPhone),
);

export default userRouter;
