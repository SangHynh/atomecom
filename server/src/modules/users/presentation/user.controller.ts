import type { UserService } from '@modules/users/use-cases/user.service.js';
import { BadRequestError } from '@shared/core/error.response.js';
import { Created, OK } from '@shared/core/success.response.js';
import type { Request, Response, NextFunction } from 'express';

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
    const { id } = req.params;
    if (typeof id !== 'string') {
      throw new BadRequestError('INVALID_USER_ID');
    }
    const result = await this.userService.findById(id);
    return new OK({ data: result }).send(res);
  };

  public findByEmail = async (
    req: Request,
    res: Response,
    _next: NextFunction,
  ) => {
    const email = req.params.email as string;
    const result = await this.userService.findByEmail(email);
    return new OK({ data: result }).send(res);
  };

  public findByPhone = async (
    req: Request,
    res: Response,
    _next: NextFunction,
  ) => {
    const phone = req.params.phone as string;
    const result = await this.userService.findByPhone(phone);
    return new OK({ data: result }).send(res);
  };

  public create = async (req: Request, res: Response, _next: NextFunction) => {
    const result = await this.userService.create(req.body);
    return new Created({ data: result }).send(res);
  };
}
