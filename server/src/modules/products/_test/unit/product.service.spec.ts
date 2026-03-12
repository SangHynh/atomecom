import { ProductService } from '../../use-cases/services/product.service.js';
import { PRODUCT_STATUS } from '@atomecom/shared';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '@shared/core/error.response.js';

describe('ProductService', () => {
  let productService: ProductService;
  let mockProductRepo: any;
  let mockCategoryService: any;
  let mockBrandService: any;
  let mockSkuService: any;
  let mockInventoryService: any;

  beforeEach(() => {
    mockProductRepo = {
      findById: jest.fn(),
      findBySlug: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      hardDelete: jest.fn().mockResolvedValue(true),
    };
    mockCategoryService = { findById: jest.fn() };
    mockBrandService = { findById: jest.fn() };
    mockSkuService = {
      create: jest.fn(),
      hardDelete: jest.fn().mockResolvedValue(true),
      findAllByProductId: jest.fn(),
      findBySkuCode: jest.fn().mockResolvedValue(null),
      deleteByProductId: jest.fn().mockResolvedValue(true),
    };
    mockInventoryService = {
      create: jest.fn(),
      delete: jest.fn().mockResolvedValue(true),
    };

    productService = new ProductService({
      productRepo: mockProductRepo,
      categoryService: mockCategoryService,
      brandService: mockBrandService,
      skuService: mockSkuService,
      inventoryService: mockInventoryService,
    });
  });

  const getMockProduct = () => ({
    id: 'prod-123',
    name: 'Test Product',
    slug: 'test-product',
    categoryId: 'cat-1',
    brandId: 'brand-1',
    status: PRODUCT_STATUS.PUBLISHED,
    version: 1,
  });

  const createDto = {
    name: 'Test Product',
    slug: 'test-product',
    categoryId: 'cat-1',
    brandId: 'brand-1',
    skus: [
      { skuCode: 'SKU-1', price: 100, stock: 10 },
      { skuCode: 'SKU-2', price: 200, stock: 20 }
    ],
  };

  describe('createProduct', () => {
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

  describe('updateProduct', () => {
    it('should update successfully (TC-PRD-10)', async () => {
      const product = getMockProduct();
      mockProductRepo.findById.mockResolvedValue(product);
      mockProductRepo.update.mockResolvedValue({ ...product, name: 'New' });

      const result = await productService.updateProduct(product.id, { name: 'New', version: 1 });
      expect(result?.name).toBe('New');
    });

    it('should throw ConflictError if new slug exists (TC-PRD-11)', async () => {
      const product = getMockProduct();
      mockProductRepo.findById.mockResolvedValue(product);
      mockProductRepo.findBySlug.mockResolvedValue({ id: 'other' });

      await expect(productService.updateProduct(product.id, { slug: 'new-slug', version: 1 }))
        .rejects.toThrow(ConflictError);
    });

    it('should throw NotFoundError if category/brand ID invalid (TC-PRD-12)', async () => {
      mockProductRepo.findById.mockResolvedValue(getMockProduct());
      mockCategoryService.findById.mockResolvedValue(null);

      await expect(productService.updateProduct('p1', { categoryId: 'fake', version: 1 }))
        .rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteProduct', () => {
    it('should soft delete product and its SKUs/Inventory (TC-PRD-03)', async () => {
      const product = getMockProduct();
      mockProductRepo.findById.mockResolvedValue(product);
      mockProductRepo.update.mockResolvedValue(true);
      mockSkuService.findAllByProductId.mockResolvedValue([{ id: 'sku-1' }]);

      const result = await productService.deleteProduct(product.id);

      expect(result).toBe(true);
      expect(mockProductRepo.update).toHaveBeenCalled();
      expect(mockSkuService.deleteByProductId).toHaveBeenCalled();
      expect(mockInventoryService.delete).toHaveBeenCalled();
    });

    it('should throw NotFoundError if product does not exist (TC-PRD-04)', async () => {
      mockProductRepo.findById.mockResolvedValue(null);
      await expect(productService.deleteProduct('fake')).rejects.toThrow(NotFoundError);
    });

    it('should ignore inventory delete error and return true (TC-PRD-14)', async () => {
      mockProductRepo.findById.mockResolvedValue(getMockProduct());
      mockProductRepo.update.mockResolvedValue(true);
      mockSkuService.findAllByProductId.mockResolvedValue([{ id: 'sku-1' }]);
      mockInventoryService.delete.mockRejectedValue(new Error('Inventory delete failed'));

      const result = await productService.deleteProduct('p1');
      expect(result).toBe(true);
    });
  });

  describe('findAll', () => {
    it('should return paginated result (TC-PRD-13)', async () => {
      mockProductRepo.findAll.mockResolvedValue({
        data: [{ name: 'P1' }],
        totalElements: 10,
      });

      const result = await productService.findAll({ page: 2, limit: 5 });
      expect(result.pagination.totalPages).toBe(2);
      expect(mockProductRepo.findAll).toHaveBeenCalledWith(expect.objectContaining({ offset: 5 }));
    });
  });

  describe('Query Methods', () => {
    it('should return product by id (TC-PRD-15)', async () => {
      const p = getMockProduct();
      mockProductRepo.findById.mockResolvedValue(p);
      expect(await productService.findById(p.id)).toEqual(p);
    });

    it('should return product by slug (TC-PRD-16)', async () => {
      const p = getMockProduct();
      mockProductRepo.findBySlug.mockResolvedValue(p);
      expect(await productService.findBySlug(p.slug)).toEqual(p);
    });
  });
});
