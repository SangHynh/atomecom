import express from 'express';
import {
  categoryControllerImpl,
  authMiddlewareImpl,
} from '../../../../container.js';
import { requireRole } from '@shared/middlewares/role.middleware.js';
import { validate } from '@shared/middlewares/validate.middleware.js';
import {
  CreateCategoryRequestSchema,
  UpdateCategoryRequestSchema,
  MoveCategoryRequestSchema,
  USER_ROLE,
} from '@atomecom/shared';

const router = express.Router();

// Public routes
router.get('/categories', categoryControllerImpl.findAll);
router.get('/categories/discovery', categoryControllerImpl.getDiscoveryTree);
router.get('/categories/path', categoryControllerImpl.findByPath);
router.get('/categories/ancestors', categoryControllerImpl.getAncestors);
router.get('/categories/:id', categoryControllerImpl.findById);

// Admin routes
router.post(
  '/admin/categories',
  authMiddlewareImpl,
  requireRole([USER_ROLE.ADMIN, USER_ROLE.OWNER]),
  validate(CreateCategoryRequestSchema),
  categoryControllerImpl.create,
);

router.patch(
  '/admin/categories/:id',
  authMiddlewareImpl,
  requireRole([USER_ROLE.ADMIN, USER_ROLE.OWNER]),
  validate(UpdateCategoryRequestSchema),
  categoryControllerImpl.update,
);

router.patch(
  '/admin/categories/:id/move',
  authMiddlewareImpl,
  requireRole([USER_ROLE.ADMIN, USER_ROLE.OWNER]),
  validate(MoveCategoryRequestSchema),
  categoryControllerImpl.move,
);

router.delete(
  '/admin/categories/:id',
  authMiddlewareImpl,
  requireRole([USER_ROLE.ADMIN, USER_ROLE.OWNER]),
  categoryControllerImpl.delete,
);

export default router;
