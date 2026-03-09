import type { BrandEntity } from '../entities/brand.entity.js';

export interface IBrandRepository {
  findAll(params: {
    keyword?: string;
    offset: number;
    limit: number;
    sortField?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ data: BrandEntity[]; totalElements: number }>;
  findById(id: string): Promise<BrandEntity | null>;
  findBySlug(slug: string): Promise<BrandEntity | null>;
  create(brand: BrandEntity): Promise<BrandEntity>;
  update(id: string, data: Partial<BrandEntity>): Promise<BrandEntity | null>;
  delete(id: string, deletedAt?: Date): Promise<boolean>;
}
