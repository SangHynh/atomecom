import { SkuService } from '@modules/products/use-cases/services/sku.service.js';

export const createMockSkuRepo = () => ({
  findById: jest.fn(),
  findBySkuCode: jest.fn(),
  findAllByProductId: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  deleteByProductId: jest.fn(),
  hardDelete: jest.fn().mockResolvedValue(true),
});

export const setupSkuServiceTest = () => {
  const mockSkuRepo = createMockSkuRepo();
  const skuService = new SkuService({ skuRepo: mockSkuRepo as any });

  return {
    skuService,
    mockSkuRepo,
  };
};

export const getMockSku = () => ({
  id: 'sku-123',
  productId: 'prod-123',
  skuCode: 'SKU-OLD',
  price: { basePrice: 100, salePrice: 90 },
  version: 1,
});
