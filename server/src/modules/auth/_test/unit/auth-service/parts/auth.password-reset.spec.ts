import { setupAuthServiceTest, mockAuthUser } from '../__fixtures__/auth.fixtures.js';
import { DomainEvents } from '@shared/constants/event.constants.js';
import { BadRequestError, InternalServerError } from '@shared/core/error.response.js';

describe('AuthService - Part 7: Password Reset', () => {
  let { authService, userService, mailTokenService, eventBus } = setupAuthServiceTest();

  beforeEach(() => {
    ({ authService, userService, mailTokenService, eventBus } = setupAuthServiceTest());
  });

  describe('forgotPassword', () => {
    it('should emit event for forgotPassword (TC-AUTH-21)', async () => {
      userService.findByEmail.mockResolvedValue(mockAuthUser as any);
      await authService.forgotPassword('john@example.com');
      expect(eventBus.emit).toHaveBeenCalledWith(DomainEvents.PASSWORD_RESET_REQUESTED, expect.objectContaining({
        email: mockAuthUser.email,
        userId: mockAuthUser.id
      }));
    });

    it('should not emit if user not found (TC-AUTH-22)', async () => {
      userService.findByEmail.mockResolvedValue(null);
      await authService.forgotPassword('ghost@ex.com');
      expect(eventBus.emit).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully (TC-AUTH-24)', async () => {
      mailTokenService.verifyMailToken.mockResolvedValue(mockAuthUser.id);
      userService.changePassword.mockResolvedValue(mockAuthUser as any);
      
      await authService.resetPassword('token', 'new-password');
      
      expect(mailTokenService.verifyMailToken).toHaveBeenCalledWith('token', 'RESET_PASSWORD');
      expect(userService.changePassword).toHaveBeenCalledWith(mockAuthUser.id, 'new-password');
    });

    it('should throw BadRequestError if reset token invalid (TC-AUTH-25)', async () => {
      mailTokenService.verifyMailToken.mockRejectedValue(new BadRequestError('INVALID_TOKEN'));
      await expect(authService.resetPassword('token', 'p')).rejects.toThrow(BadRequestError);
    });

    it('should throw InternalServerError if changePassword fails (TC-AUTH-26)', async () => {
      mailTokenService.verifyMailToken.mockResolvedValue(mockAuthUser.id);
      userService.changePassword.mockResolvedValue(null);
      await expect(authService.resetPassword('token', 'p')).rejects.toThrow(InternalServerError);
    });
  });
});
