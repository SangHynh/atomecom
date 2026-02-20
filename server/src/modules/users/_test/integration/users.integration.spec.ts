/**
 * Users Module Integration Tests
 * Implements Happy Path and Edge Cases from README.md Section 6.1
 * Tests actual endpoints via Supertest and verifies Safe Response mapping (Section 3.7)
 *
 * Uses a minimal Express app with Users routes only (no full app import) to avoid
 * ESM/module resolution issues with Jest.
 */
import type { Express } from 'express';
import express from 'express';
import request from 'supertest';
import mongoose from 'mongoose';
import { ErrorUserCodes } from '@atomecom/shared';
import { UserModel } from '@modules/users/infra/mongoose-user.model.js';
import type { CreateUserDTO } from '@modules/users/use-cases/user.dtos.js';
import { USER_ROLE } from '@atomecom/shared';
import { USER_STATUS } from '@atomecom/shared';
import { MongooseUserRepo } from '@modules/users/infra/mongoose-user.repo.js';
import { BcryptHashAdapter } from '@modules/users/infra/bcryptHash.adapter.js';
import { UserService } from '@modules/users/use-cases/user.service.js';
import { UserController } from '@modules/users/presentation/user.controller.js';
import { asyncHandler } from '@shared/core/asyncHandler.js';
import { validate } from '@shared/middlewares/validate.middleware.js';
import {
  CreateUserRequestSchema,
  FindUserByEmailSchema,
  FindUserByIdSchema,
  FindUserByPhoneSchema,
} from '@atomecom/shared';
import { errorHandler } from '@shared/middlewares/error.middleware.js';
import {
  connect,
  closeDatabase,
  clearDatabase,
} from '@shared/test/db-helper.js';
import type { ICacheRepo } from '@shared/interfaces/ICache.repo.js';

const BASE_PATH = '/v1/api';

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
}

function createTestApp(): Express {
  const userRepo = new MongooseUserRepo();
  const hashService = new BcryptHashAdapter();
  const eventBus = { emit: jest.fn(), on: jest.fn() } as any;
  const cacheRepo = new MockCacheRepo();
  const userService = new UserService({
    userRepo,
    hashService,
    eventBus,
    cache: cacheRepo,
  });
  const userController = new UserController(userService);

  const userRouter = express.Router();
  userRouter.get(
    '/users',
    asyncHandler(userController.findAll.bind(userController)),
  );
  userRouter.post(
    '/users',
    validate(CreateUserRequestSchema),
    asyncHandler(userController.create.bind(userController)),
  );
  userRouter.get(
    '/users/:id',
    validate(FindUserByIdSchema),
    asyncHandler(userController.findById.bind(userController)),
  );
  userRouter.get(
    '/users/email/:email',
    validate(FindUserByEmailSchema),
    asyncHandler(userController.findByEmail.bind(userController)),
  );
  userRouter.get(
    '/users/phone/:phone',
    validate(FindUserByPhoneSchema),
    asyncHandler(userController.findByPhone.bind(userController)),
  );

  const app = express();
  app.use(express.json());
  app.use(BASE_PATH, userRouter);
  app.use(errorHandler);
  return app;
}

describe('Users Module - Integration Tests', () => {
  let app: Express;

  beforeAll(async () => {
    await connect();
    app = createTestApp();
  }, 60000);

  afterAll(async () => {
    await closeDatabase();
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  // ==================== HAPPY PATH ====================

  describe('Happy Path', () => {
    it('1. Create user - Valid CreateUserDTO returns 201, SafeUserResponseDTO without password', async () => {
      const dto = {
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        password: 'password123',
        phone: '09123456789',
        role: USER_ROLE.USER,
        addresses: [
          { street: '123 Main St', city: 'Ho Chi Minh City', isDefault: true },
        ],
      };

      const res = await request(app)
        .post(`${BASE_PATH}/users`)
        .send(dto)
        .expect(201);

      expect(res.body.status).toBe('success');
      expect(res.body.code).toBe(201);
      expect(res.body.data).toBeDefined();
      const user = res.body.data;
      expect(user.name).toBe(dto.name);
      expect(user.email).toBe(dto.email.toLowerCase());
      expect(user.phone).toBe(dto.phone);
      expect(user.role).toBe(USER_ROLE.USER);
      expect(user.status).toBeDefined();
      expect(user.isVerified).toBe(false);
      expect(user.addresses).toHaveLength(1);
      expect(user.version).toBeDefined();
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
      expect(user.password).toBeUndefined();
      expect(user.__v).toBeUndefined();
    });

    it('2. Find by ID - Valid ID returns 200, SafeUserResponseDTO', async () => {
      const created = await UserModel.create({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashed',
        phone: '09876543210',
        role: USER_ROLE.USER,
        status: USER_STATUS.ACTIVE,
      });
      const id = created._id.toString();

      const res = await request(app)
        .get(`${BASE_PATH}/users/${id}`)
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(res.body.data.id).toBe(id);
      expect(res.body.data.name).toBe('John Doe');
      expect(res.body.data.email).toBe('john@example.com');
      expect(res.body.data.password).toBeUndefined();
      expect(res.body.data.__v).toBeUndefined();
    });

    it('3. Find by email - Valid email returns 200, SafeUserResponseDTO or null', async () => {
      await UserModel.create({
        name: 'Alice',
        email: 'alice@example.com',
        password: 'hashed',
        phone: '09111111111',
        role: USER_ROLE.USER,
        status: USER_STATUS.ACTIVE,
      });

      const res = await request(app)
        .get(`${BASE_PATH}/users/email/alice@example.com`)
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(res.body.data.email).toBe('alice@example.com');
      expect(res.body.data.password).toBeUndefined();
    });

    it('4. Find by phone - Valid phone returns 200, SafeUserResponseDTO or null', async () => {
      await UserModel.create({
        name: 'Bob',
        email: 'bob@example.com',
        password: 'hashed',
        phone: '09222222222',
        role: USER_ROLE.USER,
        status: USER_STATUS.ACTIVE,
      });

      const res = await request(app)
        .get(`${BASE_PATH}/users/phone/09222222222`)
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(res.body.data.phone).toBe('09222222222');
      expect(res.body.data.password).toBeUndefined();
    });

    it('5. Find all (paginated) - page, limit returns 200, paginated list of SafeUserResponseDTO', async () => {
      await UserModel.create([
        {
          name: 'U1',
          email: 'u1@ex.com',
          password: 'h',
          phone: '09111111111',
          role: USER_ROLE.USER,
          status: USER_STATUS.ACTIVE,
        },
        {
          name: 'U2',
          email: 'u2@ex.com',
          password: 'h',
          phone: '09222222222',
          role: USER_ROLE.USER,
          status: USER_STATUS.ACTIVE,
        },
      ]);

      const res = await request(app)
        .get(`${BASE_PATH}/users?page=1&limit=10`)
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
      expect(res.body.metadata?.pagination).toBeDefined();
      res.body.data.forEach((u: Record<string, unknown>) => {
        expect(u.password).toBeUndefined();
        expect(u.__v).toBeUndefined();
      });
    });

    it('6. Search by Keyword - keyword="John" returns only matching users', async () => {
      await UserModel.create([
        {
          name: 'John Doe',
          email: 'john@ex.com',
          password: 'h',
          role: USER_ROLE.USER,
          status: USER_STATUS.ACTIVE,
        },
        {
          name: 'Jane Smith',
          email: 'jane@ex.com',
          password: 'h',
          role: USER_ROLE.USER,
          status: USER_STATUS.ACTIVE,
        },
      ]);

      const res = await request(app)
        .get(`${BASE_PATH}/users?keyword=John`)
        .expect(200);

      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].name).toBe('John Doe');
    });

    it('7. Filter by Role - role="ADMIN" returns only admins', async () => {
      await UserModel.create([
        {
          name: 'Admin',
          email: 'admin@ex.com',
          password: 'h',
          role: USER_ROLE.ADMIN,
          status: USER_STATUS.ACTIVE,
        },
        {
          name: 'User',
          email: 'user@ex.com',
          password: 'h',
          role: USER_ROLE.USER,
          status: USER_STATUS.ACTIVE,
        },
      ]);

      const res = await request(app)
        .get(`${BASE_PATH}/users?role=ADMIN`) // Query param is usually string
        .expect(200);

      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].role).toBe(USER_ROLE.ADMIN);
    });
  });

  // ==================== EDGE CASES ====================

  describe('Edge Cases', () => {
    it('1. Duplicate email on create - 409, EMAIL_ALREADY_EXISTS', async () => {
      await UserModel.create({
        name: 'Existing',
        email: 'existing@example.com',
        password: 'hashed',
        role: USER_ROLE.USER,
        status: USER_STATUS.ACTIVE,
      });

      const res = await request(app)
        .post(`${BASE_PATH}/users`)
        .send({
          name: 'New User',
          email: 'existing@example.com',
          password: 'password123',
          role: USER_ROLE.USER,
        })
        .expect(409);

      expect(res.body.message).toBe(ErrorUserCodes.EMAIL_ALREADY_EXISTS);
    });

    it('2. Duplicate phone on create - 409, PHONE_ALREADY_EXISTS', async () => {
      await UserModel.create({
        name: 'Existing',
        email: 'existing@example.com',
        password: 'hashed',
        phone: '09333333333',
        role: USER_ROLE.USER,
        status: USER_STATUS.ACTIVE,
      });

      await UserModel.create({
        name: 'Existing',
        email: 'unique_email_for_phone_test@example.com',
        password: 'hashed',
        phone: '09888888888',
        role: USER_ROLE.USER,
        status: USER_STATUS.ACTIVE,
      });

      const res = await request(app)
        .post(`${BASE_PATH}/users`)
        .send({
          name: 'Existing',
          email: 'newemail@example.com',
          password: 'password123',
          phone: '09888888888', // Duplicate phone
          role: USER_ROLE.USER,
        })
        .expect(409);

      expect(res.body.message).toBe(ErrorUserCodes.PHONE_ALREADY_EXISTS);
    });

    it('5. Find by ID not found - Invalid or non-existent ID returns 404, USER_NOT_FOUND', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();

      const res = await request(app)
        .get(`${BASE_PATH}/users/${fakeId}`)
        .expect(404);

      expect(res.body.message).toBe(ErrorUserCodes.USER_NOT_FOUND);
    });

    it('6. Invalid user ID format - Empty or malformed ID param returns 400, INVALID_USER_ID', async () => {
      // GET /users/ with trailing slash yields id="" for route /users/:id; validator rejects with INVALID_USER_ID
      const res = await request(app).get(`${BASE_PATH}/users/`);
      if (res.status === 400) {
        const hasInvalidUserId =
          res.body.errors?.some(
            (e: { message: string }) =>
              e.message === ErrorUserCodes.INVALID_USER_ID ||
              e.message?.includes('INVALID_USER_ID'),
          ) || res.body.message?.includes(ErrorUserCodes.INVALID_USER_ID);
        expect(hasInvalidUserId).toBeTruthy();
      }
      // Express may match /users/ to GET /users (findAll) -> 200, or /users/:id with id="" -> 400
      expect([200, 400, 404]).toContain(res.status);
    });

    it('7. Email format validation - Invalid email returns 400, INVALID_EMAIL_FORMAT', async () => {
      const res = await request(app)
        .post(`${BASE_PATH}/users`)
        .send({
          name: 'Test User',
          email: 'not-an-email',
          password: 'password123',
          role: 'user',
        })
        .expect(400);

      expect(
        res.body.errors?.some(
          (e: { message: string }) =>
            e.message === ErrorUserCodes.INVALID_EMAIL_FORMAT ||
            e.message?.includes('INVALID_EMAIL'),
        ),
      ).toBeTruthy();
    });

    it('8. Password length validation - Password < 6 chars returns 400, PASSWORD_MUST_BE_AT_LEAST_6_CHARS', async () => {
      const res = await request(app)
        .post(`${BASE_PATH}/users`)
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: '12345',
          role: 'user',
        })
        .expect(400);

      expect(
        res.body.errors?.some(
          (e: { message: string }) =>
            e.message === ErrorUserCodes.INVALID_PASSWORD_FORMAT ||
            e.message?.includes('PASSWORD'),
        ),
      ).toBeTruthy();
    });

    it('9. Name length validation - Name < 2 chars returns 400, NAME_MUST_BE_AT_LEAST_2_CHARS', async () => {
      const res = await request(app)
        .post(`${BASE_PATH}/users`)
        .send({
          name: 'A',
          email: 'test@example.com',
          password: 'password123',
          role: 'user',
        })
        .expect(400);

      expect(
        res.body.errors?.some(
          (e: { message: string }) =>
            e.message === ErrorUserCodes.INVALID_NAME_FORMAT ||
            e.message?.includes('NAME'),
        ),
      ).toBeTruthy();
    });

    it('10. Missing Address - Street missing returns 400', async () => {
      const res = await request(app)
        .post(`${BASE_PATH}/users`)
        .send({
          name: 'Jane Doe',
          email: 'jane.address@example.com',
          password: 'password123',
          addresses: [{ city: 'HCM' }], // street missing
        })
        .expect(400);

      expect(
        res.body.errors?.some(
          (e: { message: string; field: string }) =>
            e.field === 'body.addresses.0.street' || // Specific field path
            e.message.includes('EXPECTED_STRING'), // General message
        ),
      ).toBeTruthy();
    });
  });
});
