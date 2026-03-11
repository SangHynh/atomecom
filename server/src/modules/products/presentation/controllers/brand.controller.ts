import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '@shared/interfaces/AuthRequest.js';
import type { BrandQueryDTO } from '../../use-cases/dtos/brand.dtos.js';
import type { BrandService } from '../../use-cases/services/brand.service.js';
import type {
  CreateBrandDTO,
  UpdateBrandDTO,
} from '../../use-cases/dtos/brand.dtos.js';
import { OK, Created } from '@shared/core/success.response.js';

export class BrandController {
  constructor(private readonly _brandService: BrandService) {}

  public create = async (
    req: AuthRequest,
    res: Response,
    _next: NextFunction,
  ) => {
    const dto = req.body as CreateBrandDTO;
    const result = await this._brandService.create(dto);
    return new Created({
      message: 'Brand created successfully',
      data: result,
    }).send(res);
  };

  public findAll = async (
    req: AuthRequest,
    res: Response,
    _next: NextFunction,
  ) => {
    const query = req.query as unknown as BrandQueryDTO;
    const result = await this._brandService.findAll(query);
    return OK.withPagination(res, result);
  };

  public findById = async (
    req: AuthRequest,
    res: Response,
    _next: NextFunction,
  ) => {
    const { id } = req.params as { id: string };
    const result = await this._brandService.findById(id);
    return new OK({ data: result }).send(res);
  };

  public update = async (
    req: AuthRequest,
    res: Response,
    _next: NextFunction,
  ) => {
    const { id } = req.params as { id: string };
    const dto = req.body as UpdateBrandDTO;
    const result = await this._brandService.update(id, dto);
    return new OK({
      message: 'Brand updated successfully',
      data: result,
    }).send(res);
  };

  public delete = async (
    req: AuthRequest,
    res: Response,
    _next: NextFunction,
  ) => {
    const { id } = req.params as { id: string };
    await this._brandService.delete(id);
    return new OK({ message: 'Brand deleted successfully' }).send(res);
  };
}
