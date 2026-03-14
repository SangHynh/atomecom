import { setupProductServiceTest, getMockProduct } from '../__fixtures__/product.fixtures.js';
import { NotFoundError } from '@shared/core/error.response.js';

describe('ProductService - Part 3: deleteProduct', () => {
  let { productService, mockProductRepo, mockSkuService, mockInventoryService } = setupProductServiceTest();

  beforeEach(() => {
    ({ productService, mockProductRepo, mockSkuService, mockInventoryService } = setupProductServiceTest());
  });

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
