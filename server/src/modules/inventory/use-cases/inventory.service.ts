import type { InventoryEntity } from '../domain/entities/inventory.entity.js';
import type { IInventoryRepository } from '../domain/repositories/inventory.repo.js';
import type { ICacheRepo } from '@shared/interfaces/ICache.repo.js';
import { ConflictError, NotFoundError, BadRequestError } from '@shared/core/error.response.js';

const LOCK_TTL_MS = 5000;
const LOCK_TIMEOUT_MS = 3000;

interface InventoryServiceDependencies {
  inventoryRepo: IInventoryRepository;
  cacheRepo: ICacheRepo;
}

export class InventoryService {
  private readonly _inventoryRepo: IInventoryRepository;
  private readonly _cacheRepo: ICacheRepo;

  constructor({ inventoryRepo, cacheRepo }: InventoryServiceDependencies) {
    this._inventoryRepo = inventoryRepo;
    this._cacheRepo = cacheRepo;
  }

  /**
   * Reserve product stock using a distributed lock to ensure atomicity
   */
  public async reserveProductStock(
    skuId: string,
    quantity: number,
  ): Promise<boolean> {
    const lockKey = `inventory:reserve:${skuId}`;

    // 1. Acquire Lock (Wait up to 3s, expire in 5s)
    const acquired = await this._cacheRepo.waitAndAcquire(
      lockKey,
      LOCK_TTL_MS,
      LOCK_TIMEOUT_MS,
    );
    if (!acquired) {
      throw new ConflictError(
        'System is busy processing inventory for this product, please try again later.',
      );
    }

    try {
      // 2. Perform atomic reservation in database
      const success = await this._inventoryRepo.reserveStock(skuId, quantity);
      if (!success) {
        throw new BadRequestError(
          'Insufficient stock or reservation failed for this product.',
        );
      }
      return true;
    } finally {
      // 3. Release Lock
      await this._cacheRepo.releaseLock(lockKey);
    }
  }

  /**
   * Release previously reserved stock (e.g., when checkout is cancelled)
   */
  public async releaseProductStock(
    skuId: string,
    quantity: number,
  ): Promise<boolean> {
    const success = await this._inventoryRepo.releaseStock(skuId, quantity);
    if (!success) {
      throw new BadRequestError(
        'Failed to release stock. Check if reserved quantity is sufficient.',
      );
    }
    return true;
  }

  /**
   * Confirm sold stock (e.g., after successful payment)
   */
  public async confirmProductStock(
    skuId: string,
    quantity: number,
  ): Promise<boolean> {
    const success = await this._inventoryRepo.confirmStock(skuId, quantity);
    if (!success) {
      throw new BadRequestError(
        'Failed to confirm stock. Check if reserved and total quantity are sufficient.',
      );
    }
    return true;
  }

  /**
   * Manually update stock (e.g., admin restocking)
   */
  public async addStock(skuId: string, amount: number): Promise<void> {
    if (amount <= 0) {
      throw new BadRequestError('Amount to add must be greater than zero.');
    }

    const inventory = await this._inventoryRepo.findBySkuId(skuId);
    if (!inventory) throw new NotFoundError('Inventory not found');

    await this._inventoryRepo.updateStock(skuId, amount, 0);
  }

  /**
   * Create a new inventory record for an SKU
   */
  public async create(inventory: InventoryEntity): Promise<InventoryEntity> {
    return this._inventoryRepo.create(inventory);
  }

  /**
   * Soft delete inventory record
   */
  public async delete(skuId: string, deletedAt?: Date): Promise<boolean> {
    const inventory = await this._inventoryRepo.findBySkuId(skuId);
    if (!inventory) throw new NotFoundError('Inventory not found');

    const now = deletedAt || new Date();
    return this._inventoryRepo.delete(skuId, now);
  }

  /**
   * Find inventory information by SKU ID
   */
  public async findBySkuId(skuId: string): Promise<InventoryEntity | null> {
    return this._inventoryRepo.findBySkuId(skuId);
  }
}
