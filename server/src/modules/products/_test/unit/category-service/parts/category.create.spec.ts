import { setupCategoryServiceTest } from '../__fixtures__/category.fixtures.js';
import { PRODUCT_STATUS } from '@atomecom/shared';
import { ConflictError, NotFoundError, BadRequestError } from '@shared/core/error.response.js';

describe('CategoryService - Part 1: create', () => {
  let { categoryService, mockCategoryRepo, mockCacheRepo } = setupCategoryServiceTest();

  beforeEach(() => {
    ({ categoryService, mockCategoryRepo, mockCacheRepo } = setupCategoryServiceTest());
  });

  it('should create a root category successfully (TC-CAT-01)', async () => {
    mockCategoryRepo.findBySlug.mockResolvedValue(null);
    mockCategoryRepo.create.mockImplementation((data: any) =>
      Promise.resolve(data),
    );

    const result = await categoryService.create({
      name: 'Smartphones',
      slug: 'smartphones',
      status: PRODUCT_STATUS.PUBLISHED,
    } as any);

    expect(result.name).toBe('Smartphones');
    expect(result.path).toMatch(/^,[0-9a-f]+,$/i); 
    expect(mockCacheRepo.deleteByPattern).toHaveBeenCalled();
  });

  it('should create a child category successfully (TC-CAT-02)', async () => {
    const parentPath = ',parent-id,';
    mockCategoryRepo.findBySlug.mockResolvedValue(null);
    mockCategoryRepo.findByPath.mockResolvedValue({
      id: 'parent-id',
      path: parentPath,
    });
    mockCategoryRepo.create.mockImplementation((data: any) =>
      Promise.resolve(data),
    );

    const result = await categoryService.create({
      name: 'iPhone',
      slug: 'iphone',
      parentPath,
      status: PRODUCT_STATUS.PUBLISHED,
    } as any);

    expect(result.path).toContain(parentPath);
    expect(result.path.split(',').filter(Boolean).length).toBe(2);
  });

  it('should throw ConflictError if slug exists (TC-CAT-03)', async () => {
    mockCategoryRepo.findBySlug.mockResolvedValue({ id: 'existing' });

    await expect(categoryService.create({ slug: 's' } as any)).rejects.toThrow(
      ConflictError,
    );
  });

  it('should throw NotFoundError if parent category not found (TC-CAT-09)', async () => {
    mockCategoryRepo.findByPath.mockResolvedValue(null);
    await expect(
      categoryService.create({ name: 'N', slug: 's', parentPath: ',fake,', status: 'PUBLISHED' } as any),
    ).rejects.toThrow(NotFoundError);
  });

  it('should throw BadRequestError if max level reached (TC-CAT-10)', async () => {
    mockCategoryRepo.findByPath.mockResolvedValue({
      id: 'p5',
      path: ',1,2,3,4,5,',
    });
    await expect(
      categoryService.create({
        name: 'N',
        slug: 's',
        parentPath: ',1,2,3,4,5,',
        status: 'PUBLISHED'
      } as any),
    ).rejects.toThrow(BadRequestError);
  });
});
