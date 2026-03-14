import { setupProductServiceTest, getMockProduct, createDto } from '../__fixtures__/product.fixtures.js';
import { ConflictError, NotFoundError } from '@shared/core/error.response.js';

describe('ProductService - Part 1: createProduct', () => {
  let { productService, mockProductRepo, mockCategoryService, mockBrandService, mockSkuService, mockInventoryService } = setupProductServiceTest();

  beforeEach(() => {
    ({ productService, mockProductRepo, mockCategoryService, mockBrandService, mockSkuService, mockInventoryService } = setupProductServiceTest());
  });

  it('should create product successfully (TC-PRD-05)', async () => {
    mockProductRepo.findBySlug.mockResolvedValue(null);
    mockCategoryService.findById.mockResolvedValue({ id: 'cat-1' });
    mockBrandService.findById.mockResolvedValue({ id: 'brand-1' });
    
    const createdProduct = getMockProduct();
    mockProductRepo.create.mockResolvedValue(createdProduct);
    mockSkuService.create.mockResolvedValue({ id: 'sku-1' });
    mockInventoryService.create.mockResolvedValue({ id: 'inv-1' });

    const result = await productService.createProduct(createDto as any);

    expect(result).toEqual(createdProduct);
    expect(mockProductRepo.create).toHaveBeenCalled();
    expect(mockSkuService.create).toHaveBeenCalledTimes(2);
    expect(mockInventoryService.create).toHaveBeenCalledTimes(2);
  });

  it('should roll back product and SKU if inventory creation fails (TC-PRD-01)', async () => {
    mockProductRepo.findBySlug.mockResolvedValue(null);
    mockCategoryService.findById.mockResolvedValue({ id: 'cat-1' });
    mockBrandService.findById.mockResolvedValue({ id: 'brand-1' });
    const createdProduct = getMockProduct();
    mockProductRepo.create.mockResolvedValue(createdProduct);
    mockSkuService.create.mockResolvedValue({ id: 'sku-1' });

    mockInventoryService.create.mockRejectedValue(new Error('Inventory DB Error'));

    await expect(productService.createProduct(createDto as any)).rejects.toThrow('Inventory DB Error');

    expect(mockSkuService.hardDelete).toHaveBeenCalled();
    expect(mockProductRepo.hardDelete).toHaveBeenCalled();
  });

  it('should throw ConflictError if slug already exists (TC-PRD-02)', async () => {
    mockProductRepo.findBySlug.mockResolvedValue({ id: 'existing' });

    await expect(productService.createProduct(createDto as any)).rejects.toThrow(ConflictError);
  });

  it('should throw ConflictError if SkuCode exists (TC-PRD-06)', async () => {
    mockProductRepo.findBySlug.mockResolvedValue(null);
    mockSkuService.findBySkuCode.mockResolvedValue({ id: 'sku-x' });

    await expect(productService.createProduct(createDto as any)).rejects.toThrow(ConflictError);
    expect(mockProductRepo.create).not.toHaveBeenCalled();
  });

  it('should throw NotFoundError if category not found (TC-PRD-07)', async () => {
    mockProductRepo.findBySlug.mockResolvedValue(null);
    mockCategoryService.findById.mockResolvedValue(null);

    await expect(productService.createProduct(createDto as any)).rejects.toThrow(NotFoundError);
  });

  it('should throw NotFoundError if brand not found (TC-PRD-08)', async () => {
    mockProductRepo.findBySlug.mockResolvedValue(null);
    mockCategoryService.findById.mockResolvedValue({ id: 'c1' });
    mockBrandService.findById.mockResolvedValue(null);

    await expect(productService.createProduct(createDto as any)).rejects.toThrow(NotFoundError);
  });

  it('should maintain original error even if rollback fails (TC-PRD-09)', async () => {
    mockProductRepo.findBySlug.mockResolvedValue(null);
    mockCategoryService.findById.mockResolvedValue({ id: 'c1' });
    mockBrandService.findById.mockResolvedValue({ id: 'b1' });
    mockProductRepo.create.mockResolvedValue(getMockProduct());
    mockSkuService.create.mockResolvedValue({ id: 's1' });
    
    mockInventoryService.create.mockRejectedValue(new Error('Original Error'));
    mockSkuService.hardDelete.mockRejectedValue(new Error('Rollback Error'));

    await expect(productService.createProduct(createDto as any)).rejects.toThrow('Original Error');
  });
});
