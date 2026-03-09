import type { CategoryEntity } from '../entities/category.entity.js';

export interface ICategoryRepository {
  findAll(params: {
    keyword?: string;
    path?: string | null;
    level?: number;
    offset: number;
    limit: number;
    sortField?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ data: CategoryEntity[]; totalElements: number }>;
  findById(id: string): Promise<CategoryEntity | null>;
  findByIds(ids: string[]): Promise<CategoryEntity[]>;
  findBySlug(slug: string): Promise<CategoryEntity | null>;
  findByPath(path: string): Promise<CategoryEntity | null>;
  findAllDescendants(pathPrefix: string): Promise<CategoryEntity[]>;
  create(category: CategoryEntity): Promise<CategoryEntity>;
  update(
    id: string,
    data: Partial<CategoryEntity>,
  ): Promise<CategoryEntity | null>;
  updateSubtreePath(oldPath: string, newPathPrefix: string): Promise<void>;
  delete(id: string, deletedAt?: Date): Promise<boolean>;
}
