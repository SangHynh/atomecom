import {
  SessionService,
  type AuthSession,
} from '@modules/auth/use-cases/session.service.js';
import type { ICacheRepo } from '@shared/interfaces/ICache.repo.js';
import { UnauthorizedError } from '@shared/core/error.response.js';
import { ErrorAuthCodes } from '@atomecom/shared';

describe('SessionService', () => {
  let sessionService: SessionService;
  let mockCache: jest.Mocked<ICacheRepo>;

  beforeEach(() => {
    mockCache = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      deleteByPattern: jest.fn(),
      countByPattern: jest.fn(),
      getKeysByPattern: jest.fn(),
    } as any;
    sessionService = new SessionService(mockCache);
  });

  const getMockSession = (): AuthSession => ({
    sessionId: 'session-123',
    userId: 'user-456',
    refreshToken: 'current-rt',
    refreshTokensUsed: ['old-rt-1'],
    expiresAt: Date.now() + 100000,
    createdAt: Date.now(),
  });

  describe('handleRefreshToken', () => {
    it('should rotate token if valid (TC-SES-01)', async () => {
      const session = getMockSession();
      mockCache.get.mockResolvedValue(session);
      await sessionService.handleRefreshToken(
        'user-456',
        'session-123',
        'current-rt',
        'new-rt',
        session.expiresAt,
      );
      expect(mockCache.set).toHaveBeenCalled();
    });

    it('should detect reuse and revoke sessions (TC-SES-02)', async () => {
      const session = getMockSession();
      mockCache.get.mockResolvedValue(session);
      await expect(
        sessionService.handleRefreshToken(
          'user-456',
          'session-123',
          'old-rt-1',
          'attack',
          session.expiresAt,
        ),
      ).rejects.toThrow(UnauthorizedError);
      expect(mockCache.deleteByPattern).toHaveBeenCalled();
    });

    it('should throw UnauthorizedError if session missing (TC-SES-03)', async () => {
      mockCache.get.mockResolvedValue(null);
      await expect(
        sessionService.handleRefreshToken('u1', 's1', 'rt', 'nt', 1000),
      ).rejects.toThrow(UnauthorizedError);
    });

    it('should throw UnauthorizedError if token mismatch (TC-SES-04)', async () => {
      const session = getMockSession();
      mockCache.get.mockResolvedValue(session);
      await expect(
        sessionService.handleRefreshToken(
          'user-456',
          'session-123',
          'wrong-rt',
          'new-rt',
          session.expiresAt,
        ),
      ).rejects.toThrow(UnauthorizedError);
    });

    it('should handle leeway window gracefully (TC-SES-05)', async () => {
      const sessionWithLeeway = {
        ...getMockSession(),
        lastRefreshToken: 'rotated-rt',
        lastTokenValidUntil: Date.now() + 10000,
      };
      mockCache.get.mockResolvedValue(sessionWithLeeway);
      
      await sessionService.handleRefreshToken(
        'user-456',
        'session-123',
        'rotated-rt',
        'another-new-rt',
        sessionWithLeeway.expiresAt,
      );
      
      expect(mockCache.set).not.toHaveBeenCalled();
    });

    it('should prune used tokens history (TC-SES-06)', async () => {
      const sessionWithManyUsed = {
        ...getMockSession(),
        refreshTokensUsed: ['t1', 't2', 't3', 't4', 't5'],
      };
      mockCache.get.mockResolvedValue(sessionWithManyUsed);
      
      await sessionService.handleRefreshToken(
        'user-456',
        'session-123',
        'current-rt',
        'new-rt',
        sessionWithManyUsed.expiresAt,
      );
      
      expect(mockCache.set).toHaveBeenCalled();
      const calls = (mockCache.set as jest.Mock).mock.calls;
      const savedSession = calls[0][1] as AuthSession;
      expect(savedSession.refreshTokensUsed.length).toBe(5);
      expect(savedSession.refreshTokensUsed[0]).toBe('t2');
    });
  });

  describe('Utility Methods (TC-SES-07 to 10)', () => {
    it('should save refresh token to cache (TC-SES-07)', async () => {
      const session = getMockSession();
      await sessionService.saveRefreshTokenToCache(session, 3600);
      expect(mockCache.set).toHaveBeenCalledWith(
        expect.stringContaining('session-123'),
        session,
        3600
      );
    });

    it('should revoke refresh token (TC-SES-08)', async () => {
      await sessionService.revokeRefreshToken('u1', 's1');
      expect(mockCache.del).toHaveBeenCalledWith(expect.stringContaining('s1'));
    });

    it('should revoke all user sessions (TC-SES-09)', async () => {
      await sessionService.revokeAllUserSessions('u1');
      expect(mockCache.deleteByPattern).toHaveBeenCalledWith(expect.stringContaining('u1'));
    });

    it('should count sessions (TC-SES-10)', async () => {
      mockCache.countByPattern.mockResolvedValue(3);
      const count = await sessionService.countSessions('u1');
      expect(count).toBe(3);
    });
  });

  describe('revokeOldestSession (TC-SES-11, 12)', () => {
    it('should revoke the oldest session based on createdAt (TC-SES-11)', async () => {
      const session1 = { ...getMockSession(), sessionId: 's1', createdAt: 1000 };
      const session2 = { ...getMockSession(), sessionId: 's2', createdAt: 500 };
      const session3 = { ...getMockSession(), sessionId: 's3', createdAt: 1500 };

      mockCache.getKeysByPattern.mockResolvedValue(['k1', 'k2', 'k3']);
      mockCache.get.mockImplementation(async (key) => {
        if (key === 'k1') return session1;
        if (key === 'k2') return session2;
        if (key === 'k3') return session3;
        return null;
      });

      await sessionService.revokeOldestSession('user-456');

      expect(mockCache.del).toHaveBeenCalledWith(expect.stringContaining('s2'));
    });

    it('should return early if no sessions found (TC-SES-12)', async () => {
      mockCache.getKeysByPattern.mockResolvedValue([]);
      await sessionService.revokeOldestSession('u1');
      expect(mockCache.del).not.toHaveBeenCalled();
    });
  });
});
