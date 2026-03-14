import { setupAuthServiceTest, mockAuthUser } from '../__fixtures__/auth.fixtures.js';
import { DomainEvents } from '@shared/constants/event.constants.js';

describe('AuthService - Part 2: register', () => {
  let { authService, userService, tokenService, sessionService, mailTokenService, eventBus } = setupAuthServiceTest();

  beforeEach(() => {
    ({ authService, userService, tokenService, sessionService, mailTokenService, eventBus } = setupAuthServiceTest());
  });

  it('should register successfully, creating session and emitting USER_LOGGED_IN (TC-AUTH-04)', async () => {
    userService.createWithSession.mockImplementation(async (dto, callback) => {
      const result = await callback(mockAuthUser as any);
      return { user: mockAuthUser, result };
    });

    const result = await authService.register({
      name: 'John',
      email: 'john@example.com',
      password: 'Pass',
    });

    expect(result.user.id).toBe(mockAuthUser.id);
    expect(result.tokens.accessToken).toBe('access');
    expect(eventBus.emit).toHaveBeenCalledWith(DomainEvents.USER_LOGGED_IN, { userId: mockAuthUser.id });
  });

  it('should throw error if userService.createWithSession fails (TC-AUTH-05)', async () => {
    userService.createWithSession.mockRejectedValue(new Error('Conflict'));
    await expect(authService.register({ name: 'J', email: 'j@e.com', password: 'P' })).rejects.toThrow('Conflict');
  });

  it('should verify that compensation is NOT handled by AuthService (TC-AUTH-06)', async () => {
    userService.createWithSession.mockRejectedValue(new Error('Session Creation Failed'));
    await expect(authService.register({ name: 'J', email: 'j@e.com', password: 'P' })).rejects.toThrow('Session Creation Failed');
    expect(userService.hardDelete).not.toHaveBeenCalled();
  });

  it('should not allow registration if session creation throws internal error', async () => {
    userService.createWithSession.mockImplementation(async (dto, callback) => {
      throw new Error('Internal');
    });
    await expect(authService.register({ name: 'J', email: 'j@e.com', password: 'P' })).rejects.toThrow();
  });
});
