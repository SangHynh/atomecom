import { setupBlacklistServiceTest, mockIp, mockKey } from '../__fixtures__/blacklist.fixtures.js';
import type { IPStatus } from '@modules/auth/use-cases/blacklist.service.js';

describe('BlacklistService - Part 1: recordViolation', () => {
  let { blacklistService, mockCache } = setupBlacklistServiceTest();

  beforeEach(() => {
    ({ blacklistService, mockCache } = setupBlacklistServiceTest());
  });

  it('should create a new status on the first violation', async () => {
    mockCache.get.mockResolvedValue(null);
    await blacklistService.recordViolation(mockIp);

    expect(mockCache.set).toHaveBeenCalledWith(
      mockKey,
      expect.objectContaining({
        ip: mockIp,
        violationCount: 1,
        isBanned: false,
      }),
      expect.any(Number),
    );
  });

  it('should increment violation count on subsequent triggers', async () => {
    const existingStatus: IPStatus = {
      ip: mockIp,
      violationCount: 1,
      lastViolationAt: Date.now() - 1000,
      isBanned: false,
    };
    mockCache.get.mockResolvedValue(existingStatus);

    await blacklistService.recordViolation(mockIp);

    expect(mockCache.set).toHaveBeenCalledWith(
      mockKey,
      expect.objectContaining({
        violationCount: 2,
      }),
      expect.any(Number),
    );
  });

  it('should ban the IP at the 3rd violation', async () => {
    const existingStatus: IPStatus = {
      ip: mockIp,
      violationCount: 2,
      lastViolationAt: Date.now() - 1000,
      isBanned: false,
    };
    mockCache.get.mockResolvedValue(existingStatus);

    await blacklistService.recordViolation(mockIp);

    expect(mockCache.set).toHaveBeenCalledWith(
      mockKey,
      expect.objectContaining({
        violationCount: 3,
        isBanned: true,
        bannedUntil: expect.any(Number),
      }),
      24 * 60 * 60,
    );
  });
});
