import type { IBrandRepository } from '../../domain/repositories/brand.repo.js';
import type { BrandEntity } from '../../domain/entities/brand.entity.js';
import { PRODUCT_STATUS, type PaginatedResult } from '@atomecom/shared';
import { NotFoundError, ConflictError } from '@shared/core/error.response.js';
import type {
  BrandQueryDTO,
  CreateBrandDTO,
  UpdateBrandDTO,
} from '../dtos/brand.dtos.js';
import mongoose from 'mongoose';
import type { IProductRepository } from '../../domain/repositories/product.repo.js';

interface BrandServiceDependencies {
  brandRepo: IBrandRepository;
  productRepo: IProductRepository;
}

export class BrandService {
  private readonly _brandRepo: IBrandRepository;
  private readonly _productRepo: IProductRepository;

  constructor({ brandRepo, productRepo }: BrandServiceDependencies) {
    this._brandRepo = brandRepo;
    this._productRepo = productRepo;
  }

  public async findById(id: string): Promise<BrandEntity | null> {
    return this._brandRepo.findById(id);
  }

  public async findBySlug(slug: string): Promise<BrandEntity | null> {
    return this._brandRepo.findBySlug(slug);
  }

  public async findAll(
    dto: BrandQueryDTO,
  ): Promise<PaginatedResult<BrandEntity>> {
    const limit = Number(dto.limit) || 10;
    const page = Number(dto.page) || 1;
    const offset = (page - 1) * limit;

    const { data, totalElements } = await this._brandRepo.findAll({
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
   * Create a new brand with uniqueness check
   */
  public async create(dto: CreateBrandDTO): Promise<BrandEntity> {
    await this._ensureSlugIsUnique(dto.slug);

    const brandData: BrandEntity = {
      name: dto.name,
      slug: dto.slug,
      description: dto.description,
      logo: dto.logo || '',
      status: PRODUCT_STATUS.PUBLISHED,
      id: new mongoose.Types.ObjectId().toString(),
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any;

    return this._brandRepo.create(brandData);
  }

  /**
   * Update brand details and ensure slug uniqueness
   */
  public async update(
    id: string,
    dto: UpdateBrandDTO,
  ): Promise<BrandEntity | null> {
    const brand = await this._brandRepo.findById(id);
    if (!brand) throw new NotFoundError('Brand not found');

    if (dto.slug && dto.slug !== brand.slug) {
      await this._ensureSlugIsUnique(dto.slug);
    }

    return this._brandRepo.update(id, dto);
  }

  /**
   * Soft delete brand after ensuring no products are linked
   */
  public async delete(id: string): Promise<boolean> {
    const brand = await this._brandRepo.findById(id);
    if (!brand) throw new NotFoundError('Brand not found');

    await this._ensureBrandIsNotInUse(id);

    const now = new Date();
    const newSlug = `${brand.slug}-deleted-${now.getTime()}`;

    const result = await this._brandRepo.update(id, {
      slug: newSlug,
      deletedAt: now,
      version: brand.version,
    });

    return !!result;
  }

  // --- Private Helpers ---

  private async _ensureSlugIsUnique(slug: string): Promise<void> {
    const existing = await this._brandRepo.findBySlug(slug);
    if (existing) throw new ConflictError('Brand slug already exists');
  }

  private async _ensureBrandIsNotInUse(id: string): Promise<void> {
    const productCount = await this._productRepo.countByBrandId(id);
    if (productCount > 0) {
      throw new ConflictError(
        `Cannot delete brand. It is used in ${productCount} products.`,
      );
    }
  }
}
