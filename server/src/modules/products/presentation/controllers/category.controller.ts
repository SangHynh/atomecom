import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '@shared/interfaces/AuthRequest.js';
import type { CategoryQueryDTO } from '../../use-cases/dtos/category.dtos.js';
import type { CategoryService } from '../../use-cases/services/category.service.js';
import type {
  CreateCategoryDTO,
  UpdateCategoryDTO,
  MoveCategoryDTO,
} from '../../use-cases/dtos/category.dtos.js';
import { OK, Created } from '@shared/core/success.response.js';

export class CategoryController {
  constructor(private readonly _categoryService: CategoryService) {}

  public create = async (
    req: AuthRequest,
    res: Response,
    _next: NextFunction,
  ) => {
    const dto = req.body as CreateCategoryDTO;
    const result = await this._categoryService.create(dto);
    return new Created({
      message: 'Category created successfully',
      data: result,
    }).send(res);
  };

  public findAll = async (
    req: AuthRequest,
    res: Response,
    _next: NextFunction,
  ) => {
    const query = req.query as unknown as CategoryQueryDTO;
    const result = await this._categoryService.findAll(query);
    return OK.withPagination(res, result);
  };

  public getDiscoveryTree = async (
    _req: AuthRequest,
    res: Response,
    _next: NextFunction,
  ) => {
    const result = await this._categoryService.getDiscoveryTree();
    return new OK({ data: result }).send(res);
  };

  public getAncestors = async (
    req: AuthRequest,
    res: Response,
    _next: NextFunction,
  ) => {
    const { path } = req.query as { path: string };
    const result = await this._categoryService.getAncestors(path);
    return new OK({ data: result }).send(res);
  };

  public findById = async (
    req: AuthRequest,
    res: Response,
    _next: NextFunction,
  ) => {
    const { id } = req.params as { id: string };
    const result = await this._categoryService.findById(id);
    return new OK({ data: result }).send(res);
  };

  public findByPath = async (
    req: AuthRequest,
    res: Response,
    _next: NextFunction,
  ) => {
    const { path } = req.query as { path: string };
    const result = await this._categoryService.findByPath(path);
    return new OK({ data: result }).send(res);
  };

  public update = async (
    req: AuthRequest,
    res: Response,
    _next: NextFunction,
  ) => {
    const { id } = req.params as { id: string };
    const dto = req.body as UpdateCategoryDTO;
    const result = await this._categoryService.update(id, dto);
    return new OK({
      message: 'Category updated successfully',
      data: result,
    }).send(res);
  };

  public move = async (
    req: AuthRequest,
    res: Response,
    _next: NextFunction,
  ) => {
    const { id } = req.params as { id: string };
    const dto = req.body as MoveCategoryDTO;
    const result = await this._categoryService.move(id, dto);
    return new OK({
      message: 'Category moved successfully',
      data: result,
    }).send(res);
  };

  public delete = async (
    req: AuthRequest,
    res: Response,
    _next: NextFunction,
  ) => {
    const { id } = req.params as { id: string };
    await this._categoryService.delete(id);
    return new OK({ message: 'Category deleted successfully' }).send(res);
  };
}
