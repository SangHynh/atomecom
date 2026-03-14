import { setupProductServiceTest, getMockProduct } from '../__fixtures__/product.fixtures.js';

describe('ProductService - Part 4: Query Methods', () => {
  let { productService, mockProductRepo } = setupProductServiceTest();

  beforeEach(() => {
    ({ productService, mockProductRepo } = setupProductServiceTest());
  });

  it('should return paginated result (TC-PRD-13)', async () => {
    mockProductRepo.findAll.mockResolvedValue({
      data: [{ name: 'P1' }],
      totalElements: 10,
    });

    const result = await productService.findAll({ page: 2, limit: 5 });
    expect(result.pagination.totalPages).toBe(2);
    expect(mockProductRepo.findAll).toHaveBeenCalledWith(expect.objectContaining({ offset: 5 }));
  });

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
