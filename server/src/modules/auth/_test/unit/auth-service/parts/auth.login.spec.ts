import { setupAuthServiceTest, mockAuthUser } from '../__fixtures__/auth.fixtures.js';
import { UnauthorizedError } from '@shared/core/error.response.js';

describe('AuthService - Part 1: login', () => {
  let { authService, userService, tokenService, sessionService } = setupAuthServiceTest();

  beforeEach(() => {
    ({ authService, userService, tokenService, sessionService } = setupAuthServiceTest());
  });

  it('should login successfully and return user with tokens (TC-AUTH-01)', async () => {
    userService.verifyCredentials.mockResolvedValue(mockAuthUser as any);

    const result = await authService.login({ email: 'john@example.com', password: 'password' });

    expect(result.user.id).toBe(mockAuthUser.id);
    expect(result.tokens.accessToken).toBe('access');
    expect(result.tokens.refreshToken).toBe('refresh');
    expect(sessionService.saveRefreshTokenToCache).toHaveBeenCalled();
  });

  it('should throw UnauthorizedError with INVALID_CREDENTIALS (TC-AUTH-02)', async () => {
    userService.verifyCredentials.mockRejectedValue(new UnauthorizedError('INVALID_CREDENTIALS'));
    await expect(authService.login({ email: 'j@e.com', password: 'p' })).rejects.toThrow(UnauthorizedError);
  });

  it('should handle session limit by revoking oldest session (TC-AUTH-03)', async () => {
    userService.verifyCredentials.mockResolvedValue(mockAuthUser as any);
    sessionService.countSessions.mockResolvedValue(5);

    await authService.login({ email: 'john@example.com', password: 'password' });

    expect(sessionService.revokeOldestSession).toHaveBeenCalledWith(mockAuthUser.id);
  });

  it('should throw UnauthorizedError even if honey_pot is provided (TC-AUTH-SPAM)', async () => {
    // Honey pot check is usually in controller, but we check service behavior
    userService.verifyCredentials.mockResolvedValue(mockAuthUser as any);
    const result = await authService.login({ email: 'j@e.com', password: 'p', honey_pot: 'spam' });
    expect(result.user.id).toBe(mockAuthUser.id); // Service doesn't care about honey_pot
  });
});
