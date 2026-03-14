import { setupBrandServiceTest } from '../__fixtures__/brand.fixtures.js';
import { NotFoundError, ConflictError } from '@shared/core/error.response.js';

describe('BrandService - Part 3: delete', () => {
  let { brandService, mockBrandRepo, mockProductRepo } = setupBrandServiceTest();

  beforeEach(() => {
    ({ brandService, mockBrandRepo, mockProductRepo } = setupBrandServiceTest());
  });

  const brandId = 'brand-123';
  const brand = { id: brandId, name: 'Samsung', slug: 'samsung', version: 1 };

  it('should soft delete brand if not in use', async () => {
    mockBrandRepo.findById.mockResolvedValue(brand);
    mockProductRepo.countByBrandId.mockResolvedValue(0);
    mockBrandRepo.update.mockResolvedValue(true);

    const result = await brandService.delete(brandId);

    expect(result).toBe(true);
    expect(mockBrandRepo.update).toHaveBeenCalledWith(
      brandId,
      expect.objectContaining({
        deletedAt: expect.any(Date),
        slug: expect.stringContaining('samsung-deleted'),
      }),
    );
  });

  it('should throw ConflictError if brand is in use', async () => {
    mockBrandRepo.findById.mockResolvedValue(brand);
    mockProductRepo.countByBrandId.mockResolvedValue(10);

    await expect(brandService.delete(brandId)).rejects.toThrow(ConflictError);
  });

  it('should throw NotFoundError if brand does not exist', async () => {
    mockBrandRepo.findById.mockResolvedValue(null);

    await expect(brandService.delete('fake')).rejects.toThrow(NotFoundError);
  });
});
