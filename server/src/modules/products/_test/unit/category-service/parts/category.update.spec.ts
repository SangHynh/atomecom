import { setupCategoryServiceTest, getMockCategory } from '../__fixtures__/category.fixtures.js';
import { ConflictError } from '@shared/core/error.response.js';

describe('CategoryService - Part 2: update', () => {
  let { categoryService, mockCategoryRepo, mockCacheRepo } = setupCategoryServiceTest();

  beforeEach(() => {
    ({ categoryService, mockCategoryRepo, mockCacheRepo } = setupCategoryServiceTest());
  });

  it('should update successfully and invalidate cache (TC-CAT-11)', async () => {
    const category = getMockCategory();
    mockCategoryRepo.findById.mockResolvedValue(category);
    mockCategoryRepo.update.mockResolvedValue({ ...category, name: 'New' });

    await categoryService.update('cat-123', { name: 'New', version: 1 });

    expect(mockCacheRepo.deleteByPattern).toHaveBeenCalled();
  });

  it('should throw ConflictError if slug exists (TC-CAT-12)', async () => {
    const category = getMockCategory();
    mockCategoryRepo.findById.mockResolvedValue(category);
    mockCategoryRepo.findBySlug.mockResolvedValue({ id: 'c2' });

    await expect(
      categoryService.update('cat-123', { slug: 'new', version: 1 }),
    ).rejects.toThrow(ConflictError);
  });
});
