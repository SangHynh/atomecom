import { SessionService, type AuthSession } from '@modules/auth/use-cases/session.service.js';
import type { ICacheRepo } from '@shared/interfaces/ICache.repo.js';

export const createMockCache = () => ({
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  deleteByPattern: jest.fn(),
  countByPattern: jest.fn(),
  getKeysByPattern: jest.fn(),
} as unknown as jest.Mocked<ICacheRepo>);

export const setupSessionServiceTest = () => {
  const mockCache = createMockCache();
  const sessionService = new SessionService(mockCache);

  return {
    sessionService,
    mockCache,
  };
};

export const getMockSession = (): AuthSession => ({
  sessionId: 'session-123',
  userId: 'user-456',
  refreshToken: 'current-rt',
  refreshTokensUsed: ['old-rt-1'],
  expiresAt: Date.now() + 100000,
  createdAt: Date.now(),
});
