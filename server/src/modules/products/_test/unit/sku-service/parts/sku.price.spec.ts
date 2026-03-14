import { setupSkuServiceTest, getMockSku } from '../__fixtures__/sku.fixtures.js';
import { NotFoundError } from '@shared/core/error.response.js';

describe('SkuService - Part 3: updatePrice', () => {
  let { skuService, mockSkuRepo } = setupSkuServiceTest();

  beforeEach(() => {
    ({ skuService, mockSkuRepo } = setupSkuServiceTest());
  });

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
