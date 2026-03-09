import { InventoryService } from '../../use-cases/inventory.service.js';
import { ConflictError, NotFoundError } from '@shared/core/error.response.js';

describe('InventoryService', () => {
  let inventoryService: InventoryService;
  let mockInventoryRepo: any;
  let mockCacheRepo: any;

  beforeEach(() => {
    mockInventoryRepo = {
      reserveStock: jest.fn(),
      releaseStock: jest.fn(),
      confirmStock: jest.fn(),
      updateStock: jest.fn(),
      findBySkuId: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    };
    mockCacheRepo = {
      waitAndAcquire: jest.fn(),
      releaseLock: jest.fn(),
    };

    inventoryService = new InventoryService({
      inventoryRepo: mockInventoryRepo,
      cacheRepo: mockCacheRepo,
    });
  });

  describe('reserveProductStock', () => {
    const skuId = 'sku-123';
    const quantity = 5;

    it('should successfully reserve stock when lock is acquired and repo succeeds', async () => {
      mockCacheRepo.waitAndAcquire.mockResolvedValue(true);
      mockInventoryRepo.reserveStock.mockResolvedValue(true);

      const result = await inventoryService.reserveProductStock(
        skuId,
        quantity,
      );

      expect(result).toBe(true);
      expect(mockCacheRepo.waitAndAcquire).toHaveBeenCalled();
      expect(mockInventoryRepo.reserveStock).toHaveBeenCalledWith(
        skuId,
        quantity,
      );
      expect(mockCacheRepo.releaseLock).toHaveBeenCalled();
    });

    it('should throw ConflictError if lock cannot be acquired', async () => {
      mockCacheRepo.waitAndAcquire.mockResolvedValue(false);

      await expect(
        inventoryService.reserveProductStock(skuId, quantity),
      ).rejects.toThrow(ConflictError);

      expect(mockInventoryRepo.reserveStock).not.toHaveBeenCalled();
    });

    it('should release lock even if repo fails', async () => {
      mockCacheRepo.waitAndAcquire.mockResolvedValue(true);
      mockInventoryRepo.reserveStock.mockRejectedValue(new Error('DB Error'));

      await expect(
        inventoryService.reserveProductStock(skuId, quantity),
      ).rejects.toThrow('DB Error');

      expect(mockCacheRepo.releaseLock).toHaveBeenCalled();
    });
  });

  describe('addStock', () => {
    it('should call updateStock if inventory exists', async () => {
      mockInventoryRepo.findBySkuId.mockResolvedValue({ skuId: 'sku-1' });

      await inventoryService.addStock('sku-1', 10);

      expect(mockInventoryRepo.updateStock).toHaveBeenCalledWith(
        'sku-1',
        10,
        0,
      );
    });

    it('should throw NotFoundError if inventory does not exist', async () => {
      mockInventoryRepo.findBySkuId.mockResolvedValue(null);

      await expect(inventoryService.addStock('sku-1', 10)).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe('delete', () => {
    it('should call repo delete if inventory exists', async () => {
      mockInventoryRepo.findBySkuId.mockResolvedValue({ skuId: 'sku-1' });
      mockInventoryRepo.delete.mockResolvedValue(true);

      const result = await inventoryService.delete('sku-1');

      expect(result).toBe(true);
      expect(mockInventoryRepo.delete).toHaveBeenCalled();
    });

    it('should throw NotFoundError if inventory does not exist', async () => {
      mockInventoryRepo.findBySkuId.mockResolvedValue(null);

      await expect(inventoryService.delete('sku-1')).rejects.toThrow(
        NotFoundError,
      );
    });
  });
});
