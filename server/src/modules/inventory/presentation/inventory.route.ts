import { Router } from 'express';
import { asyncHandler } from '@shared/core/asyncHandler.js';
import {
  inventoryControllerImpl,
  authMiddlewareImpl,
} from '../../../container.js';
import { validate } from '@shared/middlewares/validate.middleware.js';
import { requireRole } from '@shared/middlewares/role.middleware.js';
import {
  ReserveInventoryRequestSchema,
  ReleaseInventoryRequestSchema,
  AddStockRequestSchema,
  USER_ROLE,
} from '@atomecom/shared';

const inventoryRouter = Router();

// Most inventory routes should require admin or system permissions
inventoryRouter.post(
  '/inventory/reserve',
  authMiddlewareImpl,
  requireRole([USER_ROLE.ADMIN, USER_ROLE.OWNER, USER_ROLE.STAFF]),
  validate(ReserveInventoryRequestSchema),
  asyncHandler(inventoryControllerImpl.reserve),
);

inventoryRouter.post(
  '/inventory/release',
  authMiddlewareImpl,
  requireRole([USER_ROLE.ADMIN, USER_ROLE.OWNER, USER_ROLE.STAFF]),
  validate(ReleaseInventoryRequestSchema),
  asyncHandler(inventoryControllerImpl.release),
);

inventoryRouter.patch(
  '/inventory/:skuId/add',
  authMiddlewareImpl,
  requireRole([USER_ROLE.ADMIN, USER_ROLE.OWNER]),
  validate(AddStockRequestSchema),
  asyncHandler(inventoryControllerImpl.addStock),
);

// Get inventory details by SKUID
inventoryRouter.get(
  '/inventory/:skuId',
  asyncHandler(inventoryControllerImpl.findBySkuId),
);

export default inventoryRouter;
