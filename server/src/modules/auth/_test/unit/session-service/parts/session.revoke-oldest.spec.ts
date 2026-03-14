import { setupSessionServiceTest, getMockSession } from '../__fixtures__/session.fixtures.js';

describe('SessionService - Part 3: revokeOldestSession', () => {
  let { sessionService, mockCache } = setupSessionServiceTest();

  beforeEach(() => {
    ({ sessionService, mockCache } = setupSessionServiceTest());
  });

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
