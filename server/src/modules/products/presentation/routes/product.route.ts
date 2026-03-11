import express from 'express';
import {
  productControllerImpl,
  authMiddlewareImpl,
} from '../../../../container.js';
import { validate } from '@shared/middlewares/validate.middleware.js';
import { requireRole } from '@shared/middlewares/role.middleware.js';
import {
  CreateProductRequestSchema,
  UpdateProductRequestSchema,
  USER_ROLE,
} from '@atomecom/shared';
import { asyncHandler } from '@shared/core/asyncHandler.js';

const router = express.Router();

// Public
router.get('/products', asyncHandler(productControllerImpl.findAll));
router.get('/products/:id', asyncHandler(productControllerImpl.findById));

// Admin
router.post(
  '/admin/products',
  authMiddlewareImpl,
  requireRole([USER_ROLE.ADMIN, USER_ROLE.OWNER]),
  validate(CreateProductRequestSchema),
  asyncHandler(productControllerImpl.create),
);
router.put(
  '/admin/products/:id',
  authMiddlewareImpl,
  requireRole([USER_ROLE.ADMIN, USER_ROLE.OWNER]),
  validate(UpdateProductRequestSchema),
  asyncHandler(productControllerImpl.update),
);
router.delete(
  '/admin/products/:id',
  authMiddlewareImpl,
  requireRole([USER_ROLE.ADMIN, USER_ROLE.OWNER]),
  asyncHandler(productControllerImpl.delete),
);

export default router;
