import { setupSkuServiceTest, getMockSku } from '../__fixtures__/sku.fixtures.js';
import { ConflictError } from '@shared/core/error.response.js';

describe('SkuService - Part 2: update', () => {
  let { skuService, mockSkuRepo } = setupSkuServiceTest();

  beforeEach(() => {
    ({ skuService, mockSkuRepo } = setupSkuServiceTest());
  });

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
