import { CategoryService } from '@modules/products/use-cases/services/category.service.js';
import { PRODUCT_STATUS } from '@atomecom/shared';

export const createMockCategoryRepo = () => ({
  findById: jest.fn(),
  findBySlug: jest.fn(),
  findByPath: jest.fn(),
  findAll: jest.fn(),
  findByIds: jest.fn(),
  findAllDescendants: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  updateSubtreePath: jest.fn(),
});

export const createMockProductRepo = () => ({
  countByCategoryId: jest.fn().mockResolvedValue(0),
});

export const createMockCacheRepo = () => ({
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue(true),
  del: jest.fn().mockResolvedValue(true),
  deleteByPattern: jest.fn().mockResolvedValue(true),
});

export const setupCategoryServiceTest = () => {
  const mockCategoryRepo = createMockCategoryRepo();
  const mockProductRepo = createMockProductRepo();
  const mockCacheRepo = createMockCacheRepo();

  const categoryService = new CategoryService({
    categoryRepo: mockCategoryRepo as any,
    productRepo: mockProductRepo as any,
    cacheRepo: mockCacheRepo as any,
  });

  return {
    categoryService,
    mockCategoryRepo,
    mockProductRepo,
    mockCacheRepo,
  };
};

export const getMockCategory = () => ({
  id: 'cat-123',
  path: ',cat-123,',
  name: 'Smartphones',
  slug: 'smartphones',
  status: PRODUCT_STATUS.PUBLISHED,
  version: 1,
});
