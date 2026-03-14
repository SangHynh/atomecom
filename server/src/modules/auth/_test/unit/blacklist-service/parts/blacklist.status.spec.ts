import { setupBlacklistServiceTest, mockIp, mockKey } from '../__fixtures__/blacklist.fixtures.js';
import type { IPStatus } from '@modules/auth/use-cases/blacklist.service.js';

describe('BlacklistService - Part 2: checkStatus', () => {
  let { blacklistService, mockCache } = setupBlacklistServiceTest();

  beforeEach(() => {
    ({ blacklistService, mockCache } = setupBlacklistServiceTest());
  });

  it('should allow clean IPs', async () => {
    mockCache.get.mockResolvedValue(null);
    const result = await blacklistService.checkStatus(mockIp);
    expect(result).toEqual({ isBanned: false });
  });

  it('should block banned IPs', async () => {
    const bannedStatus: IPStatus = {
      ip: mockIp,
      violationCount: 3,
      lastViolationAt: Date.now(),
      isBanned: true,
      bannedUntil: Date.now() + 10000,
    };
    mockCache.get.mockResolvedValue(bannedStatus);

    const result = await blacklistService.checkStatus(mockIp);
    expect(result).toEqual({ isBanned: true });
  });

  it('should clear expired bans', async () => {
    const expiredStatus: IPStatus = {
      ip: mockIp,
      violationCount: 3,
      lastViolationAt: Date.now() - 100000,
      isBanned: true,
      bannedUntil: Date.now() - 1000,
    };
    mockCache.get.mockResolvedValue(expiredStatus);

    const result = await blacklistService.checkStatus(mockIp);
    expect(result).toEqual({ isBanned: false });
    expect(mockCache.del).toHaveBeenCalledWith(mockKey);
  });

  it('should return correct limits for throttled IPs', async () => {
    mockCache.get.mockResolvedValue({
      ip: mockIp,
      violationCount: 1,
      isBanned: false,
    });
    expect(await blacklistService.checkStatus(mockIp)).toEqual({
      isBanned: false,
      limit: 5,
    });

    mockCache.get.mockResolvedValue({
      ip: mockIp,
      violationCount: 2,
      isBanned: false,
    });
    expect(await blacklistService.checkStatus(mockIp)).toEqual({
      isBanned: false,
      limit: 1,
    });
  });
});
