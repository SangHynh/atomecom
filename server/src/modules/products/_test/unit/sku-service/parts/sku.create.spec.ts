import { setupSkuServiceTest, getMockSku } from '../__fixtures__/sku.fixtures.js';

describe('SkuService - Part 1: create', () => {
  let { skuService, mockSkuRepo } = setupSkuServiceTest();

  beforeEach(() => {
    ({ skuService, mockSkuRepo } = setupSkuServiceTest());
  });

  it('should create SKU successfully (TC-SKU-01)', async () => {
    const sku = getMockSku();
    mockSkuRepo.create.mockResolvedValue(sku);
    const result = await skuService.create(sku as any);
    expect(result).toEqual(sku);
    expect(mockSkuRepo.create).toHaveBeenCalledWith(sku);
  });
});
