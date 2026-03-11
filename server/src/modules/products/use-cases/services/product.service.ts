import type { IProductRepository } from '../../domain/repositories/product.repo.js';
import type { ProductEntity } from '../../domain/entities/product.entity.js';
import type {
  CreateProductDTO,
  ProductQueryDTO,
  UpdateProductDTO,
} from '../dtos/product.dtos.js';
import type { CategoryService } from './category.service.js';
import type { BrandService } from './brand.service.js';
import type { SkuService } from './sku.service.js';
import type { InventoryService } from '../../../inventory/use-cases/inventory.service.js';
import type { SkuEntity } from '../../domain/entities/sku.entity.js';
import type { InventoryEntity } from '../../../inventory/domain/entities/inventory.entity.js';
import mongoose from 'mongoose';
import {
  NotFoundError,
  ConflictError,
  BadRequestError,
} from '@shared/core/error.response.js';
import { PRODUCT_STATUS } from '@shared/enum/productStatus.enum.js';
import type { PaginatedResult } from '@atomecom/shared';

interface ProductServiceDependencies {
  productRepo: IProductRepository;
  categoryService: CategoryService;
  brandService: BrandService;
  skuService: SkuService;
  inventoryService: InventoryService;
}

export class ProductService {
  private readonly _productRepo: IProductRepository;
  private readonly _categoryService: CategoryService;
  private readonly _brandService: BrandService;
  private readonly _skuService: SkuService;
  private readonly _inventoryService: InventoryService;

  constructor({
    productRepo,
    categoryService,
    brandService,
    skuService,
    inventoryService,
  }: ProductServiceDependencies) {
    this._productRepo = productRepo;
    this._categoryService = categoryService;
    this._brandService = brandService;
    this._skuService = skuService;
    this._inventoryService = inventoryService;
  }

  // ─── Public API ───────────────────────────────────────────────────────────

  public async findById(id: string): Promise<ProductEntity | null> {
    return this._productRepo.findById(id);
  }

  public async findBySlug(slug: string): Promise<ProductEntity | null> {
    return this._productRepo.findBySlug(slug);
  }

  public async findAll(
    dto: ProductQueryDTO,
  ): Promise<PaginatedResult<ProductEntity>> {
    const limit = Number(dto.limit) || 10;
    const page = Number(dto.page) || 1;
    const offset = (page - 1) * limit;

    const { data, totalElements } = await this._productRepo.findAll({
      ...dto,
      offset,
      limit,
    });

    return {
      data,
      pagination: {
        totalElements,
        totalPages: Math.ceil(totalElements / limit),
        currentPage: page,
        elementsPerPage: limit,
      },
    };
  }

  /**
   * Creates a Product along with its SKUs and initial Inventory records.
   * Uses the Compensating Transaction pattern to ensure atomicity at the
   * application level without requiring a MongoDB Replica Set.
   */
  public async createProduct(dto: CreateProductDTO): Promise<ProductEntity> {
    await this._validateCreateInputs(dto);
    await this._validateCategoryAndBrand(dto.categoryId, dto.brandId);

    // --- Step 1: Create Product ---
    const productData = this._buildProductEntity(dto);
    const product = await this._productRepo.create(productData);

    // --- Step 2: Create SKUs and Inventory (with compensation on failure) ---
    if (dto.skus && dto.skus.length > 0) {
      try {
        await this._createSkusAndInventory(product.id, dto.skus);
      } catch (error) {
        // Compensate: hard-delete the product to prevent orphan records
        await this._compensateDeleteProduct(product.id);
        throw error;
      }
    }

    return product;
  }

  /**
   * Updates product fields and validates sensitive changes like slug or references.
   */
  public async updateProduct(id: string, dto: UpdateProductDTO) {
    const product = await this._productRepo.findById(id);
    if (!product) throw new NotFoundError('Product not found');

    if (dto.slug && dto.slug !== product.slug) {
      await this._ensureProductSlugIsUnique(dto.slug);
    }
    if (dto.categoryId) await this._validateCategory(dto.categoryId);
    if (dto.brandId) await this._validateBrand(dto.brandId);

    return this._productRepo.update(id, { ...dto, version: product.version });
  }

  /**
   * Soft-deletes a Product and cascades the deletion to its SKUs and Inventory.
   * Uses idempotent soft-delete operations, so partial failures are safe to retry.
   */
  public async deleteProduct(id: string): Promise<boolean> {
    const product = await this._productRepo.findById(id);
    if (!product) throw new NotFoundError('Product not found');

    // --- Step 1: Soft-delete the Product (marks it as deleted) ---
    await this._softDeleteProduct(product);

    // --- Steps 2 & 3: Cascade soft-delete to SKUs -> Inventory ---
    // These are idempotent: running them multiple times is safe.
    // A future cleanup job can catch any stragglers if these partially fail.
    await this._cascadeDeleteSkusAndInventory(id);

    return true;
  }

  // ─── Validation Helpers ───────────────────────────────────────────────────

  private async _validateCreateInputs(dto: CreateProductDTO): Promise<void> {
    await this._ensureProductSlugIsUnique(dto.slug);

    /* - Removed restriction to allow separate Inventory management -
    if (!dto.skus || dto.skus.length === 0) {
      throw new BadRequestError('Product must have at least one SKU');
    }
    */

    if (dto.skus && dto.skus.length > 0) {
      for (const skuDto of dto.skus) {
        const existingSku = await this._skuService.findBySkuCode(
          skuDto.skuCode,
        );
        if (existingSku) {
          throw new ConflictError(`SkuCode "${skuDto.skuCode}" already exists`);
        }
      }
    }
  }

  private async _ensureProductSlugIsUnique(slug: string): Promise<void> {
    const existing = await this._productRepo.findBySlug(slug);
    if (existing) throw new ConflictError('Product slug already exists');
  }

  private async _validateCategoryAndBrand(
    categoryId: string,
    brandId: string,
  ): Promise<void> {
    await this._validateCategory(categoryId);
    await this._validateBrand(brandId);
  }

  private async _validateCategory(categoryId: string): Promise<void> {
    const category = await this._categoryService.findById(categoryId);
    if (!category) throw new NotFoundError('Category not found');
  }

  private async _validateBrand(brandId: string): Promise<void> {
    const brand = await this._brandService.findById(brandId);
    if (!brand) throw new NotFoundError('Brand not found');
  }

  // ─── Build Helpers ────────────────────────────────────────────────────────

  private _buildProductEntity(dto: CreateProductDTO): ProductEntity {
    return {
      ...dto,
      id: new mongoose.Types.ObjectId().toString(),
      status: dto.status || PRODUCT_STATUS.DRAFT,
      avgRating: 0,
      totalReviews: 0,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  private _buildSkuEntity(productId: string, skuDto: any): SkuEntity {
    return {
      ...skuDto,
      productId,
      id: new mongoose.Types.ObjectId().toString(),
      version: 1,
      priceHistory: [
        {
          basePrice: skuDto.price.basePrice,
          salePrice: skuDto.price.salePrice,
          type: 'MANUAL',
          reason: 'Initial price on product creation',
          appliedAt: new Date(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  private _buildInventoryEntity(
    skuId: string,
    quantity: number,
  ): InventoryEntity {
    return {
      skuId,
      quantity,
      reserved: 0,
      available: quantity,
      lowStockThreshold: 5,
      location: '',
      updatedAt: new Date(),
    };
  }

  // ─── Creation Steps ───────────────────────────────────────────────────────

  /**
   * Creates all SKUs then their Inventory records for a given product.
   * On failure mid-loop, rolls back already-created records.
   */
  private async _createSkusAndInventory(
    productId: string,
    skuDtos: any[],
  ): Promise<void> {
    const createdSkuIds: string[] = [];

    for (const skuDto of skuDtos) {
      const skuData = this._buildSkuEntity(productId, skuDto);
      const sku = await this._skuService.create(skuData);
      createdSkuIds.push(sku.id);

      try {
        const inventoryData = this._buildInventoryEntity(
          sku.id,
          skuDto.initialQuantity || 0,
        );
        await this._inventoryService.create(inventoryData);
      } catch (error) {
        // Compensate: hard-delete SKUs already created in this loop
        await this._compensateDeleteSkus(createdSkuIds);
        throw error;
      }
    }
  }

  // ─── Compensating (Rollback) Steps ───────────────────────────────────────

  /**
   * Compensation for Step 1: hard-deletes a freshly created Product.
   * Called only when SKU/Inventory creation fails, preventing orphan records.
   */
  private async _compensateDeleteProduct(productId: string): Promise<void> {
    await this._productRepo.hardDelete(productId).catch((err: unknown) => {
      // Log but don't throw — primary error should propagate
      console.error(
        `[Compensate] Failed to hard-delete product ${productId}:`,
        err,
      );
    });
  }

  /**
   * Compensation for Step 2: hard-deletes freshly created SKUs when
   * Inventory creation fails, preventing orphan SKU records.
   */
  private async _compensateDeleteSkus(skuIds: string[]): Promise<void> {
    await Promise.allSettled(
      skuIds.map((id) =>
        this._skuService.hardDelete(id).catch((err: unknown) => {
          console.error(`[Compensate] Failed to hard-delete SKU ${id}:`, err);
        }),
      ),
    );
  }

  // ─── Cascade Soft Delete Steps ────────────────────────────────────────────

  /**
   * Soft-deletes the product record, renaming its slug to free it for reuse.
   */
  private async _softDeleteProduct(product: ProductEntity): Promise<void> {
    const noisySlug = `${product.slug}-deleted-${Date.now()}`;
    const updated = await this._productRepo.update(product.id, {
      slug: noisySlug,
      deletedAt: new Date(),
      version: product.version,
    });

    if (!updated) {
      throw new ConflictError(
        'Data modified concurrently, product not found or deleted',
      );
    }
  }

  /**
   * Cascades soft-delete from a product's SKUs down to their Inventory records.
   * Both operations are idempotent and safe to partially fail.
   */
  private async _cascadeDeleteSkusAndInventory(
    productId: string,
  ): Promise<void> {
    const now = new Date();

    // Fetch SKUs *before* deleting them (findAllByProductId excludes deleted)
    const skus = await this._skuService.findAllByProductId(productId);

    // Bulk soft-delete all SKUs for this product
    await this._skuService.deleteByProductId(productId, now);

    // Soft-delete each SKU's Inventory record
    await Promise.allSettled(
      skus.map((sku) =>
        this._inventoryService.delete(sku.id, now).catch((err: unknown) => {
          console.error(
            `[Cascade] Failed to soft-delete inventory for SKU ${sku.id}:`,
            err,
          );
        }),
      ),
    );
  }
}
