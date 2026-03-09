import type { ICategoryRepository } from '../../domain/repositories/category.repo.js';
import type { CategoryEntity } from '../../domain/entities/category.entity.js';
import { computeLevel } from '../../domain/entities/category.entity.js';
import type { PaginatedResult } from '@atomecom/shared';
import {
  NotFoundError,
  ConflictError,
  BadRequestError,
  InternalServerError,
} from '@shared/core/error.response.js';
import { MAX_CATEGORY_LEVEL } from '@shared/constants/product.constants.js';
import type { ICacheRepo } from '@shared/interfaces/ICache.repo.js';
import type {
  CategoryQueryDTO,
  CreateCategoryDTO,
  UpdateCategoryDTO,
  MoveCategoryDTO,
} from '../dtos/category.dtos.js';
import mongoose from 'mongoose';
import type { IProductRepository } from '../../domain/repositories/product.repo.js';

interface CategoryServiceDependencies {
  categoryRepo: ICategoryRepository;
  productRepo: IProductRepository;
  cacheRepo: ICacheRepo;
}

export class CategoryService {
  private readonly _categoryRepo: ICategoryRepository;
  private readonly _productRepo: IProductRepository;
  private readonly _cache: ICacheRepo;

  constructor({
    categoryRepo,
    productRepo,
    cacheRepo,
  }: CategoryServiceDependencies) {
    this._categoryRepo = categoryRepo;
    this._productRepo = productRepo;
    this._cache = cacheRepo;
  }

  public async findById(id: string): Promise<CategoryEntity | null> {
    return this._categoryRepo.findById(id);
  }

  public async findBySlug(slug: string): Promise<CategoryEntity | null> {
    return this._categoryRepo.findBySlug(slug);
  }

  public async getAncestors(path: string): Promise<CategoryEntity[]> {
    if (!path) return [];
    // Path looks like ",id1,id2,id3," -> filter empty to get ["id1", "id2", "id3"]
    const ids = path.split(',').filter(Boolean);
    return this._categoryRepo.findByIds(ids);
  }

  public async findByPath(path: string): Promise<CategoryEntity | null> {
    return this._categoryRepo.findByPath(path);
  }

  public async findAll(
    dto: CategoryQueryDTO,
  ): Promise<PaginatedResult<CategoryEntity>> {
    const page = dto.page || 1;
    const limit = dto.limit || 20;
    const offset = (page - 1) * limit;

    const cacheKey = `cat:list:${dto.path || 'root'}:p${page}:l${limit}:${dto.keyword || 'none'}`;

    // Try cache first
    let cachedData: PaginatedResult<CategoryEntity> | null = null;
    try {
      cachedData =
        await this._cache.get<PaginatedResult<CategoryEntity>>(cacheKey);
    } catch (err) {
      console.warn('[CategoryService] Cache get failed:', err);
    }

    if (cachedData) {
      return cachedData;
    }

    const { data, totalElements } = await this._categoryRepo.findAll({
      ...dto,
      offset,
      limit,
    });

    const result = {
      data,
      pagination: {
        totalElements,
        totalPages: Math.ceil(totalElements / limit),
        currentPage: page,
        elementsPerPage: limit,
      },
    };

    // Store in cache (expire in 1 hour)
    try {
      await this._cache.set(cacheKey, result, 3600);
    } catch (err) {
      console.warn('[CategoryService] Cache set failed:', err);
    }

    return result;
  }

  /**
   * Discovery View: Get top 20 Level 1 categories, each with their top 20 Level 2 children.
   */
  public async getDiscoveryTree(): Promise<any[]> {
    const cacheKey = 'cat:discovery';

    let cached: any[] | null = null;
    try {
      cached = await this._cache.get<any[]>(cacheKey);
    } catch (err) {
      console.warn('[CategoryService] Discovery cache get failed:', err);
    }
    if (cached) return cached;

    // 1. Get Level 1 (root) categories - path=null triggers root query in repo
    const { data: level1 } = await this._categoryRepo.findAll({
      path: null,
      limit: 20,
      offset: 0,
      sortField: 'name',
      sortOrder: 'asc',
    });

    const discoveryData = await Promise.all(
      level1.map(async (cat) => {
        // 2. For each L1, get its direct children (L2) by passing its path
        const { data: children } = await this._categoryRepo.findAll({
          path: cat.path,
          limit: 20,
          offset: 0,
          sortField: 'name',
          sortOrder: 'asc',
        });

        return {
          ...cat,
          children,
        };
      }),
    );

    try {
      await this._cache.set(cacheKey, discoveryData, 3600);
    } catch (err) {
      console.warn('[CategoryService] Discovery cache set failed:', err);
    }
    return discoveryData;
  }

  /**
   * Create a new category with hierarchy calculation and uniqueness check
   */
  public async create(dto: CreateCategoryDTO): Promise<CategoryEntity> {
    await this._ensureSlugIsUnique(dto.slug);

    const categoryId = new mongoose.Types.ObjectId().toString();
    let path = `,${categoryId},`;

    if (dto.parentPath) {
      const parent = await this._getAndValidateParentByPath(dto.parentPath);
      path = `${parent.path}${categoryId},`;
    }

    const categoryData: CategoryEntity = {
      ...dto,
      id: categoryId,
      path,
      attributeDefinitions: dto.attributeDefinitions || [],
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await this._categoryRepo.create(categoryData);
    await this._invalidateCache();
    return result;
  }

  /**
   * Update category including recursive hierarchy updates if parent or slug changes
   */
  public async update(
    id: string,
    dto: UpdateCategoryDTO,
  ): Promise<CategoryEntity | null> {
    const category = await this._categoryRepo.findById(id);
    if (!category) throw new NotFoundError('Category not found');

    const updateData: Partial<CategoryEntity> = { ...dto };

    // Handle slug uniqueness if changed
    if (dto.slug && dto.slug !== category.slug) {
      await this._ensureSlugIsUnique(dto.slug);
    }

    const result = await this._categoryRepo.update(id, updateData);
    await this._invalidateCache();
    return result;
  }

  /**
   * Move category to a new parent
   */
  public async move(
    id: string,
    dto: MoveCategoryDTO,
  ): Promise<CategoryEntity | null> {
    const category = await this._categoryRepo.findById(id);
    if (!category) throw new NotFoundError('Category not found');

    // If moving to same parent, do nothing
    if (dto.parentPath === this._getParentPath(category.path)) {
      return category;
    }

    const hierarchyData = await this._calculateNewHierarchy(category, dto);
    const updateData: Partial<CategoryEntity> = {
      ...hierarchyData,
      version: dto.version,
    };

    // Step 1: Update Parent Category
    const updatedCategory = await this._categoryRepo.update(id, updateData);
    if (!updatedCategory) return null;

    // Step 2: Update Descendants
    try {
      await this._updateDescendants(category, hierarchyData.path);
    } catch (error) {
      // Compensation: Rollback Parent Category to original state
      await this._compensateCategoryUpdate(category);
      throw error;
    }

    await this._invalidateCache();
    return updatedCategory;
  }

  /**
   * Soft delete category after usage check
   */
  public async delete(id: string): Promise<boolean> {
    const category = await this._categoryRepo.findById(id);
    if (!category) throw new NotFoundError('Category not found');

    await this._ensureCategoryIsNotInUse(id);

    const now = new Date();
    const newSlug = `${category.slug}-deleted-${now.getTime()}`;

    const result = await this._categoryRepo.update(id, {
      slug: newSlug,
      deletedAt: now,
      version: category.version,
    });

    if (result) {
      await this._invalidateCache();
    }

    return !!result;
  }

  // --- Private Helpers ---

  private async _invalidateCache(): Promise<void> {
    try {
      await this._cache.deleteByPattern('cat:list:*');
      await this._cache.del('cat:discovery');
    } catch (error) {
      // Redis errors (like MISCONF) should not block core database operations.
      // We log it and let the service finish the main task.
      console.warn(
        '[CategoryService] Cache invalidation failed (Redis might be struggling):',
        error,
      );
    }
  }

  private async _ensureSlugIsUnique(slug: string): Promise<void> {
    const existing = await this._categoryRepo.findBySlug(slug);
    if (existing) throw new ConflictError('Category slug already exists');
  }

  private async _getAndValidateParentByPath(
    path: string,
  ): Promise<CategoryEntity> {
    const parent = await this._categoryRepo.findByPath(path);
    if (!parent) throw new NotFoundError('Parent category not found');

    if (computeLevel(parent.path) >= MAX_CATEGORY_LEVEL) {
      throw new BadRequestError(
        `Maximum hierarchy depth of ${MAX_CATEGORY_LEVEL} reached.`,
      );
    }
    return parent;
  }

  private _getParentPath(path: string): string | null {
    const parts = path.split(',').filter(Boolean);
    if (parts.length <= 1) return null;
    parts.pop();
    return `,${parts.join(',')},`;
  }

  private async _calculateNewHierarchy(
    category: CategoryEntity,
    dto: MoveCategoryDTO,
  ): Promise<{ path: string }> {
    let newPathPrefix = `,${category.id},`;

    if (dto.parentPath) {
      this._validateNotSelf(category.path, dto.parentPath);
      const newParent = await this._getAndValidateParentByPath(dto.parentPath);
      this._validateNoCircularDependency(category.path, newParent.path);

      await this._validateSubtreeDepth(category, computeLevel(newParent.path));

      newPathPrefix = `${newParent.path}${category.id},`;
    }

    return { path: newPathPrefix };
  }

  private async _compensateCategoryUpdate(
    original: CategoryEntity,
  ): Promise<void> {
    await this._categoryRepo
      .update(original.id, {
        name: original.name,
        slug: original.slug,
        path: original.path,
        status: original.status,
        icon: original.icon,
        description: original.description,
      } as any)
      .catch((err) => {
        console.error(
          `[Compensate] Failed to revert category ${original.id}:`,
          err,
        );
      });
  }

  private _validateNotSelf(path: string, parentPath: string): void {
    if (parentPath === path) {
      throw new BadRequestError('A category cannot be its own parent.');
    }
  }

  private _validateNoCircularDependency(
    catPath: string,
    parentPath: string,
  ): void {
    if (parentPath.startsWith(catPath)) {
      throw new BadRequestError(
        'Cannot move a category to one of its own descendants.',
      );
    }
  }

  private async _validateSubtreeDepth(
    category: CategoryEntity,
    newParentLevel: number,
  ): Promise<void> {
    const descendants = await this._categoryRepo.findAllDescendants(
      category.path,
    );
    const catLevel = computeLevel(category.path);
    const subtreeHeight = descendants.reduce(
      (max, d) => Math.max(max, computeLevel(d.path) - catLevel),
      0,
    );

    if (newParentLevel + 1 + subtreeHeight > MAX_CATEGORY_LEVEL) {
      throw new BadRequestError(
        `Moving this category would exceed the maximum depth of ${MAX_CATEGORY_LEVEL}.`,
      );
    }
  }

  private async _updateDescendants(
    category: CategoryEntity,
    newPathPrefix: string,
  ): Promise<void> {
    await this._categoryRepo.updateSubtreePath(category.path, newPathPrefix);
  }

  private async _ensureCategoryIsNotInUse(id: string): Promise<void> {
    const productCount = await this._productRepo.countByCategoryId(id);
    if (productCount > 0) {
      throw new ConflictError(`Category is used in ${productCount} products.`);
    }
  }
}
