import type { ISkuRepository } from '../../domain/repositories/sku.repo.js';
import type { SkuEntity } from '../../domain/entities/sku.entity.js';
import { NotFoundError, ConflictError } from '@shared/core/error.response.js';
import type {
  CreateSkuDTO,
  UpdateSkuDTO,
  UpdateSkuPriceDTO,
} from '../dtos/sku.dtos.js';

interface SkuServiceDependencies {
  skuRepo: ISkuRepository;
}

export class SkuService {
  private readonly _skuRepo: ISkuRepository;

  constructor({ skuRepo }: SkuServiceDependencies) {
    this._skuRepo = skuRepo;
  }

  public async findAllByProductId(productId: string): Promise<SkuEntity[]> {
    return this._skuRepo.findAllByProductId(productId);
  }

  public async findById(id: string): Promise<SkuEntity | null> {
    return this._skuRepo.findById(id);
  }

  public async findBySkuCode(skuCode: string): Promise<SkuEntity | null> {
    return this._skuRepo.findBySkuCode(skuCode);
  }

  /**
   * Create a new SKU (variants) for a product
   */
  public async create(sku: SkuEntity): Promise<SkuEntity> {
    return this._skuRepo.create(sku);
  }

  /**
   * Update SKU basic information and ensure code uniqueness
   */
  public async update(
    id: string,
    dto: UpdateSkuDTO,
  ): Promise<SkuEntity | null> {
    const sku = await this._skuRepo.findById(id);
    if (!sku) throw new NotFoundError('SKU not found');

    if (dto.skuCode && dto.skuCode !== sku.skuCode) {
      await this._ensureSkuCodeIsUnique(dto.skuCode);
    }

    return this._skuRepo.update(id, dto);
  }

  /**
   * Update SKU price with a mandatory reason and log to history
   */
  public async updatePrice(
    id: string,
    dto: UpdateSkuPriceDTO,
  ): Promise<SkuEntity | null> {
    const sku = await this._skuRepo.findById(id);
    if (!sku) throw new NotFoundError('SKU not found');

    const historyEntry = this._createPriceHistoryEntry(dto);

    return this._skuRepo.update(id, {
      price: {
        basePrice: dto.basePrice,
        ...(dto.salePrice !== undefined && { salePrice: dto.salePrice }),
      },
      version: dto.version,
      $push: { priceHistory: historyEntry },
    } as any);
  }

  /**
   * Soft delete a single SKU
   */
  public async delete(id: string): Promise<boolean> {
    const sku = await this._skuRepo.findById(id);
    if (!sku) throw new NotFoundError('SKU not found');

    const now = new Date();
    const newSkuCode = `${sku.skuCode}-deleted-${now.getTime()}`;

    const result = await this._skuRepo.update(id, {
      skuCode: newSkuCode,
      deletedAt: now,
      version: sku.version,
    });

    return !!result;
  }

  /**
   * Bulk soft delete SKUs by product ID
   */
  public async deleteByProductId(
    productId: string,
    deletedAt?: Date,
  ): Promise<boolean> {
    const now = deletedAt || new Date();
    return this._skuRepo.deleteByProductId(productId, now);
  }

  /**
   * Hard-deletes a SKU permanently.
   * Use ONLY as a compensating rollback when creating a product fails.
   */
  public async hardDelete(id: string): Promise<boolean> {
    return this._skuRepo.hardDelete(id);
  }

  // --- Private Helpers ---

  private async _ensureSkuCodeIsUnique(skuCode: string): Promise<void> {
    const existing = await this._skuRepo.findBySkuCode(skuCode);
    if (existing) throw new ConflictError('SKU code already exists');
  }

  private _createPriceHistoryEntry(dto: UpdateSkuPriceDTO) {
    return {
      basePrice: dto.basePrice,
      salePrice: dto.salePrice,
      type: 'MANUAL' as const,
      reason: dto.reason,
      appliedAt: new Date(),
    };
  }
}
