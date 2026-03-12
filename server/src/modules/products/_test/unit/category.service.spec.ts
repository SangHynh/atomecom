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

  const getMockCategory = () => ({
    id: 'cat-123',
    path: ',cat-123,',
    name: 'Smartphones',
    slug: 'smartphones',
    status: PRODUCT_STATUS.PUBLISHED,
    version: 1,
  });

  describe('create', () => {
    it('should create a root category successfully (TC-CAT-01)', async () => {
      mockCategoryRepo.findBySlug.mockResolvedValue(null);
      mockCategoryRepo.create.mockImplementation((data: any) =>
        Promise.resolve(data),
      );

      const result = await categoryService.create({
        name: 'Smartphones',
        slug: 'smartphones',
        status: PRODUCT_STATUS.PUBLISHED,
      } as any);

      expect(result.name).toBe('Smartphones');
      expect(result.path).toMatch(/^,[0-9a-f]+,$/i); 
      expect(mockCacheRepo.deleteByPattern).toHaveBeenCalled();
    });

    it('should create a child category successfully (TC-CAT-02)', async () => {
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
        name: 'iPhone',
        slug: 'iphone',
        parentPath,
        status: PRODUCT_STATUS.PUBLISHED,
      } as any);

      expect(result.path).toContain(parentPath);
      expect(result.path.split(',').filter(Boolean).length).toBe(2);
    });

    it('should throw ConflictError if slug exists (TC-CAT-03)', async () => {
      mockCategoryRepo.findBySlug.mockResolvedValue({ id: 'existing' });

      await expect(categoryService.create({ slug: 's' } as any)).rejects.toThrow(
        ConflictError,
      );
    });

    it('should throw NotFoundError if parent category not found (TC-CAT-09)', async () => {
      mockCategoryRepo.findByPath.mockResolvedValue(null);
      await expect(
        categoryService.create({ name: 'N', slug: 's', parentPath: ',fake,', status: 'PUBLISHED' } as any),
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw BadRequestError if max level reached (TC-CAT-10)', async () => {
      mockCategoryRepo.findByPath.mockResolvedValue({
        id: 'p5',
        path: ',1,2,3,4,5,',
      });
      await expect(
        categoryService.create({
          name: 'N',
          slug: 's',
          parentPath: ',1,2,3,4,5,',
          status: 'PUBLISHED'
        } as any),
      ).rejects.toThrow(BadRequestError);
    });
  });

  describe('update', () => {
    it('should update successfully and invalidate cache (TC-CAT-11)', async () => {
      const category = getMockCategory();
      mockCategoryRepo.findById.mockResolvedValue(category);
      mockCategoryRepo.update.mockResolvedValue({ ...category, name: 'New' });

      await categoryService.update('cat-123', { name: 'New', version: 1 });

      expect(mockCacheRepo.deleteByPattern).toHaveBeenCalled();
    });

    it('should throw ConflictError if slug exists (TC-CAT-12)', async () => {
      const category = getMockCategory();
      mockCategoryRepo.findById.mockResolvedValue(category);
      mockCategoryRepo.findBySlug.mockResolvedValue({ id: 'c2' });

      await expect(
        categoryService.update('cat-123', { slug: 'new', version: 1 }),
      ).rejects.toThrow(ConflictError);
    });
  });

  describe('move', () => {
    it('should move category to a new parent (TC-CAT-04)', async () => {
      const category = getMockCategory();
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

      const result = await categoryService.move(category.id, {
        parentPath: newParentPath,
        version: 1,
      });

      expect(result?.path).toBe(`${newParentPath}${category.id},`);
      expect(mockCategoryRepo.updateSubtreePath).toHaveBeenCalled();
    });

    it('should throw BadRequestError when moving into itself (TC-CAT-05)', async () => {
      const category = getMockCategory();
      mockCategoryRepo.findById.mockResolvedValue(category);

      await expect(
        categoryService.move(category.id, {
          parentPath: category.path,
          version: 1,
        }),
      ).rejects.toThrow(BadRequestError);
    });

    it('should throw BadRequestError when moving into its own descendant (TC-CAT-06)', async () => {
      const category = getMockCategory();
      const descendantPath = ',cat-123,sub-cat,';
      mockCategoryRepo.findById.mockResolvedValue(category);
      mockCategoryRepo.findByPath.mockResolvedValue({
        id: 'sub-cat',
        path: descendantPath,
      });

      await expect(
        categoryService.move(category.id, {
          parentPath: descendantPath,
          version: 1,
        }),
      ).rejects.toThrow(BadRequestError);
    });

    it('should return early if moving to same parent (TC-CAT-13)', async () => {
      const childPath = ',p1,c1,';
      const cat = { ...getMockCategory(), id: 'c1', path: childPath };
      mockCategoryRepo.findById.mockResolvedValue(cat);

      const result = await categoryService.move('c1', {
        parentPath: ',p1,',
        version: 1,
      });

      expect(result).toEqual(cat);
      expect(mockCategoryRepo.update).not.toHaveBeenCalled();
    });

    it('should throw BadRequestError if move exceeds max level (TC-CAT-14)', async () => {
      const category = getMockCategory();
      mockCategoryRepo.findById.mockResolvedValue(category);
      mockCategoryRepo.findByPath.mockResolvedValue({
        id: 'p4',
        path: ',1,2,3,4,',
      });
      // Subtree depth: 2
      mockCategoryRepo.findAllDescendants.mockResolvedValue([
        { path: ',cat-123,sub1,' },
        { path: ',cat-123,sub1,sub2,' },
      ]);

      await expect(
        categoryService.move(category.id, {
          parentPath: ',1,2,3,4,',
          version: 1,
        }),
      ).rejects.toThrow(BadRequestError);
    });

    it('should compensate if subtree update fails (TC-CAT-15)', async () => {
      const category = getMockCategory();
      mockCategoryRepo.findById.mockResolvedValue(category);
      mockCategoryRepo.findByPath.mockResolvedValue({
        id: 'p1',
        path: ',p1,',
      });
      
      // First update (parent change) succeeds
      mockCategoryRepo.update.mockResolvedValueOnce({ ...category, path: ',p1,cat-123,' });
      // Second update (compensation) must also return a promise
      mockCategoryRepo.update.mockResolvedValueOnce(category);
      
      mockCategoryRepo.updateSubtreePath.mockRejectedValue(new Error('DB Failed'));
      mockCategoryRepo.findAllDescendants.mockResolvedValue([]);

      await expect(
        categoryService.move(category.id, { parentPath: ',p1,', version: 1 }),
      ).rejects.toThrow('DB Failed');

      expect(mockCategoryRepo.update).toHaveBeenCalledTimes(2); 
    });
  });

  describe('findAll / getDiscoveryTree', () => {
    it('should handle cache miss in findAll (TC-CAT-16)', async () => {
      mockCacheRepo.get.mockResolvedValue(null);
      mockCategoryRepo.findAll.mockResolvedValue({
        data: [],
        totalElements: 0,
      });

      await categoryService.findAll({});
      expect(mockCacheRepo.set).toHaveBeenCalled();
    });

    it('should handle cache hit in findAll (TC-CAT-17)', async () => {
      const cached = { data: [{ id: 'c1' }], pagination: {} };
      mockCacheRepo.get.mockResolvedValue(cached);

      const result = await categoryService.findAll({});
      expect(result).toEqual(cached);
      expect(mockCategoryRepo.findAll).not.toHaveBeenCalled();
    });

    it('should fetch level 1 and children in getDiscoveryTree (TC-CAT-18)', async () => {
      mockCategoryRepo.findAll.mockResolvedValue({
        data: [{ id: 'root1', path: ',root1,' }],
        totalElements: 1,
      });

      const result = await categoryService.getDiscoveryTree();
      expect(result[0].children).toBeDefined();
      expect(mockCategoryRepo.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ path: ',root1,' }),
      );
    });

    it('should not crash if cache invalidation fails (TC-CAT-19)', async () => {
      mockCacheRepo.deleteByPattern.mockRejectedValue(new Error('Redis Down'));
      const category = getMockCategory();
      mockCategoryRepo.findById.mockResolvedValue(category);
      mockProductRepo.countByCategoryId.mockResolvedValue(0);
      mockCategoryRepo.update.mockResolvedValue(true);

      const result = await categoryService.delete(category.id);
      expect(result).toBe(true);
    });
  });

  describe('Query Methods', () => {
    it('should return category by id (TC-CAT-20)', async () => {
      const cat = getMockCategory();
      mockCategoryRepo.findById.mockResolvedValue(cat);
      expect(await categoryService.findById(cat.id)).toEqual(cat);
    });

    it('should return category by slug (TC-CAT-21)', async () => {
      const cat = getMockCategory();
      mockCategoryRepo.findBySlug.mockResolvedValue(cat);
      expect(await categoryService.findBySlug(cat.slug)).toEqual(cat);
    });

    it('should return ancestors (TC-CAT-22)', async () => {
      const path = ',id1,id2,id3,';
      mockCategoryRepo.findByIds.mockResolvedValue([{ id: 'id1' }, { id: 'id2' }]);
      const result = await categoryService.getAncestors(path);
      expect(mockCategoryRepo.findByIds).toHaveBeenCalledWith(['id1', 'id2', 'id3']);
      expect(result.length).toBe(2);
    });

    it('should return category by path (TC-CAT-23)', async () => {
      const cat = getMockCategory();
      mockCategoryRepo.findByPath.mockResolvedValue(cat);
      expect(await categoryService.findByPath(cat.path)).toEqual(cat);
    });
  });

  describe('delete', () => {
    it('should soft delete category if not in use (TC-CAT-07)', async () => {
      const category = getMockCategory();
      mockCategoryRepo.findById.mockResolvedValue(category);
      mockProductRepo.countByCategoryId.mockResolvedValue(0);
      mockCategoryRepo.update.mockResolvedValue(true);

      const result = await categoryService.delete(category.id);

      expect(result).toBe(true);
      expect(mockCategoryRepo.update).toHaveBeenCalledWith(
        category.id,
        expect.objectContaining({
          deletedAt: expect.any(Date),
          slug: expect.stringContaining(`${category.slug}-deleted`),
        }),
      );
    });

    it('should throw ConflictError if category is in use by products (TC-CAT-08)', async () => {
      const category = getMockCategory();
      mockCategoryRepo.findById.mockResolvedValue(category);
      mockProductRepo.countByCategoryId.mockResolvedValue(5);

      await expect(categoryService.delete(category.id)).rejects.toThrow(
        ConflictError,
      );
    });
  });
});
