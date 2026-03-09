import { Router } from 'express';
import { asyncHandler } from '@shared/core/asyncHandler.js';
import {
  inventoryControllerImpl,
  authMiddlewareImpl,
} from '../../../container.js';
import { requireRole } from '@shared/middlewares/role.middleware.js';
import { USER_ROLE } from '@atomecom/shared';

const inventoryRouter = Router();

// Most inventory routes should require admin or system permissions
inventoryRouter.post(
  '/inventory/reserve',
  authMiddlewareImpl,
  asyncHandler(inventoryControllerImpl.reserve),
);

inventoryRouter.post(
  '/inventory/release',
  authMiddlewareImpl,
  asyncHandler(inventoryControllerImpl.release),
);

inventoryRouter.patch(
  '/inventory/:skuId/add',
  authMiddlewareImpl,
  requireRole([USER_ROLE.ADMIN, USER_ROLE.OWNER]),
  asyncHandler(inventoryControllerImpl.addStock),
);

// Get inventory details by SKUID
inventoryRouter.get(
  '/inventory/:skuId',
  asyncHandler(inventoryControllerImpl.findBySkuId),
);

export default inventoryRouter;
