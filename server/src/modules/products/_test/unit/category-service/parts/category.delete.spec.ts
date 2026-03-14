import { setupCategoryServiceTest, getMockCategory } from '../__fixtures__/category.fixtures.js';
import { ConflictError } from '@shared/core/error.response.js';

describe('CategoryService - Part 5: delete', () => {
  let { categoryService, mockCategoryRepo, mockProductRepo, mockCacheRepo } = setupCategoryServiceTest();

  beforeEach(() => {
    ({ categoryService, mockCategoryRepo, mockProductRepo, mockCacheRepo } = setupCategoryServiceTest());
  });

  it('should soft delete category if not in use (TC-CAT-07)', async () => {
    const category = getMockCategory();
    mockCategoryRepo.findById.mockResolvedValue(category);
    mockProductRepo.countByCategoryId.mockResolvedValue(0);
    mockCategoryRepo.update.mockResolvedValue(true);

    const result = await categoryService.delete(category.id);

    expect(result).toBe(true);
    expect(mockCategoryRepo.update).toHaveBeenCalledWith(
      category.id,
      expect.objectContaining({
        deletedAt: expect.any(Date),
        slug: expect.stringContaining(`${category.slug}-deleted`),
      }),
    );
  });

  it('should throw ConflictError if category is in use by products (TC-CAT-08)', async () => {
    const category = getMockCategory();
    mockCategoryRepo.findById.mockResolvedValue(category);
    mockProductRepo.countByCategoryId.mockResolvedValue(5);

    await expect(categoryService.delete(category.id)).rejects.toThrow(
      ConflictError,
    );
  });

  it('should not crash if cache invalidation fails (TC-CAT-19)', async () => {
    mockCacheRepo.deleteByPattern.mockRejectedValue(new Error('Redis Down'));
    const category = getMockCategory();
    mockCategoryRepo.findById.mockResolvedValue(category);
    mockProductRepo.countByCategoryId.mockResolvedValue(0);
    mockCategoryRepo.update.mockResolvedValue(true);

    const result = await categoryService.delete(category.id);
    expect(result).toBe(true);
  });
});
