import { setupSessionServiceTest, getMockSession } from '../__fixtures__/session.fixtures.js';
import { UnauthorizedError } from '@shared/core/error.response.js';
import type { AuthSession } from '@modules/auth/use-cases/session.service.js';

describe('SessionService - Part 1: handleRefreshToken', () => {
  let { sessionService, mockCache } = setupSessionServiceTest();

  beforeEach(() => {
    ({ sessionService, mockCache } = setupSessionServiceTest());
  });

  it('should rotate token if valid (TC-SES-01)', async () => {
    const session = getMockSession();
    mockCache.get.mockResolvedValue(session);
    await sessionService.handleRefreshToken(
      session.userId,
      session.sessionId,
      session.refreshToken,
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
        session.userId,
        session.sessionId,
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
        session.userId,
        session.sessionId,
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
      sessionWithLeeway.userId,
      sessionWithLeeway.sessionId,
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
      sessionWithManyUsed.userId,
      sessionWithManyUsed.sessionId,
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
