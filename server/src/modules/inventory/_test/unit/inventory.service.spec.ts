import { InventoryService } from '../../use-cases/inventory.service.js';
import { ConflictError, NotFoundError, BadRequestError } from '@shared/core/error.response.js';

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

    it('should successfully reserve stock when lock is acquired and repo succeeds (TC-INV-01)', async () => {
      mockCacheRepo.waitAndAcquire.mockResolvedValue(true);
      mockInventoryRepo.reserveStock.mockResolvedValue(true);

      const result = await inventoryService.reserveProductStock(skuId, quantity);

      expect(result).toBe(true);
      expect(mockCacheRepo.waitAndAcquire).toHaveBeenCalled();
      expect(mockInventoryRepo.reserveStock).toHaveBeenCalledWith(skuId, quantity);
      expect(mockCacheRepo.releaseLock).toHaveBeenCalled();
    });

    it('should throw ConflictError if lock cannot be acquired (TC-INV-02)', async () => {
      mockCacheRepo.waitAndAcquire.mockResolvedValue(false);

      await expect(inventoryService.reserveProductStock(skuId, quantity)).rejects.toThrow(ConflictError);
      expect(mockInventoryRepo.reserveStock).not.toHaveBeenCalled();
    });

    it('should release lock even if repo fails (TC-INV-03)', async () => {
      mockCacheRepo.waitAndAcquire.mockResolvedValue(true);
      mockInventoryRepo.reserveStock.mockRejectedValue(new Error('DB Error'));

      await expect(inventoryService.reserveProductStock(skuId, quantity)).rejects.toThrow('DB Error');
      expect(mockCacheRepo.releaseLock).toHaveBeenCalled();
    });

    it('should throw BadRequestError if repo returns false (insufficient stock) (TC-INV-04)', async () => {
      mockCacheRepo.waitAndAcquire.mockResolvedValue(true);
      mockInventoryRepo.reserveStock.mockResolvedValue(false);

      await expect(inventoryService.reserveProductStock(skuId, quantity)).rejects.toThrow(BadRequestError);
      expect(mockCacheRepo.releaseLock).toHaveBeenCalled();
    });
  });

  describe('releaseProductStock', () => {
    it('should return true if release succeeds (TC-INV-10)', async () => {
      mockInventoryRepo.releaseStock.mockResolvedValue(true);
      const result = await inventoryService.releaseProductStock('s1', 5);
      expect(result).toBe(true);
    });

    it('should throw BadRequestError if release fails (TC-INV-11)', async () => {
      mockInventoryRepo.releaseStock.mockResolvedValue(false);
      await expect(inventoryService.releaseProductStock('s1', 5)).rejects.toThrow(BadRequestError);
    });
  });

  describe('confirmProductStock', () => {
    it('should return true if confirm succeeds (TC-INV-12)', async () => {
      mockInventoryRepo.confirmStock.mockResolvedValue(true);
      const result = await inventoryService.confirmProductStock('s1', 5);
      expect(result).toBe(true);
    });

    it('should throw BadRequestError if confirm fails (TC-INV-13)', async () => {
      mockInventoryRepo.confirmStock.mockResolvedValue(false);
      await expect(inventoryService.confirmProductStock('s1', 5)).rejects.toThrow(BadRequestError);
    });
  });

  describe('addStock', () => {
    it('should call updateStock if inventory exists (TC-INV-05)', async () => {
      mockInventoryRepo.findBySkuId.mockResolvedValue({ skuId: 'sku-1' });

      await inventoryService.addStock('sku-1', 10);

      expect(mockInventoryRepo.updateStock).toHaveBeenCalledWith('sku-1', 10, 0);
    });

    it('should throw NotFoundError if inventory does not exist (TC-INV-06)', async () => {
      mockInventoryRepo.findBySkuId.mockResolvedValue(null);

      await expect(inventoryService.addStock('sku-1', 10)).rejects.toThrow(NotFoundError);
    });

    it('should throw BadRequestError if amount is <= 0 (TC-INV-07)', async () => {
      await expect(inventoryService.addStock('sku-1', 0)).rejects.toThrow(BadRequestError);
      await expect(inventoryService.addStock('sku-1', -5)).rejects.toThrow(BadRequestError);
      expect(mockInventoryRepo.findBySkuId).not.toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should proxy call to repo create (TC-INV-14)', async () => {
      const inv = { skuId: 's1' };
      mockInventoryRepo.create.mockResolvedValue(inv);
      const result = await inventoryService.create(inv as any);
      expect(result).toEqual(inv);
    });
  });

  describe('findBySkuId', () => {
    it('should proxy call to repo findBySkuId (TC-INV-15)', async () => {
      const inv = { skuId: 's1' };
      mockInventoryRepo.findBySkuId.mockResolvedValue(inv);
      const result = await inventoryService.findBySkuId('s1');
      expect(result).toEqual(inv);
    });
  });

  describe('delete', () => {
    it('should call repo delete if inventory exists (TC-INV-08)', async () => {
      mockInventoryRepo.findBySkuId.mockResolvedValue({ skuId: 'sku-1' });
      mockInventoryRepo.delete.mockResolvedValue(true);

      const result = await inventoryService.delete('sku-1');

      expect(result).toBe(true);
      expect(mockInventoryRepo.delete).toHaveBeenCalled();
    });

    it('should throw NotFoundError if inventory does not exist (TC-INV-09)', async () => {
      mockInventoryRepo.findBySkuId.mockResolvedValue(null);

      await expect(inventoryService.delete('sku-1')).rejects.toThrow(NotFoundError);
    });
  });
});
