import { setupAuthServiceTest, mockAuthUser } from '../__fixtures__/auth.fixtures.js';
import { DomainEvents } from '@shared/constants/event.constants.js';
import { BadRequestError } from '@shared/core/error.response.js';

describe('AuthService - Part 5 & 6: verifyEmail Flow', () => {
  let { authService, userService, mailTokenService, eventBus } = setupAuthServiceTest();

  beforeEach(() => {
    ({ authService, userService, mailTokenService, eventBus } = setupAuthServiceTest());
  });

  describe('Part 5: resendVerificationEmail', () => {
    it('should emit event for resendVerificationEmail (TC-AUTH-16)', async () => {
      // Must be NOT verified for event to emit
      userService.findByEmail.mockResolvedValue({ ...mockAuthUser, isVerified: false } as any);
      
      await authService.resendVerificationEmail(mockAuthUser.email);
      
      expect(eventBus.emit).toHaveBeenCalledWith(DomainEvents.VERIFICATION_EMAIL_REQUESTED, {
        userId: mockAuthUser.id,
        email: mockAuthUser.email
      });
    });

    it('should NOT emit event if user already verified', async () => {
      userService.findByEmail.mockResolvedValue({ ...mockAuthUser, isVerified: true } as any);
      await authService.resendVerificationEmail(mockAuthUser.email);
      expect(eventBus.emit).not.toHaveBeenCalled();
    });

    it('should NOT emit event if user not found', async () => {
      userService.findByEmail.mockResolvedValue(null);
      await authService.resendVerificationEmail('ghost@ex.com');
      expect(eventBus.emit).not.toHaveBeenCalled();
    });
  });

  describe('Part 6: verifyEmail', () => {
    it('should verify email successfully and create session (TC-AUTH-17)', async () => {
      mailTokenService.verifyMailToken.mockResolvedValue(mockAuthUser.id);
      userService.verifyAccount.mockResolvedValue({ ...mockAuthUser, isVerified: true } as any);
      
      const result = await authService.verifyEmail('valid-token');
      
      expect(mailTokenService.verifyMailToken).toHaveBeenCalledWith('valid-token', 'EMAIL_VERIFICATION');
      expect(userService.verifyAccount).toHaveBeenCalledWith(mockAuthUser.id, true);
      expect(result.tokens.accessToken).toBe('access');
    });

    it('should throw BadRequestError if token invalid (TC-AUTH-18)', async () => {
      mailTokenService.verifyMailToken.mockRejectedValue(new BadRequestError('INVALID_TOKEN'));
      await expect(authService.verifyEmail('bad')).rejects.toThrow(BadRequestError);
    });
  });
});
