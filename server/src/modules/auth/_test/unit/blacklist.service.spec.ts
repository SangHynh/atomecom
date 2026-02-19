import {
  BlacklistService,
  type IPStatus,
} from '@modules/auth/use-cases/blacklist.service.js';
import type { ICacheRepo } from '@shared/interfaces/ICache.repo.js';

describe('BlacklistService', () => {
  let blacklistService: BlacklistService;
  let mockCache: jest.Mocked<ICacheRepo>;
  const mockIp = '127.0.0.1';
  const mockKey = 'blacklist:ip:127.0.0.1';

  beforeEach(() => {
    mockCache = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    } as any;
    blacklistService = new BlacklistService(mockCache);
  });

  describe('recordViolation', () => {
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
        24 * 60 * 60, // 24h ban TTL
      );
    });
  });

  describe('checkStatus', () => {
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
      // Level 1: 5 req/min
      mockCache.get.mockResolvedValue({
        ip: mockIp,
        violationCount: 1,
        isBanned: false,
      });
      expect(await blacklistService.checkStatus(mockIp)).toEqual({
        isBanned: false,
        limit: 5,
      });

      // Level 2: 1 req/min
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

  describe('isRateLimited', () => {
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
});
