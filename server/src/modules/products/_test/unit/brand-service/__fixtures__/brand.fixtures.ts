import { BrandService } from '@modules/products/use-cases/services/brand.service.js';

export const createMockBrandRepo = () => ({
  findById: jest.fn(),
  findBySlug: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
});

export const createMockProductRepo = () => ({
  countByBrandId: jest.fn().mockResolvedValue(0),
});

export const setupBrandServiceTest = () => {
  const mockBrandRepo = createMockBrandRepo();
  const mockProductRepo = createMockProductRepo();
  
  const brandService = new BrandService({
    brandRepo: mockBrandRepo as any,
    productRepo: mockProductRepo as any,
  });

  return {
    brandService,
    mockBrandRepo,
    mockProductRepo,
  };
};
