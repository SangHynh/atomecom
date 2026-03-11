import type { Express } from 'express';
import express from 'express';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import { ErrorAuthCodes, ErrorUserCodes } from '@atomecom/shared';
import { UserModel } from '@modules/users/infra/mongoose-user.model.js';
import { MongooseUserRepo } from '@modules/users/infra/mongoose-user.repo.js';
import { BcryptHashAdapter } from '@modules/users/infra/bcryptHash.adapter.js';
import { UserService } from '@modules/users/use-cases/user.service.js';
import { JwtTokenAdapter } from '@modules/auth/infra/jwtToken.adapter.js';
import { SessionService } from '@modules/auth/use-cases/session.service.js';
import { MailTokenService } from '@modules/auth/use-cases/mailToken.service.js';
import { MongooseMailTokenRepo } from '@modules/auth/infra/mongoose-mailToken.repo.js';
import { MailTokenModel } from '@modules/auth/infra/mongoose-mailToken.model.js';
import { AuthService } from '@modules/auth/use-cases/auth.service.js';
import { AuthController } from '@modules/auth/presentation/auth.controller.js';
import { EventBus } from '@shared/infra/event-bus.js';
import { EmailListener } from '@modules/emails/use-cases/email.listener.js';
import { asyncHandler } from '@shared/core/asyncHandler.js';
import { validate } from '@shared/middlewares/validate.middleware.js';
import {
  EmailOnlyRequestSchema,
  LoginRequestSchema,
  RegisterRequestSchema,
  ResetPasswordRequestSchema,
  SocialLoginRequestSchema,
  TokenRequestSchema,
  VerifyEmailRequestSchema,
} from '@atomecom/shared';
import { errorHandler } from '@shared/middlewares/error.middleware.js';
import type { ICacheRepo } from '@shared/interfaces/ICache.repo.js';
import type { IEmailService } from '@modules/emails/domain/IEmail.service.js';

// env for JWT
process.env.ACCESS_TOKEN_SECRET = 'test-access-secret';
process.env.REFRESH_TOKEN_SECRET = 'test-refresh-secret';
process.env.ACCESS_TOKEN_EXPIRES_IN = '15m';
process.env.REFRESH_TOKEN_EXPIRES_IN = '7d';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock Cache Repo (In-memory)
class MockCacheRepo implements ICacheRepo {
  private _data = new Map<string, any>();
  async get<T>(key: string): Promise<T | null> {
    return this._data.get(key) || null;
  }
  async set(key: string, value: any, ttl?: number): Promise<void> {
    this._data.set(key, value);
  }
  async del(key: string): Promise<void> {
    this._data.delete(key);
  }
  async has(key: string): Promise<boolean> {
    return this._data.has(key);
  }
  async countByPattern(pattern: string): Promise<number> {
    const p = pattern.replace(/\*/g, '.*');
    const regex = new RegExp('^' + p + '$');
    let count = 0;
    for (const key of this._data.keys()) {
      if (regex.test(key)) count++;
    }
    return count;
  }
  async deleteByPattern(pattern: string): Promise<void> {
    const p = pattern.replace(/\*/g, '.*');
    const regex = new RegExp('^' + p + '$');
    for (const key of this._data.keys()) {
      if (regex.test(key)) this._data.delete(key);
    }
  }
  async getKeysByPattern(pattern: string): Promise<string[]> {
    const p = pattern.replace(/\*/g, '.*');
    const regex = new RegExp('^' + p + '$');
    const keys: string[] = [];
    for (const key of this._data.keys()) {
      if (regex.test(key)) keys.push(key);
    }
    return keys;
  }
  async acquireLock(_key: string, _ttl: number): Promise<boolean> {
    return true;
  }
  async releaseLock(_key: string): Promise<void> {}
  async waitAndAcquire(
    _key: string,
    _ttl: number,
    _timeout?: number,
  ): Promise<boolean> {
    return true;
  }
}

// Mock Email Service
const mockEmailService: IEmailService = {
  sendVerificationEmail: jest.fn().mockResolvedValue(true),
  sendResetPasswordEmail: jest.fn().mockResolvedValue(true),
} as any;

function createTestApp(): Express {
  const eventBus = new EventBus();
  const userRepo = new MongooseUserRepo();
  const hashService = new BcryptHashAdapter();
  const cacheRepo = new MockCacheRepo();
  const userService = new UserService({
    userRepo,
    hashService,
    eventBus,
    cache: cacheRepo,
  });
  const sessionService = new SessionService(cacheRepo);

  const mailTokenRepo = new MongooseMailTokenRepo();
  const mailTokenService = new MailTokenService(mailTokenRepo);

  const tokenService = new JwtTokenAdapter();
  const oauthFactory = {} as any;

  const authService = new AuthService({
    userService,
    tokenService,
    sessionService,
    mailTokenService,
    oauthFactory,
    eventBus,
  });

  // Initialize Email Listener
  new EmailListener({
    eventBus,
    emailService: mockEmailService,
    mailTokenService,
  });

  const authController = new AuthController(authService, {
    recordViolation: jest.fn(),
  } as any);

  const app = express();
  app.use(express.json());
  app.use(cookieParser());

  const authRouter = express.Router();
  authRouter.post(
    '/register',
    validate(RegisterRequestSchema),
    asyncHandler(authController.register.bind(authController)),
  );
  authRouter.post(
    '/login',
    validate(LoginRequestSchema),
    asyncHandler(authController.login.bind(authController)),
  );
  authRouter.post(
    '/refresh-token',
    validate(TokenRequestSchema),
    asyncHandler(authController.refresh.bind(authController)),
  );
  authRouter.post(
    '/logout',
    validate(TokenRequestSchema),
    asyncHandler(authController.logout.bind(authController)),
  );
  authRouter.post(
    '/forgot-password',
    validate(EmailOnlyRequestSchema),
    asyncHandler(authController.forgotPassword.bind(authController)),
  );
  authRouter.get(
    '/verify-email',
    validate(VerifyEmailRequestSchema),
    asyncHandler(authController.verifyEmail.bind(authController)),
  );

  app.use('/auth', authRouter);
  app.use(errorHandler);
  return app;
}

import {
  connect,
  closeDatabase,
  clearDatabase,
} from '@shared/test/db-helper.js';

// ... (previous imports)

describe('Auth Module - Integration Tests', () => {
  let app: Express;

  beforeAll(async () => {
    await connect();
    app = createTestApp();
  }, 120000);

  afterAll(async () => {
    await closeDatabase();
  });

  beforeEach(async () => {
    await clearDatabase();
    jest.clearAllMocks();
  });

  describe('Happy Path', () => {
    const registerDto = {
      email: 'test@example.com',
      password: 'Password@123',
      name: 'Test User',
    };

    it('1. Register -> Login -> Refresh -> Logout', async () => {
      // REGISTER
      const regRes = await request(app)
        .post('/auth/register')
        .send(registerDto);
      expect(regRes.status).toBe(201);
      expect(regRes.body.data.user.email).toBe(registerDto.email);
      expect(regRes.body.data.tokens.accessToken).toBeDefined();

      await delay(500); // Wait for background email
      expect(mockEmailService.sendVerificationEmail).toHaveBeenCalled();

      const regCookies = regRes.get('Set-Cookie');
      const refreshToken = (regCookies as string[])?.[0]
        ?.split(';')[0]
        ?.split('=')[1];
      expect(refreshToken).toBeDefined();

      // LOGIN
      const loginRes = await request(app).post('/auth/login').send({
        email: registerDto.email,
        password: registerDto.password,
      });
      expect(loginRes.status).toBe(200);
      expect(loginRes.body.data.tokens.accessToken).toBeDefined();
      const loginCookies = loginRes.get('Set-Cookie');
      const newRefreshToken = (loginCookies as string[])?.[0]
        ?.split(';')[0]
        ?.split('=')[1];
      expect(newRefreshToken).toBeDefined();

      // REFRESH
      const refreshRes = await request(app)
        .post('/auth/refresh-token')
        .set('Cookie', [`refreshToken=${newRefreshToken}`]);
      expect(refreshRes.status).toBe(200);
      expect(refreshRes.body.data.tokens.accessToken).toBeDefined();

      // Get new refresh token from cookie
      const cookies = refreshRes.get('Set-Cookie');
      const nextRefreshToken = (cookies as string[])?.[0]
        ?.split(';')[0]
        ?.split('=')[1];
      expect(nextRefreshToken).toBeDefined();
      expect(nextRefreshToken).not.toBe(newRefreshToken);

      // LOGOUT
      const logoutRes = await request(app)
        .post('/auth/logout')
        .set('Cookie', [`refreshToken=${nextRefreshToken}`]);
      expect(logoutRes.status).toBe(204);
    });

    it('2. Forgot Password & Verify Email flow', async () => {
      // Create user first
      const regRes = await request(app)
        .post('/auth/register')
        .send(registerDto);
      expect(regRes.status).toBe(201);

      // FORGOT PASSWORD (this creates a RESET_PASSWORD token)
      const forgotRes = await request(app)
        .post('/auth/forgot-password')
        .send({ email: registerDto.email });
      expect(forgotRes.status).toBe(200);

      await delay(1000); // Wait for background emails
      expect(mockEmailService.sendResetPasswordEmail).toHaveBeenCalled();
      expect(mockEmailService.sendVerificationEmail).toHaveBeenCalled();

      // VERIFY EMAIL (using the token from register flow)
      const tokenRecord = await MailTokenModel.findOne({
        email: registerDto.email,
        type: 'EMAIL_VERIFICATION',
      });
      expect(tokenRecord).toBeDefined();

      const verifyRes = await request(app).get(
        `/auth/verify-email?token=${tokenRecord?.token}`,
      );
      expect(verifyRes.status).toBe(200);
      expect(verifyRes.body.data.user.isVerified).toBe(true);
    });
  });

  describe('Edge Cases & Security', () => {
    it('1. Token Reuse Detection (Security Rotation)', async () => {
      const regRes = await request(app).post('/auth/register').send({
        email: 'security@test.com',
        password: 'Password@123',
        name: 'Sec User',
      });
      // Get RT from cookie
      const regCookies = regRes.get('Set-Cookie');
      const rt1 = (regCookies as string[])?.[0]?.split(';')[0]?.split('=')[1];
      expect(rt1).toBeDefined();

      // First Refresh (Valid)
      const refresh1 = await request(app)
        .post('/auth/refresh-token')
        .set('Cookie', [`refreshToken=${rt1}`]);
      expect(refresh1.status).toBe(200);

      const refresh1Cookies = refresh1.get('Set-Cookie');
      const rt2 = (refresh1Cookies as string[])?.[0]
        ?.split(';')[0]
        ?.split('=')[1];
      expect(rt2).toBeDefined();

      // Second Refresh with rt2 (Valid Rotation)
      const refresh2 = await request(app)
        .post('/auth/refresh-token')
        .set('Cookie', [`refreshToken=${rt2}`]);
      expect(refresh2.status).toBe(200);

      // Third Refresh with rt1 (REUSE DETECTION!)
      // rt1 is now in refreshTokensUsed and NOT the lastRefreshToken anymore
      const refresh3 = await request(app)
        .post('/auth/refresh-token')
        .set('Cookie', [`refreshToken=${rt1}`]);
      expect(refresh3.status).toBe(401);

      const body = refresh3.body;
      expect(body.message).toBe(ErrorAuthCodes.TOKEN_REUSED_DETECTION);

      // Verify rt3 is also revoked now
      const refresh3Cookies = refresh2.get('Set-Cookie');
      const rt3 = (refresh3Cookies as string[])?.[0]
        ?.split(';')[0]
        ?.split('=')[1];

      const refresh4 = await request(app)
        .post('/auth/refresh-token')
        .set('Cookie', [`refreshToken=${rt3}`]);
      expect(refresh4.status).toBe(401);
    });

    it('2. Invalid Credentials', async () => {
      await request(app).post('/auth/register').send({
        email: 'wrong@test.com',
        password: 'Password@123',
        name: 'User',
      });

      const res = await request(app).post('/auth/login').send({
        email: 'wrong@test.com',
        password: 'wrongpassword',
      });
      expect(res.status).toBe(401);
    });
  });
});
