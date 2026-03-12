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

  describe('findById/findBySlug', () => {
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
  });

  describe('findAll', () => {
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

  describe('update', () => {
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
});
