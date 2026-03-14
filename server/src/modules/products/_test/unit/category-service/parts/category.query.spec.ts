import { setupCategoryServiceTest, getMockCategory } from '../__fixtures__/category.fixtures.js';

describe('CategoryService - Part 4: findAll / getDiscoveryTree / Query', () => {
  let { categoryService, mockCategoryRepo, mockCacheRepo } = setupCategoryServiceTest();

  beforeEach(() => {
    ({ categoryService, mockCategoryRepo, mockCacheRepo } = setupCategoryServiceTest());
  });

  it('should handle cache miss in findAll (TC-CAT-16)', async () => {
    mockCacheRepo.get.mockResolvedValue(null);
    mockCategoryRepo.findAll.mockResolvedValue({
      data: [],
      totalElements: 0,
    });

    await categoryService.findAll({});
    expect(mockCacheRepo.set).toHaveBeenCalled();
  });

  it('should handle cache hit in findAll (TC-CAT-17)', async () => {
    const cached = { data: [{ id: 'c1' }], pagination: {} };
    mockCacheRepo.get.mockResolvedValue(cached);

    const result = await categoryService.findAll({});
    expect(result).toEqual(cached);
    expect(mockCategoryRepo.findAll).not.toHaveBeenCalled();
  });

  it('should fetch level 1 and children in getDiscoveryTree (TC-CAT-18)', async () => {
    mockCategoryRepo.findAll.mockResolvedValue({
      data: [{ id: 'root1', path: ',root1,' }],
      totalElements: 1,
    });

    const result = await categoryService.getDiscoveryTree();
    expect(result[0].children).toBeDefined();
    expect(mockCategoryRepo.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ path: ',root1,' }),
    );
  });

  it('should return category by id (TC-CAT-20)', async () => {
    const cat = getMockCategory();
    mockCategoryRepo.findById.mockResolvedValue(cat);
    expect(await categoryService.findById(cat.id)).toEqual(cat);
  });

  it('should return category by slug (TC-CAT-21)', async () => {
    const cat = getMockCategory();
    mockCategoryRepo.findBySlug.mockResolvedValue(cat);
    expect(await categoryService.findBySlug(cat.slug)).toEqual(cat);
  });

  it('should return ancestors (TC-CAT-22)', async () => {
    const path = ',id1,id2,id3,';
    mockCategoryRepo.findByIds.mockResolvedValue([{ id: 'id1' }, { id: 'id2' }]);
    const result = await categoryService.getAncestors(path);
    expect(mockCategoryRepo.findByIds).toHaveBeenCalledWith(['id1', 'id2', 'id3']);
    expect(result.length).toBe(2);
  });

  it('should return category by path (TC-CAT-23)', async () => {
    const cat = getMockCategory();
    mockCategoryRepo.findByPath.mockResolvedValue(cat);
    expect(await categoryService.findByPath(cat.path)).toEqual(cat);
  });
});
