import type { UserService } from '@modules/users/use-cases/user.service.js';
import { Created } from '@shared/core/success.response.js';
import type { Request, Response, NextFunction } from 'express';

export class UserController {
  constructor(private readonly userService: UserService) {}

  public create = async (req: Request, res: Response, _next: NextFunction) => {
    const result = await this.userService.create(req.body);
    return new Created({ data: result }).send(res);
  };
  
}
