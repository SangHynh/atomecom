import type { PRODUCT_STATUS } from '@shared/enum/productStatus.enum.js';
import type { ProductEntity } from '../entities/product.entity.js';

export interface IProductRepository {
  findAll(params: {
    categoryId?: string;
    brandId?: string;
    status?: PRODUCT_STATUS;
    keyword?: string;
    minRating?: number;
    sortField?: string;
    sortOrder?: 'asc' | 'desc';
    offset: number;
    limit: number;
  }): Promise<{
    data: ProductEntity[];
    totalElements: number;
  }>;

  findById(id: string): Promise<ProductEntity | null>;
  findBySlug(slug: string): Promise<ProductEntity | null>;
  create(product: ProductEntity): Promise<ProductEntity>;
  update(
    id: string,
    data: Partial<ProductEntity>,
  ): Promise<ProductEntity | null>;
  delete(id: string, deletedAt?: Date): Promise<boolean>;
  /** Hard-deletes a record permanently. Use ONLY for compensating transaction rollback. */
  hardDelete(id: string): Promise<boolean>;
  countByCategoryId(categoryId: string): Promise<number>;
  countByBrandId(brandId: string): Promise<number>;
}
