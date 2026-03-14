import { ProductService } from '@modules/products/use-cases/services/product.service.js';
import { PRODUCT_STATUS } from '@atomecom/shared';

export const createMockProductRepo = () => ({
  findById: jest.fn(),
  findBySlug: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  hardDelete: jest.fn().mockResolvedValue(true),
});

export const createMockCategoryService = () => ({ 
  findById: jest.fn(),
  getAncestors: jest.fn(),
});

export const createMockBrandService = () => ({ 
  findById: jest.fn() 
});

export const createMockSkuService = () => ({
  create: jest.fn(),
  hardDelete: jest.fn().mockResolvedValue(true),
  findAllByProductId: jest.fn(),
  findBySkuCode: jest.fn().mockResolvedValue(null),
  deleteByProductId: jest.fn().mockResolvedValue(true),
});

export const createMockInventoryService = () => ({
  create: jest.fn(),
  delete: jest.fn().mockResolvedValue(true),
});

export const setupProductServiceTest = () => {
  const mockProductRepo = createMockProductRepo();
  const mockCategoryService = createMockCategoryService();
  const mockBrandService = createMockBrandService();
  const mockSkuService = createMockSkuService();
  const mockInventoryService = createMockInventoryService();

  const productService = new ProductService({
    productRepo: mockProductRepo as any,
    categoryService: mockCategoryService as any,
    brandService: mockBrandService as any,
    skuService: mockSkuService as any,
    inventoryService: mockInventoryService as any,
  });

  return {
    productService,
    mockProductRepo,
    mockCategoryService,
    mockBrandService,
    mockSkuService,
    mockInventoryService,
  };
};

export const getMockProduct = () => ({
  id: 'prod-123',
  name: 'Test Product',
  slug: 'test-product',
  categoryId: 'cat-1',
  brandId: 'brand-1',
  status: PRODUCT_STATUS.PUBLISHED,
  version: 1,
});

export const createDto = {
  name: 'Test Product',
  slug: 'test-product',
  categoryId: 'cat-1',
  brandId: 'brand-1',
  skus: [
    { skuCode: 'SKU-1', price: 100, stock: 10 },
    { skuCode: 'SKU-2', price: 200, stock: 20 }
  ],
};
