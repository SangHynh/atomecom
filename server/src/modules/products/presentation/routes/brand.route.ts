import express from 'express';
import {
  brandControllerImpl,
  authMiddlewareImpl,
} from '../../../../container.js';
import { requireRole } from '@shared/middlewares/role.middleware.js';
import { validate } from '@shared/middlewares/validate.middleware.js';
import {
  CreateBrandRequestSchema,
  UpdateBrandRequestSchema,
  USER_ROLE,
} from '@atomecom/shared';

const router = express.Router();

// Public routes
router.get('/brands', brandControllerImpl.findAll);
router.get('/brands/:id', brandControllerImpl.findById);

// Admin routes
router.post(
  '/admin/brands',
  authMiddlewareImpl,
  requireRole([USER_ROLE.ADMIN, USER_ROLE.OWNER]),
  validate(CreateBrandRequestSchema),
  brandControllerImpl.create,
);

router.put(
  '/admin/brands/:id',
  authMiddlewareImpl,
  requireRole([USER_ROLE.ADMIN, USER_ROLE.OWNER]),
  validate(UpdateBrandRequestSchema),
  brandControllerImpl.update,
);

router.delete(
  '/admin/brands/:id',
  authMiddlewareImpl,
  requireRole([USER_ROLE.ADMIN, USER_ROLE.OWNER]),
  brandControllerImpl.delete,
);

export default router;
