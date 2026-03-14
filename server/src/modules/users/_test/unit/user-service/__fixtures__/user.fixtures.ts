import { UserService } from '@modules/users/use-cases/user.service.js';
import type { IUserRepository } from '@modules/users/domain/user.repo.js';
import type { IHashService } from '@modules/users/domain/IHash.service.js';
import type { EventBus } from '@shared/infra/event-bus.js';
import { USER_ROLE, USER_STATUS } from '@atomecom/shared';
import type { UserEntity } from '@modules/users/domain/user.entity.js';

export const mockUser: UserEntity = {
  id: '507f1f77bcf86cd799439011',
  name: 'Jane Doe',
  email: 'jane@example.com',
  phone: '09123456789',
  password: '$2b$10$hashedpassword',
  role: USER_ROLE.USER,
  status: USER_STATUS.ACTIVE,
  isVerified: false,
  addresses: [],
  providers: [],
  isExternal: false,
  isEmailMissing: false,
  version: 1,
};

export const createMockUserRepo = () => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  findByPhone: jest.fn(),
  findByOAuthId: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  hardDelete: jest.fn(),
  count: jest.fn(),
} as unknown as jest.Mocked<IUserRepository>);

export const createMockHashService = () => ({
  hash: jest.fn(),
  compare: jest.fn(),
} as unknown as jest.Mocked<IHashService>);

export const createMockEventBus = () => ({
  emit: jest.fn(),
  on: jest.fn(),
} as unknown as jest.Mocked<EventBus>);

export const createMockCache = () => ({
  get: jest.fn(),
  set: jest.fn(),
  has: jest.fn(),
  countByPattern: jest.fn(),
});

export const setupUserServiceTest = () => {
  const mockUserRepo = createMockUserRepo();
  const mockHashService = createMockHashService();
  const mockEventBus = createMockEventBus();
  const mockCache = createMockCache();

  const userService = new UserService({
    userRepo: mockUserRepo as unknown as IUserRepository,
    hashService: mockHashService as unknown as IHashService,
    eventBus: mockEventBus as any,
    cache: mockCache as any,
  });

  return {
    userService,
    mockUserRepo,
    mockHashService,
    mockEventBus,
    mockCache,
  };
};
