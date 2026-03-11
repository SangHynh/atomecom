import type { Response, NextFunction } from 'express';
import { ForbiddenError } from '@shared/core/error.response.js';
import type { AuthRequest } from '@shared/interfaces/AuthRequest.js';
import { USER_ROLE, ErrorRBACCodes } from '@atomecom/shared';

/**
 * Middleware to restrict access based on user roles.
 * @param allowedRoles Array of roles that are permitted to access the route.
 */
export const requireRole = (allowedRoles: USER_ROLE[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    try {
      const user = req.user;

      if (!user || !user.role) {
        throw new ForbiddenError(ErrorRBACCodes.ACCESS_DENIED_NO_ROLE);
      }

      const hasPermission = allowedRoles.includes(user.role as USER_ROLE);

      if (!hasPermission) {
        throw new ForbiddenError(
          ErrorRBACCodes.ACCESS_DENIED_INSUFFICIENT_PERMISSIONS,
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
