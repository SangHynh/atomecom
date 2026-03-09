import type { Request, Response, NextFunction } from 'express';
import type { InventoryService } from '../use-cases/inventory.service.js';
import { OK } from '@shared/core/success.response.js';
import { BadRequestError } from '@shared/core/error.response.js';

export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  public reserve = async (req: Request, res: Response, _next: NextFunction) => {
    const { skuId, quantity } = req.body;
    const success = await this.inventoryService.reserveProductStock(
      skuId,
      quantity,
    );
    if (!success) throw new BadRequestError('Insufficient stock');

    return new OK({
      message: 'Stock reserved successfully',
      data: { success },
    }).send(res);
  };

  public release = async (req: Request, res: Response, _next: NextFunction) => {
    const { skuId, quantity } = req.body;
    const success = await this.inventoryService.releaseProductStock(
      skuId,
      quantity,
    );
    if (!success) throw new BadRequestError('Failed to release stock');

    return new OK({
      message: 'Stock released successfully',
      data: { success },
    }).send(res);
  };

  public addStock = async (
    req: Request,
    res: Response,
    _next: NextFunction,
  ) => {
    const { skuId } = req.params as { skuId: string };
    const { amount } = req.body;
    await this.inventoryService.addStock(skuId, amount);
    return new OK({ message: 'Stock added successfully' }).send(res);
  };

  public findBySkuId = async (
    req: Request,
    res: Response,
    _next: NextFunction,
  ) => {
    const { skuId } = req.params as { skuId: string };
    const result = await this.inventoryService.findBySkuId(skuId);
    return new OK({ data: result }).send(res);
  };
}
