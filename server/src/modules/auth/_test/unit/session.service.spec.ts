import { SessionService, type AuthSession } from '@modules/auth/use-cases/session.service.js';
import type { ICacheRepo } from '@shared/interfaces/ICache.repo.js';
import { UnauthorizedError } from '@shared/core/error.response.js';
import { ErrorAuthCodes } from '@shared/core/error.enum.js';

describe('SessionService', () => {
  let sessionService: SessionService;
  let mockCache: jest.Mocked<ICacheRepo>;

  beforeEach(() => {
    mockCache = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      deleteByPattern: jest.fn(),
    } as any;
    sessionService = new SessionService(mockCache);
  });

  const mockSession: AuthSession = {
    sessionId: 'session-123',
    userId: 'user-456',
    refreshToken: 'current-rt',
    refreshTokensUsed: ['old-rt-1'],
    expiresAt: Date.now() + 100000,
  };

  describe('handleRefreshToken', () => {
    it('should rotate token if valid', async () => {
      mockCache.get.mockResolvedValue(mockSession);
      await sessionService.handleRefreshToken('user-456', 'session-123', 'current-rt', 'new-rt', mockSession.expiresAt);
      expect(mockCache.set).toHaveBeenCalled();
    });

    it('should detect reuse and revoke sessions', async () => {
      mockCache.get.mockResolvedValue(mockSession);
      await expect(sessionService.handleRefreshToken('user-456', 'session-123', 'old-rt-1', 'attack', mockSession.expiresAt))
        .rejects.toThrow(UnauthorizedError);
      expect(mockCache.deleteByPattern).toHaveBeenCalled();
    });
  });
});
