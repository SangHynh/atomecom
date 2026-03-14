import { setupBlacklistServiceTest, mockIp } from '../__fixtures__/blacklist.fixtures.js';

describe('BlacklistService - Part 3: isRateLimited', () => {
  let { blacklistService, mockCache } = setupBlacklistServiceTest();

  beforeEach(() => {
    ({ blacklistService, mockCache } = setupBlacklistServiceTest());
  });

  it('should allow requests below the limit and increment counter', async () => {
    mockCache.get.mockResolvedValue(null);
    const result = await blacklistService.isRateLimited(mockIp, 5);

    expect(result).toBe(false);
    expect(mockCache.set).toHaveBeenCalledWith(
      `throttle:ip:${mockIp}`,
      1,
      60,
    );
  });

  it('should return true when the limit is reached', async () => {
    mockCache.get.mockResolvedValue(5);
    const result = await blacklistService.isRateLimited(mockIp, 5);

    expect(result).toBe(true);
    expect(mockCache.set).not.toHaveBeenCalled();
  });
});
