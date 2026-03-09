import { BrandService } from '../../use-cases/services/brand.service.js';
import { NotFoundError, ConflictError } from '@shared/core/error.response.js';
import { PRODUCT_STATUS } from '@atomecom/shared';

describe('BrandService', () => {
  let brandService: BrandService;
  let mockBrandRepo: any;
  let mockProductRepo: any;

  beforeEach(() => {
    mockBrandRepo = {
      findById: jest.fn(),
      findBySlug: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };
    mockProductRepo = {
      countByBrandId: jest.fn().mockResolvedValue(0),
    };

    brandService = new BrandService({
      brandRepo: mockBrandRepo,
      productRepo: mockProductRepo,
    });
  });

  describe('create', () => {
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

  describe('delete', () => {
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
});
