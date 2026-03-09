import express from 'express';
import { USER_ROLE } from '@atomecom/shared';
import {
  brandControllerImpl,
  authMiddlewareImpl,
} from '../../../../container.js';
import { requireRole } from '@shared/middlewares/role.middleware.js';

const router = express.Router();

// Public routes
router.get('/brands', brandControllerImpl.findAll);
router.get('/brands/:id', brandControllerImpl.findById);

// Admin routes
router.post(
  '/admin/brands',
  authMiddlewareImpl,
  requireRole([USER_ROLE.ADMIN, USER_ROLE.OWNER]),
  brandControllerImpl.create,
);

router.put(
  '/admin/brands/:id',
  authMiddlewareImpl,
  requireRole([USER_ROLE.ADMIN, USER_ROLE.OWNER]),
  brandControllerImpl.update,
);

router.delete(
  '/admin/brands/:id',
  authMiddlewareImpl,
  requireRole([USER_ROLE.ADMIN, USER_ROLE.OWNER]),
  brandControllerImpl.delete,
);

export default router;
