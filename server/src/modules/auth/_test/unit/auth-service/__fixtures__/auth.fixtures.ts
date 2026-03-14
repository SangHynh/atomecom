// Global Mocks for Config and Logger must be at the very top for ESM
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

// Mock time utilities to be stable
jest.mock('@shared/utils/time.js', () => ({
  __esModule: true,
  getExpiresAt: jest.fn().mockReturnValue(Date.now() + 3600000),
  getExpiresInSeconds: jest.fn().mockReturnValue(3600),
}));

import { AuthService } from '@modules/auth/use-cases/auth.service.js';
import type { UserService } from '@modules/users/use-cases/user.service.js';
import type { ITokenService } from '@modules/auth/domain/IToken.service.js';
import { SessionService } from '@modules/auth/use-cases/session.service.js';
import { MailTokenService } from '@modules/auth/use-cases/mailToken.service.js';
import type { OauthFactory } from '@modules/auth/use-cases/oauth.factory.js';
import type { EventBus } from '@shared/infra/event-bus.js';
import { USER_STATUS, USER_ROLE } from '@atomecom/shared';

export const mockAuthUser = {
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

export const createMockAuthUserService = () => ({
  create: jest.fn(),
  verifyCredentials: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  verifyAccount: jest.fn(),
  changePassword: jest.fn(),
  upsertOAuthUser: jest.fn(),
  hardDelete: jest.fn().mockResolvedValue(true),
  createWithSession: jest.fn(),
} as unknown as jest.Mocked<UserService>);

export const createMockTokenService = () => ({
  generateAccessToken: jest.fn().mockResolvedValue('access'),
  generateRefreshToken: jest.fn().mockResolvedValue('refresh'),
  verifyRefreshToken: jest.fn(),
} as unknown as jest.Mocked<ITokenService>);

export const createMockSessionService = () => ({
  saveRefreshTokenToCache: jest.fn().mockResolvedValue(undefined),
  handleRefreshToken: jest.fn().mockResolvedValue(undefined),
  countSessions: jest.fn().mockResolvedValue(0),
  revokeOldestSession: jest.fn().mockResolvedValue(undefined),
  revokeRefreshToken: jest.fn().mockResolvedValue(undefined),
} as unknown as jest.Mocked<SessionService>);

export const createMockMailTokenService = () => ({
  createMailToken: jest.fn(),
  verifyMailToken: jest.fn(),
} as unknown as jest.Mocked<MailTokenService>);

export const createMockOauthFactory = () => ({
  getStrategy: jest.fn(),
} as unknown as jest.Mocked<OauthFactory>);

export const createMockEventBus = () => ({
  emit: jest.fn(),
  on: jest.fn(),
} as unknown as jest.Mocked<EventBus>);

export const setupAuthServiceTest = () => {
  const userService = createMockAuthUserService();
  const tokenService = createMockTokenService();
  const sessionService = createMockSessionService();
  const mailTokenService = createMockMailTokenService();
  const oauthFactory = createMockOauthFactory();
  const eventBus = createMockEventBus();

  const authService = new AuthService({
    userService: userService as any,
    tokenService: tokenService as any,
    sessionService: sessionService as any,
    mailTokenService: mailTokenService as any,
    oauthFactory: oauthFactory as any,
    eventBus: eventBus as any,
  });

  return {
    authService,
    userService,
    tokenService,
    sessionService,
    mailTokenService,
    oauthFactory,
    eventBus,
  };
};
