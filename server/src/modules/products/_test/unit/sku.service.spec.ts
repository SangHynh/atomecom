import { SkuService } from '../../use-cases/services/sku.service.js';
import { NotFoundError, ConflictError } from '@shared/core/error.response.js';

describe('SkuService', () => {
  let skuService: SkuService;
  let mockSkuRepo: any;

  beforeEach(() => {
    mockSkuRepo = {
      findById: jest.fn(),
      findBySkuCode: jest.fn(),
      findAllByProductId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      deleteByProductId: jest.fn(),
      hardDelete: jest.fn().mockResolvedValue(true),
    };
    skuService = new SkuService({ skuRepo: mockSkuRepo });
  });

  const getMockSku = () => ({
    id: 'sku-123',
    productId: 'prod-123',
    skuCode: 'SKU-OLD',
    price: { basePrice: 100, salePrice: 90 },
    version: 1,
  });

  describe('create', () => {
    it('should create SKU successfully (TC-SKU-01)', async () => {
      const sku = getMockSku();
      mockSkuRepo.create.mockResolvedValue(sku);
      const result = await skuService.create(sku as any);
      expect(result).toEqual(sku);
      expect(mockSkuRepo.create).toHaveBeenCalledWith(sku);
    });
  });

  describe('Proxy Methods', () => {
    it('should find all by product id (TC-SKU-02)', async () => {
      const skus = [getMockSku()];
      mockSkuRepo.findAllByProductId.mockResolvedValue(skus);
      const result = await skuService.findAllByProductId('p1');
      expect(result).toEqual(skus);
    });

    it('should find by id (TC-SKU-10)', async () => {
      const sku = getMockSku();
      mockSkuRepo.findById.mockResolvedValue(sku);
      expect(await skuService.findById('s1')).toEqual(sku);
    });

    it('should find by sku code (TC-SKU-11)', async () => {
      const sku = getMockSku();
      mockSkuRepo.findBySkuCode.mockResolvedValue(sku);
      expect(await skuService.findBySkuCode('SKU-1')).toEqual(sku);
    });

    it('should bulk delete by product id (TC-SKU-08)', async () => {
      mockSkuRepo.deleteByProductId.mockResolvedValue(true);
      const res = await skuService.deleteByProductId('p1');
      expect(res).toBe(true);
      expect(mockSkuRepo.deleteByProductId).toHaveBeenCalledWith('p1', expect.any(Date));
    });

    it('should hard delete (TC-SKU-09)', async () => {
      mockSkuRepo.hardDelete.mockResolvedValue(true);
      expect(await skuService.hardDelete('s1')).toBe(true);
    });
  });

  describe('update', () => {
    it('should update basic info successfully (TC-SKU-03)', async () => {
      const sku = getMockSku();
      mockSkuRepo.findById.mockResolvedValue(sku);
      mockSkuRepo.update.mockResolvedValue({ ...sku, barcode: '123456' });
      
      const result = await skuService.update('s1', { barcode: '123456', version: 1 } as any);
      expect(result?.barcode).toBe('123456');
      expect(mockSkuRepo.findBySkuCode).not.toHaveBeenCalled();
    });

    it('should throw ConflictError if new skuCode exists (TC-SKU-04)', async () => {
      const sku = getMockSku();
      mockSkuRepo.findById.mockResolvedValue(sku);
      mockSkuRepo.findBySkuCode.mockResolvedValue({ id: 'other' });

      await expect(skuService.update('s1', { skuCode: 'SKU-NEW', version: 1 } as any))
        .rejects.toThrow(ConflictError);
    });
  });

  describe('updatePrice', () => {
    it('should update price and push history (TC-SKU-05)', async () => {
      const sku = getMockSku();
      mockSkuRepo.findById.mockResolvedValue(sku);
      mockSkuRepo.update.mockResolvedValue(true);

      const dto = { basePrice: 200, salePrice: 180, reason: 'Sale', version: 1 };
      await skuService.updatePrice('s1', dto);

      expect(mockSkuRepo.update).toHaveBeenCalledWith('s1', expect.objectContaining({
        price: { basePrice: 200, salePrice: 180 },
        $push: {
          priceHistory: expect.objectContaining({
            basePrice: 200,
            salePrice: 180,
            reason: 'Sale',
            type: 'MANUAL'
          })
        }
      }));
    });

    it('should throw NotFoundError if SKU not found (TC-SKU-06)', async () => {
      mockSkuRepo.findById.mockResolvedValue(null);
      await expect(skuService.updatePrice('fake', { basePrice: 1, reason: 'R', version: 1 }))
        .rejects.toThrow(NotFoundError);
    });
  });

  describe('delete', () => {
    it('should soft delete and rename skuCode (TC-SKU-07)', async () => {
      const sku = getMockSku();
      mockSkuRepo.findById.mockResolvedValue(sku);
      mockSkuRepo.update.mockResolvedValue(true);

      const result = await skuService.delete(sku.id);
      expect(result).toBe(true);
      expect(mockSkuRepo.update).toHaveBeenCalledWith(
        sku.id,
        expect.objectContaining({
          skuCode: expect.stringContaining('SKU-OLD-deleted-'),
          deletedAt: expect.any(Date)
        })
      );
    });
  });
});
