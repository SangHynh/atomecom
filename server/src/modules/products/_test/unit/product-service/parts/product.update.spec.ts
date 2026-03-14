import { setupProductServiceTest, getMockProduct } from '../__fixtures__/product.fixtures.js';
import { ConflictError, NotFoundError } from '@shared/core/error.response.js';

describe('ProductService - Part 2: updateProduct', () => {
  let { productService, mockProductRepo, mockCategoryService } = setupProductServiceTest();

  beforeEach(() => {
    ({ productService, mockProductRepo, mockCategoryService } = setupProductServiceTest());
  });

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
