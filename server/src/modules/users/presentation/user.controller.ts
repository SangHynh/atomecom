import type { UserService } from '@modules/users/use-cases/user.service.js';
import { Created, OK } from '@shared/core/success.response.js';
import type { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '@shared/core/error.response.js';
import { USER_ROLE, ErrorRBACCodes } from '@atomecom/shared';

export class UserController {
  constructor(private readonly userService: UserService) {}

  public findAll = async (req: Request, res: Response, _next: NextFunction) => {
    const result = await this.userService.findAll(req.query);
    return OK.withPagination(res, result);
  };

  public findById = async (
    req: Request,
    res: Response,
    _next: NextFunction,
  ) => {
    const { id } = req.params as { id: string };
    const result = await this.userService.findById(id);
    return new OK({ data: result }).send(res);
  };

  public findByEmail = async (
    req: Request,
    res: Response,
    _next: NextFunction,
  ) => {
    const { email } = req.params as { email: string };
    const result = await this.userService.findByEmail(email);
    return new OK({ data: result }).send(res);
  };

  public findByPhone = async (
    req: Request,
    res: Response,
    _next: NextFunction,
  ) => {
    const { phone } = req.params as { phone: string };
    const result = await this.userService.findByPhone(phone);
    return new OK({ data: result }).send(res);
  };

  public create = async (req: Request, res: Response, _next: NextFunction) => {
    const currentUser = (req as any).user;
    const targetRole = req.body.role;

    // 1. Prevent creation of SUPER_ADMIN via API
    if (targetRole === USER_ROLE.SUPER_ADMIN) {
      throw new ForbiddenError(ErrorRBACCodes.CANNOT_CREATE_SUPER_ADMIN_VIA_API);
    }

    // 2. Hierarchy Check (Only SUPER_ADMIN can create ADMINs)
    if (targetRole === USER_ROLE.ADMIN && currentUser?.role !== USER_ROLE.SUPER_ADMIN) {
      throw new ForbiddenError(ErrorRBACCodes.ONLY_SUPER_ADMIN_CAN_CREATE_ADMINS);
    }

    const result = await this.userService.create(req.body);
    return new Created({ data: result }).send(res);
  };
}
