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
  UpdateProfileRequestSchema,
  UpdateUserRequestSchema, // Added this
  ChangePasswordRequestSchema,
  ChangeEmailRequestSchema,
  ChangePhoneRequestSchema,
  USER_ROLE,
} from '@atomecom/shared';

const userRouter = Router();

userRouter.get(
  '/users',
  authMiddlewareImpl,
  requireRole([USER_ROLE.ADMIN, USER_ROLE.OWNER]),
  asyncHandler(userControllerImpl.findAll),
);
userRouter.get(
  '/users/stats',
  authMiddlewareImpl,
  requireRole([USER_ROLE.ADMIN, USER_ROLE.OWNER]),
  asyncHandler(userControllerImpl.getStats),
);
userRouter.post(
  '/users',
  authMiddlewareImpl,
  requireRole([USER_ROLE.ADMIN, USER_ROLE.OWNER]),
  validate(CreateUserRequestSchema),
  asyncHandler(userControllerImpl.create),
);
userRouter.get(
  '/users/:id',
  authMiddlewareImpl,
  requireRole([USER_ROLE.ADMIN, USER_ROLE.OWNER]),
  validate(FindUserByIdSchema),
  asyncHandler(userControllerImpl.findById),
);
userRouter.patch(
  '/users/:id',
  authMiddlewareImpl,
  requireRole([USER_ROLE.ADMIN, USER_ROLE.OWNER]),
  validate(UpdateUserRequestSchema),
  asyncHandler(userControllerImpl.update),
);
userRouter.get(
  '/users/email/:email',
  authMiddlewareImpl,
  requireRole([USER_ROLE.ADMIN, USER_ROLE.OWNER]),
  validate(FindUserByEmailSchema),
  asyncHandler(userControllerImpl.findByEmail),
);
userRouter.get(
  '/users/phone/:phone',
  authMiddlewareImpl,
  requireRole([USER_ROLE.ADMIN, USER_ROLE.OWNER]),
  validate(FindUserByPhoneSchema),
  asyncHandler(userControllerImpl.findByPhone),
);
userRouter.delete(
  '/users/:id',
  authMiddlewareImpl,
  requireRole([USER_ROLE.ADMIN, USER_ROLE.OWNER]),
  validate(FindUserByIdSchema),
  asyncHandler(userControllerImpl.delete),
);

// --- Profile Management ---

userRouter.get(
  '/users/me',
  authMiddlewareImpl,
  asyncHandler(userControllerImpl.getMe),
);

userRouter.patch(
  '/users/me/profile',
  authMiddlewareImpl,
  validate(UpdateProfileRequestSchema),
  asyncHandler(userControllerImpl.updateMe),
);

// --- Admin Profile Management (Targeted) ---

userRouter.patch(
  '/users/:id/change-password',
  authMiddlewareImpl,
  requireRole([USER_ROLE.ADMIN, USER_ROLE.OWNER]),
  validate(ChangePasswordRequestSchema),
  asyncHandler(userControllerImpl.changePassword),
);

userRouter.patch(
  '/users/:id/change-email',
  authMiddlewareImpl,
  requireRole([USER_ROLE.ADMIN, USER_ROLE.OWNER]),
  validate(ChangeEmailRequestSchema),
  asyncHandler(userControllerImpl.changeEmail),
);

userRouter.patch(
  '/users/:id/change-phone',
  authMiddlewareImpl,
  requireRole([USER_ROLE.ADMIN, USER_ROLE.OWNER]),
  validate(ChangePhoneRequestSchema),
  asyncHandler(userControllerImpl.changePhone),
);

export default userRouter;
