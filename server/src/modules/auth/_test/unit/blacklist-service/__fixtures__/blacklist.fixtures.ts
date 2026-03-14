import { BlacklistService } from '@modules/auth/use-cases/blacklist.service.js';
import type { ICacheRepo } from '@shared/interfaces/ICache.repo.js';

export const createMockCache = () => ({
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
} as unknown as jest.Mocked<ICacheRepo>);

export const setupBlacklistServiceTest = () => {
  const mockCache = createMockCache();
  const blacklistService = new BlacklistService(mockCache);

  return {
    blacklistService,
    mockCache,
  };
};

export const mockIp = '127.0.0.1';
export const mockKey = `blacklist:ip:${mockIp}`;
