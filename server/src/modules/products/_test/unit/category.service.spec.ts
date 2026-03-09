import { CategoryService } from '../../use-cases/services/category.service.js';
import {
  NotFoundError,
  ConflictError,
  BadRequestError,
} from '@shared/core/error.response.js';
import { PRODUCT_STATUS } from '@atomecom/shared';

describe('CategoryService', () => {
  let categoryService: CategoryService;
  let mockCategoryRepo: any;
  let mockProductRepo: any;
  let mockCacheRepo: any;

  beforeEach(() => {
    mockCategoryRepo = {
      findById: jest.fn(),
      findBySlug: jest.fn(),
      findByPath: jest.fn(),
      findAll: jest.fn(),
      findByIds: jest.fn(),
      findAllDescendants: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateSubtreePath: jest.fn(),
    };
    mockProductRepo = {
      countByCategoryId: jest.fn().mockResolvedValue(0),
    };
    mockCacheRepo = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue(true),
      del: jest.fn().mockResolvedValue(true),
      deleteByPattern: jest.fn().mockResolvedValue(true),
    };

    categoryService = new CategoryService({
      categoryRepo: mockCategoryRepo,
      productRepo: mockProductRepo,
      cacheRepo: mockCacheRepo,
    });
  });

  describe('create', () => {
    const createDto = {
      name: 'Smartphones',
      slug: 'smartphones',
      status: PRODUCT_STATUS.PUBLISHED,
    };

    it('should create a root category successfully', async () => {
      mockCategoryRepo.findBySlug.mockResolvedValue(null);
      mockCategoryRepo.create.mockImplementation((data: any) =>
        Promise.resolve(data),
      );

      const result = await categoryService.create(createDto as any);

      expect(result.name).toBe(createDto.name);
      expect(result.path).toMatch(/^,[0-9a-f]+,$/i); // Root path
      expect(mockCacheRepo.deleteByPattern).toHaveBeenCalled();
    });

    it('should create a child category successfully', async () => {
      const parentPath = ',parent-id,';
      mockCategoryRepo.findBySlug.mockResolvedValue(null);
      mockCategoryRepo.findByPath.mockResolvedValue({
        id: 'parent-id',
        path: parentPath,
      });
      mockCategoryRepo.create.mockImplementation((data: any) =>
        Promise.resolve(data),
      );

      const result = await categoryService.create({
        ...createDto,
        parentPath,
      } as any);

      expect(result.path).toContain(parentPath);
      expect(result.path.split(',').filter(Boolean).length).toBe(2);
    });

    it('should throw ConflictError if slug exists', async () => {
      mockCategoryRepo.findBySlug.mockResolvedValue({ id: 'existing' });

      await expect(categoryService.create(createDto as any)).rejects.toThrow(
        ConflictError,
      );
    });
  });

  describe('move', () => {
    const categoryId = 'cat-123';
    const originalPath = ',cat-123,';
    const category = {
      id: categoryId,
      path: originalPath,
      name: 'Cat',
      version: 1,
    };

    it('should move category to a new parent', async () => {
      const newParentPath = ',new-parent,';
      mockCategoryRepo.findById.mockResolvedValue(category);
      mockCategoryRepo.findByPath.mockResolvedValue({
        id: 'new-parent',
        path: newParentPath,
      });
      mockCategoryRepo.update.mockImplementation((id: string, data: any) =>
        Promise.resolve({ ...category, ...data }),
      );
      mockCategoryRepo.findAllDescendants.mockResolvedValue([]);

      const result = await categoryService.move(categoryId, {
        parentPath: newParentPath,
        version: 1,
      });

      expect(result?.path).toBe(`${newParentPath}${categoryId},`);
      expect(mockCategoryRepo.updateSubtreePath).toHaveBeenCalledWith(
        originalPath,
        `${newParentPath}${categoryId},`,
      );
    });

    it('should throw BadRequestError when moving into itself', async () => {
      mockCategoryRepo.findById.mockResolvedValue(category);

      await expect(
        categoryService.move(categoryId, {
          parentPath: originalPath,
          version: 1,
        }),
      ).rejects.toThrow(BadRequestError);
    });

    it('should throw BadRequestError when moving into its own descendant', async () => {
      const descendantPath = ',cat-123,sub-cat,';
      mockCategoryRepo.findById.mockResolvedValue(category);
      mockCategoryRepo.findByPath.mockResolvedValue({
        id: 'sub-cat',
        path: descendantPath,
      });

      await expect(
        categoryService.move(categoryId, {
          parentPath: descendantPath,
          version: 1,
        }),
      ).rejects.toThrow(BadRequestError);
    });
  });

  describe('delete', () => {
    it('should soft delete category if not in use', async () => {
      const category = { id: 'cat-1', slug: 'electronic', version: 1 };
      mockCategoryRepo.findById.mockResolvedValue(category);
      mockProductRepo.countByCategoryId.mockResolvedValue(0);
      mockCategoryRepo.update.mockResolvedValue(true);

      const result = await categoryService.delete('cat-1');

      expect(result).toBe(true);
      expect(mockCategoryRepo.update).toHaveBeenCalledWith(
        'cat-1',
        expect.objectContaining({
          deletedAt: expect.any(Date),
          slug: expect.stringContaining('electronic-deleted'),
        }),
      );
    });

    it('should throw ConflictError if category is in use by products', async () => {
      mockCategoryRepo.findById.mockResolvedValue({ id: 'cat-1' });
      mockProductRepo.countByCategoryId.mockResolvedValue(5);

      await expect(categoryService.delete('cat-1')).rejects.toThrow(
        ConflictError,
      );
    });
  });
});
