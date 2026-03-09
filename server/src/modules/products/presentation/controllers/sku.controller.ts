import type { Request, Response, NextFunction } from 'express';
import type { SkuService } from '../../use-cases/services/sku.service.js';
import type {
  UpdateSkuDTO,
  UpdateSkuPriceDTO,
} from '../../use-cases/dtos/sku.dtos.js';
import { OK } from '@shared/core/success.response.js';

export class SkuController {
  constructor(private readonly _skuService: SkuService) {}

  public findById = async (
    req: Request,
    res: Response,
    _next: NextFunction,
  ) => {
    const { id } = req.params as { id: string };
    const result = await this._skuService.findById(id);
    return new OK({ data: result }).send(res);
  };

  public findByProductId = async (
    req: Request,
    res: Response,
    _next: NextFunction,
  ) => {
    const { productId } = req.params as { productId: string };
    const result = await this._skuService.findAllByProductId(productId);
    return new OK({ data: result }).send(res);
  };

  public update = async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params as { id: string };
    const dto = req.body as UpdateSkuDTO;
    const result = await this._skuService.update(id, dto);
    return new OK({
      message: 'SKU updated successfully',
      data: result,
    }).send(res);
  };

  public updatePrice = async (
    req: Request,
    res: Response,
    _next: NextFunction,
  ) => {
    const { id } = req.params as { id: string };
    const dto = req.body as UpdateSkuPriceDTO;
    const result = await this._skuService.updatePrice(id, dto);
    return new OK({
      message: 'SKU price updated successfully',
      data: result,
    }).send(res);
  };

  public delete = async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params as { id: string };
    await this._skuService.delete(id);
    return new OK({ message: 'SKU deleted successfully' }).send(res);
  };
}
