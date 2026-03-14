import { setupAuthServiceTest, mockAuthUser } from '../__fixtures__/auth.fixtures.js';
import { USER_STATUS } from '@atomecom/shared';
import { UnauthorizedError, ForbiddenError } from '@shared/core/error.response.js';

describe('AuthService - Part 8: socialLogin', () => {
  let { authService, userService, oauthFactory } = setupAuthServiceTest();

  beforeEach(() => {
    ({ authService, userService, oauthFactory } = setupAuthServiceTest());
  });

  it('should login via social provider (TC-AUTH-27)', async () => {
    const mockStrategy = { getProfile: jest.fn().mockResolvedValue({ email: 's@ex.com', name: 'S', provider: 'GOOGLE', providerId: '1' }) };
    oauthFactory.getStrategy.mockReturnValue(mockStrategy as any);
    userService.upsertOAuthUser.mockResolvedValue(mockAuthUser as any);

    const res = await authService.socialLogin('GOOGLE' as any, 'token');
    expect(res.user.id).toBe(mockAuthUser.id);
    expect(res.tokens.accessToken).toBe('access');
  });

  it('should throw UnauthorizedError if oauth token invalid (TC-AUTH-28)', async () => {
    const mockStrategy = { getProfile: jest.fn().mockRejectedValue(new UnauthorizedError('INVALID_OAUTH')) };
    oauthFactory.getStrategy.mockReturnValue(mockStrategy as any);

    await expect(authService.socialLogin('GOOGLE' as any, 'token')).rejects.toThrow(UnauthorizedError);
  });

  it('should throw ForbiddenError if user banned (TC-AUTH-29)', async () => {
    const mockStrategy = { getProfile: jest.fn().mockResolvedValue({ email: 's@ex.com' }) };
    oauthFactory.getStrategy.mockReturnValue(mockStrategy as any);
    userService.upsertOAuthUser.mockResolvedValue({ ...mockAuthUser, status: USER_STATUS.BANNED } as any);

    await expect(authService.socialLogin('GOOGLE' as any, 'token')).rejects.toThrow(ForbiddenError);
  });

  it('should throw Error if provider not supported', async () => {
    oauthFactory.getStrategy.mockImplementation(() => { throw new Error('Unsupported'); });
    await expect(authService.socialLogin('UNKNOWN' as any, 'tok')).rejects.toThrow();
  });
});
