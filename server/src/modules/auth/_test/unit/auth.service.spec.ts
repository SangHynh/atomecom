import { AuthService } from '@modules/auth/use-cases/auth.service.js';
import type { UserService } from '@modules/users/use-cases/user.service.js';
import type { ITokenService } from '@modules/auth/domain/IToken.service.js';
import { SessionService } from '@modules/auth/use-cases/session.service.js';
import { MailTokenService } from '@modules/auth/use-cases/mailToken.service.js';
import type { OauthFactory } from '@modules/auth/use-cases/oauth.factory.js';
import type { EventBus } from '@shared/infra/event-bus.js';
import { USER_ROLE } from '@atomecom/shared';
import { USER_STATUS } from '@atomecom/shared';

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
    providers: [],
    isEmailMissing: false,
  };

  beforeEach(() => {
    mockUserService = {
      create: jest.fn(),
      verifyCredentials: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
    } as any;
    mockTokenService = {
      generateAccessToken: jest.fn().mockResolvedValue('access'),
      generateRefreshToken: jest.fn().mockResolvedValue('refresh'),
      verifyRefreshToken: jest.fn(),
    } as any;
    mockSessionService = {
      saveRefreshTokenToCache: jest.fn(),
      handleRefreshToken: jest.fn(),
    } as any;
    mockMailTokenService = { createMailToken: jest.fn() } as any;
    mockOauthFactory = {} as any;
    mockEventBus = { emit: jest.fn(), on: jest.fn() } as any;

    authService = new AuthService({
      userService: mockUserService as any,
      tokenService: mockTokenService as any,
      sessionService: mockSessionService as any,
      mailTokenService: mockMailTokenService as any,
      oauthFactory: mockOauthFactory as any,
      eventBus: mockEventBus as any,
    });
  });

  it('should login successfully', async () => {
    mockUserService.verifyCredentials.mockResolvedValue(mockUser as any);
    const res = await authService.login({ email: 'j@ex.com', password: 'p' });
    expect(res.user.id).toBe('user-123');
    expect(mockSessionService.saveRefreshTokenToCache).toHaveBeenCalled();
  });
});
