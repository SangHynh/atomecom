import type { Request, Response, NextFunction } from 'express';
import type { ProductService } from '../../use-cases/services/product.service.js';
import type { ProductQueryDTO } from '../../use-cases/dtos/product.dtos.js';
import { OK, Created } from '@shared/core/success.response.js';

export class ProductController {
  constructor(private readonly productService: ProductService) {}

  public create = async (req: Request, res: Response, _next: NextFunction) => {
    const result = await this.productService.createProduct(req.body);
    return new Created({
      message: 'Product created successfully',
      data: result,
    }).send(res);
  };

  public findAll = async (req: Request, res: Response, _next: NextFunction) => {
    const query = req.query as unknown as ProductQueryDTO;
    const result = await this.productService.findAll(query);
    return OK.withPagination(res, result);
  };

  public findById = async (
    req: Request,
    res: Response,
    _next: NextFunction,
  ) => {
    const { id } = req.params as { id: string };
    const result = await this.productService.findById(id);
    return new OK({ data: result }).send(res);
  };

  public update = async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params as { id: string };
    const result = await this.productService.updateProduct(id, req.body);
    return new OK({
      message: 'Product updated successfully',
      data: result,
    }).send(res);
  };

  public delete = async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params as { id: string };
    await this.productService.deleteProduct(id);
    return new OK({ message: 'Product deleted successfully' }).send(res);
  };
}
