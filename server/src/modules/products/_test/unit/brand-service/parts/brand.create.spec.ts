import { setupBrandServiceTest } from '../__fixtures__/brand.fixtures.js';
import { PRODUCT_STATUS } from '@atomecom/shared';
import { ConflictError } from '@shared/core/error.response.js';

describe('BrandService - Part 1: create', () => {
  let { brandService, mockBrandRepo } = setupBrandServiceTest();

  beforeEach(() => {
    ({ brandService, mockBrandRepo } = setupBrandServiceTest());
  });

  const createDto = {
    name: 'Samsung',
    slug: 'samsung',
    description: 'Global tech giant',
    logo: 'samsung.png',
  };

  it('should create a brand successfully', async () => {
    mockBrandRepo.findBySlug.mockResolvedValue(null);
    mockBrandRepo.create.mockImplementation((data: any) =>
      Promise.resolve(data),
    );

    const result = await brandService.create(createDto as any);

    expect(result.name).toBe(createDto.name);
    expect(result.status).toBe(PRODUCT_STATUS.PUBLISHED);
    expect(mockBrandRepo.create).toHaveBeenCalled();
  });

  it('should throw ConflictError if slug exists', async () => {
    mockBrandRepo.findBySlug.mockResolvedValue({ id: 'brand-1' });

    await expect(brandService.create(createDto as any)).rejects.toThrow(
      ConflictError,
    );
  });
});
