import express from 'express';
import {
  productControllerImpl,
  authMiddlewareImpl,
} from '../../../../container.js';
import { requireRole } from '@shared/middlewares/role.middleware.js';
import { USER_ROLE } from '@atomecom/shared';

const router = express.Router();

// Public
router.get('/products', productControllerImpl.findAll);
router.get('/products/:id', productControllerImpl.findById);

// Admin
router.post(
  '/admin/products',
  authMiddlewareImpl,
  productControllerImpl.create,
);
router.put(
  '/admin/products/:id',
  authMiddlewareImpl,
  productControllerImpl.update,
);
router.delete(
  '/admin/products/:id',
  authMiddlewareImpl,
  requireRole([USER_ROLE.ADMIN, USER_ROLE.OWNER]),
  productControllerImpl.delete,
);

export default router;
