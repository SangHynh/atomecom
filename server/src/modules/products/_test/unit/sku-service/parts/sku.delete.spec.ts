import { setupSkuServiceTest, getMockSku } from '../__fixtures__/sku.fixtures.js';

describe('SkuService - Part 4: delete', () => {
  let { skuService, mockSkuRepo } = setupSkuServiceTest();

  beforeEach(() => {
    ({ skuService, mockSkuRepo } = setupSkuServiceTest());
  });

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
