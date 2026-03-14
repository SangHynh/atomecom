import { setupSessionServiceTest, getMockSession } from '../__fixtures__/session.fixtures.js';

describe('SessionService - Part 2: Utility Methods', () => {
  let { sessionService, mockCache } = setupSessionServiceTest();

  beforeEach(() => {
    ({ sessionService, mockCache } = setupSessionServiceTest());
  });

  it('should save refresh token to cache (TC-SES-07)', async () => {
    const session = getMockSession();
    await sessionService.saveRefreshTokenToCache(session, 3600);
    expect(mockCache.set).toHaveBeenCalledWith(
      expect.stringContaining(session.sessionId),
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
