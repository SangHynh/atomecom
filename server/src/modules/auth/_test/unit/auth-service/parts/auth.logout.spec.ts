import { setupAuthServiceTest, mockAuthUser } from '../__fixtures__/auth.fixtures.js';

describe('AuthService - Part 4: logout', () => {
  let { authService, tokenService, sessionService } = setupAuthServiceTest();

  beforeEach(() => {
    ({ authService, tokenService, sessionService } = setupAuthServiceTest());
  });

  it('should logout and revoke token (TC-AUTH-14)', async () => {
    tokenService.verifyRefreshToken.mockResolvedValue({ 
      userId: mockAuthUser.id, 
      sessionId: 's1',
      role: mockAuthUser.role
    } as any);

    await authService.logout('old-refresh-token');

    expect(tokenService.verifyRefreshToken).toHaveBeenCalledWith('old-refresh-token');
    expect(sessionService.revokeRefreshToken).toHaveBeenCalledWith(mockAuthUser.id, 's1');
  });

  it('should still finish even if token verification fails (TC-AUTH-15)', async () => {
    tokenService.verifyRefreshToken.mockRejectedValue(new Error('Invalid token'));
    await authService.logout('bad-token');
    expect(sessionService.revokeRefreshToken).not.toHaveBeenCalled();
  });

  it('should not call revoke if payload is missing sessionId (TC-AUTH-15-2)', async () => {
    tokenService.verifyRefreshToken.mockResolvedValue({ userId: '1' } as any);
    await authService.logout('token');
    expect(sessionService.revokeRefreshToken).not.toHaveBeenCalled();
  });
});
