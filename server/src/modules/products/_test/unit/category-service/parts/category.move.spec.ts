import { setupCategoryServiceTest, getMockCategory } from '../__fixtures__/category.fixtures.js';
import { BadRequestError } from '@shared/core/error.response.js';

describe('CategoryService - Part 3: move', () => {
  let { categoryService, mockCategoryRepo } = setupCategoryServiceTest();

  beforeEach(() => {
    ({ categoryService, mockCategoryRepo } = setupCategoryServiceTest());
  });

  it('should move category to a new parent (TC-CAT-04)', async () => {
    const category = getMockCategory();
    const newParentPath = ',new-parent,';
    mockCategoryRepo.findById.mockResolvedValue(category);
    mockCategoryRepo.findByPath.mockResolvedValue({
      id: 'new-parent',
      path: newParentPath,
    });
    mockCategoryRepo.update.mockImplementation((id: string, data: any) =>
      Promise.resolve({ ...category, ...data }),
    );
    mockCategoryRepo.findAllDescendants.mockResolvedValue([]);

    const result = await categoryService.move(category.id, {
      parentPath: newParentPath,
      version: 1,
    });

    expect(result?.path).toBe(`${newParentPath}${category.id},`);
    expect(mockCategoryRepo.updateSubtreePath).toHaveBeenCalled();
  });

  it('should throw BadRequestError when moving into itself (TC-CAT-05)', async () => {
    const category = getMockCategory();
    mockCategoryRepo.findById.mockResolvedValue(category);

    await expect(
      categoryService.move(category.id, {
        parentPath: category.path,
        version: 1,
      }),
    ).rejects.toThrow(BadRequestError);
  });

  it('should throw BadRequestError when moving into its own descendant (TC-CAT-06)', async () => {
    const category = getMockCategory();
    const descendantPath = ',cat-123,sub-cat,';
    mockCategoryRepo.findById.mockResolvedValue(category);
    mockCategoryRepo.findByPath.mockResolvedValue({
      id: 'sub-cat',
      path: descendantPath,
    });

    await expect(
      categoryService.move(category.id, {
        parentPath: descendantPath,
        version: 1,
      }),
    ).rejects.toThrow(BadRequestError);
  });

  it('should return early if moving to same parent (TC-CAT-13)', async () => {
    const childPath = ',p1,c1,';
    const cat = { ...getMockCategory(), id: 'c1', path: childPath };
    mockCategoryRepo.findById.mockResolvedValue(cat);

    const result = await categoryService.move('c1', {
      parentPath: ',p1,',
      version: 1,
    });

    expect(result).toEqual(cat);
    expect(mockCategoryRepo.update).not.toHaveBeenCalled();
  });

  it('should throw BadRequestError if move exceeds max level (TC-CAT-14)', async () => {
    const category = getMockCategory();
    mockCategoryRepo.findById.mockResolvedValue(category);
    mockCategoryRepo.findByPath.mockResolvedValue({
      id: 'p4',
      path: ',1,2,3,4,',
    });
    // Subtree depth: 2
    mockCategoryRepo.findAllDescendants.mockResolvedValue([
      { path: ',cat-123,sub1,' },
      { path: ',cat-123,sub1,sub2,' },
    ]);

    await expect(
      categoryService.move(category.id, {
        parentPath: ',1,2,3,4,',
        version: 1,
      }),
    ).rejects.toThrow(BadRequestError);
  });

  it('should compensate if subtree update fails (TC-CAT-15)', async () => {
    const category = getMockCategory();
    mockCategoryRepo.findById.mockResolvedValue(category);
    mockCategoryRepo.findByPath.mockResolvedValue({
      id: 'p1',
      path: ',p1,',
    });
    
    // First update (parent change) succeeds
    mockCategoryRepo.update.mockResolvedValueOnce({ ...category, path: ',p1,cat-123,' });
    // Second update (compensation) must also return a promise
    mockCategoryRepo.update.mockResolvedValueOnce(category);
    
    mockCategoryRepo.updateSubtreePath.mockRejectedValue(new Error('DB Failed'));
    mockCategoryRepo.findAllDescendants.mockResolvedValue([]);

    await expect(
      categoryService.move(category.id, { parentPath: ',p1,', version: 1 }),
    ).rejects.toThrow('DB Failed');

    expect(mockCategoryRepo.update).toHaveBeenCalledTimes(2); 
  });
});
