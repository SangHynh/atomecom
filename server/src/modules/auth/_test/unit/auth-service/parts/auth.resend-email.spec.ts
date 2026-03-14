import { setupAuthServiceTest, mockAuthUser } from '../__fixtures__/auth.fixtures.js';
import { DomainEvents } from '@shared/constants/event.constants.js';

describe('AuthService - Part 2.1: resendVerificationEmail', () => {
  let { authService, userService, eventBus } = setupAuthServiceTest();

  beforeEach(() => {
    ({ authService, userService, eventBus } = setupAuthServiceTest());
  });

  it('should resend email if user found and not verified (TC-AUTH-16)', async () => {
    userService.findByEmail.mockResolvedValue({ ...mockAuthUser, isVerified: false } as any);
    await authService.resendVerificationEmail(mockAuthUser.email);
    expect(eventBus.emit).toHaveBeenCalledWith(DomainEvents.VERIFICATION_EMAIL_REQUESTED, expect.any(Object));
  });

  it('should not resend if user already verified', async () => {
    userService.findByEmail.mockResolvedValue({ ...mockAuthUser, isVerified: true } as any);
    await authService.resendVerificationEmail(mockAuthUser.email);
    expect(eventBus.emit).not.toHaveBeenCalled();
  });

  it('should not resend if user missing', async () => {
    userService.findByEmail.mockResolvedValue(null);
    await authService.resendVerificationEmail('ghost@ex.com');
    expect(eventBus.emit).not.toHaveBeenCalled();
  });
});
