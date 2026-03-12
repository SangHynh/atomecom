import { AuthService } from '@modules/auth/use-cases/auth.service.js';
import type { UserService } from '@modules/users/use-cases/user.service.js';
import type { ITokenService } from '@modules/auth/domain/IToken.service.js';
import { SessionService } from '@modules/auth/use-cases/session.service.js';
import { MailTokenService } from '@modules/auth/use-cases/mailToken.service.js';
import type { OauthFactory } from '@modules/auth/use-cases/oauth.factory.js';
import type { EventBus } from '@shared/infra/event-bus.js';
import { USER_STATUS, USER_ROLE } from '@atomecom/shared';
import { DomainEvents } from '@shared/constants/event.constants.js';
import { UnauthorizedError, ConflictError, ForbiddenError, BadRequestError, InternalServerError, NotFoundError } from '@shared/core/error.response.js';

jest.mock('@shared/configs/app.config.js', () => ({
  __esModule: true,
  default: {
    security: {
      jwt: {
        accessSecret: 'access',
        refreshSecret: 'refresh',
        accessExpires: '15m',
        refreshExpires: '7d',
      },
    },
  },
}));

jest.mock('@shared/utils/logger.js', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    http: jest.fn(),
  },
}));

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserService: jest.Mocked<UserService>;
  let mockTokenService: jest.Mocked<ITokenService>;
  let mockSessionService: jest.Mocked<SessionService>;
  let mockMailTokenService: jest.Mocked<MailTokenService>;
  let mockOauthFactory: jest.Mocked<OauthFactory>;
  let mockEventBus: jest.Mocked<EventBus>;

  const mockUser = {
    id: 'user-123',
    name: 'John Doe',
    email: 'john@example.com',
    role: USER_ROLE.USER,
    status: USER_STATUS.ACTIVE,
    isVerified: true,
    version: 1,
    providers: [] as any[],
    isEmailMissing: false,
    addresses: [] as any[],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    mockUserService = {
      create: jest.fn(),
      verifyCredentials: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      verifyAccount: jest.fn(),
      changePassword: jest.fn(),
      upsertOAuthUser: jest.fn(),
      hardDelete: jest.fn().mockResolvedValue(true),
    } as any;
    mockTokenService = {
      generateAccessToken: jest.fn().mockResolvedValue('access'),
      generateRefreshToken: jest.fn().mockResolvedValue('refresh'),
      verifyRefreshToken: jest.fn(),
    } as any;
    mockOauthFactory = {
      getStrategy: jest.fn(),
    } as any;
    mockEventBus = { emit: jest.fn(), on: jest.fn() } as any;
    mockSessionService = {
      saveRefreshTokenToCache: jest.fn().mockResolvedValue(undefined),
      handleRefreshToken: jest.fn().mockResolvedValue(undefined),
      countSessions: jest.fn().mockResolvedValue(0),
      revokeOldestSession: jest.fn().mockResolvedValue(undefined),
      revokeRefreshToken: jest.fn().mockResolvedValue(undefined),
    } as any;
    mockMailTokenService = {
      createMailToken: jest.fn(),
      verifyMailToken: jest.fn(),
    } as any;

    authService = new AuthService({
      userService: mockUserService as any,
      tokenService: mockTokenService as any,
      sessionService: mockSessionService as any,
      mailTokenService: mockMailTokenService as any,
      oauthFactory: mockOauthFactory as any,
      eventBus: mockEventBus as any,
    });
  });

  it('should login successfully (TC-AUTH-01)', async () => {
    mockUserService.verifyCredentials.mockResolvedValue(mockUser as any);
    mockSessionService.countSessions.mockResolvedValue(0);

    const res = await authService.login({ email: 'j@ex.com', password: 'p' });

    expect(res.user.id).toBe('user-123');
    expect(mockSessionService.saveRefreshTokenToCache).toHaveBeenCalled();
  });

  it('should throw UnauthorizedError when credentials incorrect (TC-AUTH-02)', async () => {
    mockUserService.verifyCredentials.mockRejectedValue(new UnauthorizedError('INVALID_CREDENTIALS'));

    await expect(authService.login({ email: 'j@ex.com', password: 'p' }))
      .rejects.toThrow(UnauthorizedError);

    expect(mockSessionService.saveRefreshTokenToCache).not.toHaveBeenCalled();
  });

  it('should emit USER_LOGGED_IN event on success (TC-AUTH-03)', async () => {
    mockUserService.verifyCredentials.mockResolvedValue(mockUser as any);
    await authService.login({ email: 'j@ex.com', password: 'p' });
    expect(mockEventBus.emit).toHaveBeenCalledWith(DomainEvents.USER_LOGGED_IN, expect.any(Object));
  });

  it('should revoke oldest session if limit reached (TC-AUTH-04)', async () => {
    mockUserService.verifyCredentials.mockResolvedValue(mockUser as any);
    mockSessionService.countSessions.mockResolvedValue(5);

    await authService.login({ email: 'j@ex.com', password: 'p' });

    expect(mockSessionService.revokeOldestSession).toHaveBeenCalledWith(mockUser.id);
  });

  describe('register (TC-AUTH-05, 06, 07, 08)', () => {
    it('should register successfully (TC-AUTH-05)', async () => {
      mockUserService.create.mockResolvedValue(mockUser as any);
      const res = await authService.register({ name: 'J', email: 'j@ex.com', password: 'p' });
      expect(res.user.id).toBe(mockUser.id);
      expect(mockSessionService.saveRefreshTokenToCache).toHaveBeenCalled();
    });

    it('should rollback (hardDelete user) if session creation fails (TC-AUTH-06)', async () => {
      mockUserService.create.mockResolvedValue(mockUser as any);
      mockTokenService.generateAccessToken.mockRejectedValue(new Error('Token Service Down'));

      await expect(authService.register({ name: 'J', email: 'j@ex.com', password: 'p' }))
        .rejects.toThrow('Token Service Down');

      expect(mockUserService.hardDelete).toHaveBeenCalledWith(mockUser.id);
    });

    it('should propagate ConflictError from UserService (TC-AUTH-07)', async () => {
      mockUserService.create.mockRejectedValue(new ConflictError('EMAIL_ALREADY_EXISTS'));

      await expect(authService.register({ name: 'J', email: 'j@ex.com', password: 'p' }))
        .rejects.toThrow(ConflictError);

      expect(mockUserService.hardDelete).not.toHaveBeenCalled();
    });

    it('should log error but not re-throw if hardDelete fails during rollback (TC-AUTH-08)', async () => {
      mockUserService.create.mockResolvedValue(mockUser as any);
      mockTokenService.generateAccessToken.mockRejectedValue(new Error('Original Error'));
      mockUserService.hardDelete.mockRejectedValue(new Error('Rollback Failed'));

      // Should still throw Original Error
      await expect(authService.register({ name: 'J', email: 'j@ex.com', password: 'p' }))
        .rejects.toThrow('Original Error');

      expect(mockUserService.hardDelete).toHaveBeenCalled();
    });
  });

  describe('refresh (TC-AUTH-09 to 12)', () => {
    const validRefreshToken = 'valid-rt';
    const payload = { userId: mockUser.id, sessionId: 's1', exp: (Date.now() + 100000) / 1000 };

    it('should refresh tokens successfully (TC-AUTH-09)', async () => {
      mockTokenService.verifyRefreshToken.mockResolvedValue(payload as any);
      mockUserService.findById.mockResolvedValue(mockUser as any);
      mockSessionService.handleRefreshToken.mockResolvedValue(undefined);

      const res = await authService.refresh(validRefreshToken);

      expect(res.tokens).toBeDefined();
      expect(mockSessionService.handleRefreshToken).toHaveBeenCalled();
    });

    it('should throw UnauthorizedError if token invalid (TC-AUTH-10)', async () => {
      mockTokenService.verifyRefreshToken.mockResolvedValue(undefined as any);
      await expect(authService.refresh('invalid')).rejects.toThrow(UnauthorizedError);
    });

    it('should throw UnauthorizedError if payload missing fields (TC-AUTH-11)', async () => {
      mockTokenService.verifyRefreshToken.mockResolvedValue({} as any);
      await expect(authService.refresh('invalid')).rejects.toThrow(UnauthorizedError);
    });

    it('should throw NotFoundError if user not active (TC-AUTH-12)', async () => {
      mockTokenService.verifyRefreshToken.mockResolvedValue(payload as any);
      mockUserService.findById.mockRejectedValue(new NotFoundError('USER_NOT_FOUND'));
      await expect(authService.refresh(validRefreshToken)).rejects.toThrow(NotFoundError);
    });
  });

  describe('logout (TC-AUTH-13, 14)', () => {
    it('should revoke session on logout (TC-AUTH-13)', async () => {
      mockTokenService.verifyRefreshToken.mockResolvedValue({ userId: 'u1', sessionId: 's1' } as any);
      await authService.logout('rt');
      expect(mockSessionService.revokeRefreshToken).toHaveBeenCalledWith('u1', 's1');
    });

    it('should not throw if token invalid on logout (TC-AUTH-14)', async () => {
      mockTokenService.verifyRefreshToken.mockRejectedValue(new Error('Invalid'));
      await expect(authService.logout('rt')).resolves.not.toThrow();
    });
  });

  describe('verifyEmail (TC-AUTH-15, 16, 17)', () => {
    it('should verify email and auto-login (TC-AUTH-15)', async () => {
      mockMailTokenService.verifyMailToken.mockResolvedValue(mockUser.id);
      mockUserService.verifyAccount.mockResolvedValue(mockUser);
      
      const res = await authService.verifyEmail('token');
      expect(res.user.id).toBe(mockUser.id);
      expect(mockUserService.verifyAccount).toHaveBeenCalledWith(mockUser.id, true);
    });

    it('should throw BadRequestError if token invalid (TC-AUTH-16)', async () => {
      mockMailTokenService.verifyMailToken.mockRejectedValue(new BadRequestError('INVALID_TOKEN'));
      await expect(authService.verifyEmail('token')).rejects.toThrow(BadRequestError);
    });

    it('should throw if verifyAccount returns null (TC-AUTH-17)', async () => {
      mockMailTokenService.verifyMailToken.mockResolvedValue(mockUser.id);
      mockUserService.verifyAccount.mockResolvedValue(null);
      await expect(authService.verifyEmail('token')).rejects.toThrow(InternalServerError);
    });
  });

  describe('resendVerificationEmail (TC-AUTH-18, 19, 20)', () => {
    it('should emit event if user not verified (TC-AUTH-18)', async () => {
      mockUserService.findByEmail.mockResolvedValue({ ...mockUser, isVerified: false } as any);
      await authService.resendVerificationEmail('j@ex.com');
      expect(mockEventBus.emit).toHaveBeenCalledWith(DomainEvents.VERIFICATION_EMAIL_REQUESTED, expect.any(Object));
    });

    it('should return early if user already verified (TC-AUTH-19)', async () => {
      mockUserService.findByEmail.mockResolvedValue({ ...mockUser, isVerified: true } as any);
      await authService.resendVerificationEmail('j@ex.com');
      expect(mockEventBus.emit).not.toHaveBeenCalledWith(DomainEvents.VERIFICATION_EMAIL_REQUESTED, expect.any(Object));
    });

    it('should not throw if email not found (TC-AUTH-20)', async () => {
      mockUserService.findByEmail.mockResolvedValue(null);
      await expect(authService.resendVerificationEmail('missing@ex.com')).resolves.not.toThrow();
      expect(mockEventBus.emit).not.toHaveBeenCalled();
    });
  });

  describe('forgot/reset password (TC-AUTH-21 to 26)', () => {
    it('should emit event for forgotPassword (TC-AUTH-21)', async () => {
      mockUserService.findByEmail.mockResolvedValue(mockUser as any);
      await authService.forgotPassword('john@example.com');
      expect(mockEventBus.emit).toHaveBeenCalledWith(DomainEvents.PASSWORD_RESET_REQUESTED, expect.any(Object));
    });

    it('should return void for non-existent email in forgotPassword (TC-AUTH-22)', async () => {
      mockUserService.findByEmail.mockResolvedValue(null);
      await authService.forgotPassword('missing@ex.com');
      expect(mockEventBus.emit).not.toHaveBeenCalled();
    });

    it('should return void for banned user in forgotPassword (TC-AUTH-23)', async () => {
      // simulate findByEmail with status ACTIVE filter returning null
      mockUserService.findByEmail.mockResolvedValue(null);
      await authService.forgotPassword('banned@ex.com');
      expect(mockEventBus.emit).not.toHaveBeenCalled();
    });

    it('should reset password successfully (TC-AUTH-24)', async () => {
      mockMailTokenService.verifyMailToken.mockResolvedValue(mockUser.id);
      mockUserService.changePassword.mockResolvedValue(mockUser);
      await authService.resetPassword('token', 'new-p');
      expect(mockUserService.changePassword).toHaveBeenCalled();
    });

    it('should throw BadRequestError if reset token invalid (TC-AUTH-25)', async () => {
      mockMailTokenService.verifyMailToken.mockRejectedValue(new BadRequestError('INVALID_TOKEN'));
      await expect(authService.resetPassword('token', 'p')).rejects.toThrow(BadRequestError);
    });

    it('should throw InternalServerError if changePassword fails (TC-AUTH-26)', async () => {
      mockMailTokenService.verifyMailToken.mockResolvedValue(mockUser.id);
      mockUserService.changePassword.mockResolvedValue(null);
      await expect(authService.resetPassword('token', 'p')).rejects.toThrow(InternalServerError);
    });
  });

  describe('socialLogin (TC-AUTH-27, 28, 29)', () => {
    it('should login via social provider (TC-AUTH-27)', async () => {
      const mockStrategy = { getProfile: jest.fn().mockResolvedValue({ email: 's@ex.com', name: 'S', provider: 'GOOGLE', providerId: '1' }) };
      mockOauthFactory.getStrategy.mockReturnValue(mockStrategy as any);
      mockUserService.upsertOAuthUser.mockResolvedValue(mockUser);

      const res = await authService.socialLogin('GOOGLE' as any, 'token');
      expect(res.user.id).toBe(mockUser.id);
    });

    it('should throw UnauthorizedError if oauth token invalid (TC-AUTH-28)', async () => {
      const mockStrategy = { getProfile: jest.fn().mockRejectedValue(new UnauthorizedError('INVALID_OAUTH')) };
      mockOauthFactory.getStrategy.mockReturnValue(mockStrategy as any);

      await expect(authService.socialLogin('GOOGLE' as any, 'token')).rejects.toThrow(UnauthorizedError);
    });

    it('should throw ForbiddenError if user banned (TC-AUTH-29)', async () => {
      const mockStrategy = { getProfile: jest.fn().mockResolvedValue({ email: 's@ex.com' }) };
      mockOauthFactory.getStrategy.mockReturnValue(mockStrategy as any);
      mockUserService.upsertOAuthUser.mockResolvedValue({ ...mockUser, status: USER_STATUS.BANNED });

      await expect(authService.socialLogin('GOOGLE' as any, 'token')).rejects.toThrow(ForbiddenError);
    });
  });
});
