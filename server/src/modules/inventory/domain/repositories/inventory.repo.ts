import type { InventoryEntity } from '../entities/inventory.entity.js';

export interface IInventoryRepository {
  findBySkuId(skuId: string): Promise<InventoryEntity | null>;
  updateStock(
    skuId: string,
    quantityDelta: number,
    reservedDelta: number,
  ): Promise<InventoryEntity | null>;
  reserveStock(skuId: string, quantity: number): Promise<boolean>;
  releaseStock(skuId: string, quantity: number): Promise<boolean>;
  confirmStock(skuId: string, quantity: number): Promise<boolean>;
  create(inventory: InventoryEntity): Promise<InventoryEntity>;
  delete(skuId: string, deletedAt?: Date): Promise<boolean>;
}
