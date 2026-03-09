import { ProductService } from '../../use-cases/services/product.service.js';
import { PRODUCT_STATUS } from '@shared/enum/productStatus.enum.js';
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

  describe('createProduct (Compensating Transaction)', () => {
    const createDto = {
      name: 'Test Product',
      slug: 'test-product',
      categoryId: 'cat-1',
      brandId: 'brand-1',
      skus: [{ skuCode: 'SKU-1', price: 100, stock: 10 }],
    };

    it('should roll back product and SKU if inventory creation fails', async () => {
      // Setup: Valid category/brand, no existing slug
      mockProductRepo.findBySlug.mockResolvedValue(null);
      mockCategoryService.findById.mockResolvedValue({ id: 'cat-1' });
      mockBrandService.findById.mockResolvedValue({ id: 'brand-1' });

      // Step 1: Product Repo Create succeeds
      const createdProduct = { id: 'prod-123', ...createDto };
      mockProductRepo.create.mockResolvedValue(createdProduct);

      // Step 2A: SKU Service Create succeeds
      const createdSku = {
        id: 'sku-1',
        productId: 'prod-123',
        skuCode: 'SKU-1',
      };
      mockSkuService.create.mockResolvedValue(createdSku);

      // Step 2B: Inventory Service Create FAILS
      mockInventoryService.create.mockRejectedValue(
        new Error('Inventory DB Error'),
      );

      // Execution
      await expect(
        productService.createProduct(createDto as any),
      ).rejects.toThrow('Inventory DB Error');

      // Verification: COMPENSATION was called
      // 1. Delete created SKU
      expect(mockSkuService.hardDelete).toHaveBeenCalledWith('sku-1');
      // 2. Delete created Product
      expect(mockProductRepo.hardDelete).toHaveBeenCalledWith('prod-123');
    });

    it('should throw ConflictError if slug already exists', async () => {
      mockProductRepo.findBySlug.mockResolvedValue({ id: 'existing' });

      await expect(
        productService.createProduct(createDto as any),
      ).rejects.toThrow(ConflictError);
      expect(mockProductRepo.create).not.toHaveBeenCalled();
    });
  });

  describe('deleteProduct (Cascading Soft Delete)', () => {
    const productId = 'prod-123';

    it('should soft delete product and its SKUs/Inventory', async () => {
      const product = { id: productId, slug: 'test-p', version: 1 };
      mockProductRepo.findById.mockResolvedValue(product);
      mockProductRepo.update.mockResolvedValue(true);

      const skus = [{ id: 'sku-1' }, { id: 'sku-2' }];
      mockSkuService.findAllByProductId.mockResolvedValue(skus);

      const result = await productService.deleteProduct(productId);

      expect(result).toBe(true);
      // Verify product soft delete
      expect(mockProductRepo.update).toHaveBeenCalledWith(
        productId,
        expect.objectContaining({
          deletedAt: expect.any(Date),
        }),
      );
      // Verify SKUs soft delete
      expect(mockSkuService.deleteByProductId).toHaveBeenCalledWith(
        productId,
        expect.any(Date),
      );
      // Verify Inventory soft delete
      expect(mockInventoryService.delete).toHaveBeenCalledTimes(2);
    });

    it('should throw NotFoundError if product does not exist', async () => {
      mockProductRepo.findById.mockResolvedValue(null);
      await expect(productService.deleteProduct('fake')).rejects.toThrow(
        NotFoundError,
      );
    });
  });
});
