import { setupSkuServiceTest, getMockSku } from '../__fixtures__/sku.fixtures.js';

describe('SkuService - Part 5: Query Methods', () => {
  let { skuService, mockSkuRepo } = setupSkuServiceTest();

  beforeEach(() => {
    ({ skuService, mockSkuRepo } = setupSkuServiceTest());
  });

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
});
