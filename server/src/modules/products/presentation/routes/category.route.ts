import express from 'express';
import { USER_ROLE } from '@atomecom/shared';
import {
  categoryControllerImpl,
  authMiddlewareImpl,
} from '../../../../container.js';
import { requireRole } from '@shared/middlewares/role.middleware.js';

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
  categoryControllerImpl.create,
);

router.patch(
  '/admin/categories/:id',
  authMiddlewareImpl,
  requireRole([USER_ROLE.ADMIN, USER_ROLE.OWNER]),
  categoryControllerImpl.update,
);

router.patch(
  '/admin/categories/:id/move',
  authMiddlewareImpl,
  requireRole([USER_ROLE.ADMIN, USER_ROLE.OWNER]),
  categoryControllerImpl.move,
);

router.delete(
  '/admin/categories/:id',
  authMiddlewareImpl,
  requireRole([USER_ROLE.ADMIN, USER_ROLE.OWNER]),
  categoryControllerImpl.delete,
);

export default router;
