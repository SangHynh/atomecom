import type { SkuEntity } from '../entities/sku.entity.js';

export interface ISkuRepository {
  findAllByProductId(productId: string): Promise<SkuEntity[]>;
  findById(id: string): Promise<SkuEntity | null>;
  findBySkuCode(skuCode: string): Promise<SkuEntity | null>;
  create(sku: SkuEntity): Promise<SkuEntity>;
  update(id: string, data: Partial<SkuEntity>): Promise<SkuEntity | null>;
  delete(id: string, deletedAt?: Date): Promise<boolean>;
  /** Hard-deletes a record permanently. Use ONLY for compensating transaction rollback. */
  hardDelete(id: string): Promise<boolean>;
  deleteByProductId(productId: string, deletedAt?: Date): Promise<boolean>;
}
