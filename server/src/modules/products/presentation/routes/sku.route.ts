import express from 'express';
import {
  skuControllerImpl,
  authMiddlewareImpl,
} from '../../../../container.js';
import { validate } from '@shared/middlewares/validate.middleware.js';
import { requireRole } from '@shared/middlewares/role.middleware.js';
import {
  UpdateSkuRequestSchema,
  UpdateSkuPriceRequestSchema,
  USER_ROLE,
} from '@atomecom/shared';

const router = express.Router();

// Public
router.get('/skus/:id', skuControllerImpl.findById);
router.get('/products/:productId/skus', skuControllerImpl.findByProductId);

// Admin
router.put(
  '/admin/skus/:id',
  authMiddlewareImpl,
  requireRole([USER_ROLE.ADMIN, USER_ROLE.OWNER]),
  validate(UpdateSkuRequestSchema),
  skuControllerImpl.update,
);

router.patch(
  '/admin/skus/:id/price',
  authMiddlewareImpl,
  requireRole([USER_ROLE.ADMIN, USER_ROLE.OWNER]),
  validate(UpdateSkuPriceRequestSchema),
  skuControllerImpl.updatePrice,
);

router.delete(
  '/admin/skus/:id',
  authMiddlewareImpl,
  requireRole([USER_ROLE.ADMIN, USER_ROLE.OWNER]),
  skuControllerImpl.delete,
);

export default router;
