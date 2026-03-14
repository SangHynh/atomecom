import { setupBrandServiceTest } from '../__fixtures__/brand.fixtures.js';

describe('BrandService - Part 4: findById/findBySlug/findAll', () => {
  let { brandService, mockBrandRepo } = setupBrandServiceTest();

  beforeEach(() => {
    ({ brandService, mockBrandRepo } = setupBrandServiceTest());
  });

  it('should return brand by id (TC-BRD-06)', async () => {
    const brand = { id: 'b1', name: 'B1' };
    mockBrandRepo.findById.mockResolvedValue(brand);
    const result = await brandService.findById('b1');
    expect(result).toEqual(brand);
  });

  it('should return brand by slug (TC-BRD-07)', async () => {
    const brand = { id: 'b1', slug: 's1' };
    mockBrandRepo.findBySlug.mockResolvedValue(brand);
    const result = await brandService.findBySlug('s1');
    expect(result).toEqual(brand);
  });

  it('should return paginated result (TC-BRD-08)', async () => {
    mockBrandRepo.findAll.mockResolvedValue({
      data: [{ name: 'B1' }],
      totalElements: 20,
    });

    const result = await brandService.findAll({ page: 2, limit: 10 });

    expect(result.pagination.currentPage).toBe(2);
    expect(result.pagination.totalPages).toBe(2);
    expect(mockBrandRepo.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ offset: 10, limit: 10 }),
    );
  });
});
