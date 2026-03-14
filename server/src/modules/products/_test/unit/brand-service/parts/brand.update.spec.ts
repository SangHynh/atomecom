import { setupBrandServiceTest } from '../__fixtures__/brand.fixtures.js';
import { ConflictError, NotFoundError } from '@shared/core/error.response.js';

describe('BrandService - Part 2: update', () => {
  let { brandService, mockBrandRepo } = setupBrandServiceTest();

  beforeEach(() => {
    ({ brandService, mockBrandRepo } = setupBrandServiceTest());
  });

  const brand = { id: 'b1', slug: 'old-slug' };

  it('should update successfully (TC-BRD-09)', async () => {
    mockBrandRepo.findById.mockResolvedValue(brand);
    mockBrandRepo.update.mockResolvedValue({ ...brand, name: 'New' });

    const result = await brandService.update('b1', { name: 'New', version: 1 });

    expect(result?.name).toBe('New');
    expect(mockBrandRepo.findBySlug).not.toHaveBeenCalled();
  });

  it('should throw ConflictError if new slug exists (TC-BRD-10)', async () => {
    mockBrandRepo.findById.mockResolvedValue(brand);
    mockBrandRepo.findBySlug.mockResolvedValue({ id: 'b2' });

    await expect(
      brandService.update('b1', { slug: 'new-slug', version: 1 }),
    ).rejects.toThrow(ConflictError);
  });

  it('should throw NotFoundError if brand not found (TC-BRD-11)', async () => {
    mockBrandRepo.findById.mockResolvedValue(null);
    await expect(brandService.update('fake', { version: 1 })).rejects.toThrow(NotFoundError);
  });
});
