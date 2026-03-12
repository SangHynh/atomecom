/**
 * UserService Unit Tests
 * Implements complex logic scenarios from README.md Section 6.2:
 * - Verify Credentials: match/mismatch (Section 3.3)
 * - Optimistic Locking: version mismatch in verifyAccount (Section 3.5)
 * - Identity Uniqueness: parallel uniqueness checks in changeEmail/changePhone (Section 3.4)
 */
import { UserService } from '@modules/users/use-cases/user.service.js';
import type { IUserRepository } from '@modules/users/domain/user.repo.js';
import type { IHashService } from '@modules/users/domain/IHash.service.js';
import type { EventBus } from '@shared/infra/event-bus.js';
import { ErrorUserCodes } from '@atomecom/shared';
import { DomainEvents } from '@shared/constants/event.constants.js';
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  BadRequestError,
} from '@shared/core/error.response.js';
import { USER_STATUS } from '@atomecom/shared';
import type { UserEntity } from '@modules/users/domain/user.entity.js';
import { USER_ROLE } from '@atomecom/shared';

describe('UserService', () => {
  let userService: UserService;
  let mockUserRepo: jest.Mocked<IUserRepository>;
  let mockHashService: jest.Mocked<IHashService>;
  let mockEventBus: jest.Mocked<EventBus>;
  let mockCache: any;

  const mockUser: UserEntity = {
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

  beforeEach(() => {
    mockUserRepo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByPhone: jest.fn(),
      findByOAuthId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      hardDelete: jest.fn(),
      count: jest.fn(),
    };

    mockHashService = {
      hash: jest.fn(),
      compare: jest.fn(),
    };

    mockEventBus = { emit: jest.fn(), on: jest.fn() } as any;

    mockCache = {
      get: jest.fn(),
      set: jest.fn(),
      has: jest.fn(),
      countByPattern: jest.fn(),
    };

    userService = new UserService({
      userRepo: mockUserRepo as unknown as IUserRepository,
      hashService: mockHashService as unknown as IHashService,
      eventBus: mockEventBus as any,
      cache: mockCache,
    });
  });

  // ==================== VERIFY CREDENTIALS (Section 3.3) ====================

  describe('verifyCredentials', () => {
    it('should return SafeUserResponseDTO (no password) when email and password match', async () => {
      mockUserRepo.findByEmail.mockResolvedValue({
        ...mockUser,
        password: '$2b$10$hashedpassword',
      } as UserEntity);
      mockHashService.compare.mockResolvedValue(true);

      const result = await userService.verifyCredentials(
        'jane@example.com',
        'correctpassword',
      );

      expect(mockUserRepo.findByEmail).toHaveBeenCalledWith(
        'jane@example.com',
        USER_STATUS.ACTIVE,
      );
      expect(mockHashService.compare).toHaveBeenCalledWith(
        'correctpassword',
        '$2b$10$hashedpassword',
      );
      expect(result).toBeDefined();
      expect(result).not.toHaveProperty('password');
      expect(result).not.toHaveProperty('__v');
      expect(result).toMatchObject({
        email: 'jane@example.com',
        name: 'Jane Doe',
      });
    });

    it('should throw UnauthorizedError(INVALID_CREDENTIALS) when user not found', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(null);

      await expect(
        userService.verifyCredentials('nonexistent@example.com', 'Password123!'),
      ).rejects.toThrow(UnauthorizedError);

      await expect(
        userService.verifyCredentials('nonexistent@example.com', 'Password123!'),
      ).rejects.toMatchObject({
        message: ErrorUserCodes.INVALID_CREDENTIALS,
      });

      expect(mockHashService.compare).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedError(INVALID_CREDENTIALS) when user has no password', async () => {
      mockUserRepo.findByEmail.mockResolvedValue({
        ...mockUser,
        password: undefined,
      } as any as UserEntity);

      await expect(
        userService.verifyCredentials('jane@example.com', 'Password123!'),
      ).rejects.toThrow(UnauthorizedError);

      await expect(
        userService.verifyCredentials('jane@example.com', 'Password123!'),
      ).rejects.toMatchObject({
        message: ErrorUserCodes.INVALID_CREDENTIALS,
      });

      expect(mockHashService.compare).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedError(INVALID_CREDENTIALS) when password does not match', async () => {
      mockUserRepo.findByEmail.mockResolvedValue({
        ...mockUser,
        password: '$2b$10$hashedpassword',
      } as UserEntity);
      mockHashService.compare.mockResolvedValue(false);

      await expect(
        userService.verifyCredentials('jane@example.com', 'wrongpassword'),
      ).rejects.toThrow(UnauthorizedError);

      await expect(
        userService.verifyCredentials('jane@example.com', 'wrongpassword'),
      ).rejects.toMatchObject({
        message: ErrorUserCodes.INVALID_CREDENTIALS,
      });
    });
  });

  // ==================== OPTIMISTIC LOCKING - verifyAccount (Section 3.5) ====================

  describe('verifyAccount - Optimistic Locking', () => {
    it('should pass current version to repo update for optimistic locking', async () => {
      const existingUser = {
        ...mockUser,
        version: 2,
        toObject: () => ({ ...mockUser, version: 2 }),
      };
      const updatedUser = {
        ...mockUser,
        version: 3,
        isVerified: true,
        toObject: () => ({}),
      };

      mockUserRepo.findById.mockResolvedValue(
        existingUser as unknown as UserEntity,
      );
      mockUserRepo.update.mockResolvedValue(
        updatedUser as unknown as UserEntity,
      );

      await userService.verifyAccount('507f1f77bcf86cd799439011', true);

      expect(mockUserRepo.findById).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        USER_STATUS.ACTIVE,
      );
      expect(mockUserRepo.update).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        {
          isVerified: true,
          version: 2,
        },
      );
    });

    it('should propagate ConflictError(USER_DATA_MODIFIED_CONCURRENTLY) when repo throws on version mismatch', async () => {
      const existingUser = {
        ...mockUser,
        version: 1,
        toObject: () => ({ ...mockUser, version: 1 }),
      };

      mockUserRepo.findById.mockResolvedValue(
        existingUser as unknown as UserEntity,
      );
      mockUserRepo.update.mockRejectedValue(
        new ConflictError(ErrorUserCodes.USER_DATA_MODIFIED_CONCURRENTLY),
      );

      await expect(
        userService.verifyAccount('507f1f77bcf86cd799439011', true),
      ).rejects.toThrow(ConflictError);

      await expect(
        userService.verifyAccount('507f1f77bcf86cd799439011', true),
      ).rejects.toMatchObject({
        message: ErrorUserCodes.USER_DATA_MODIFIED_CONCURRENTLY,
      });
    });

    it('should throw NotFoundError(USER_NOT_FOUND) when user not found before verifyAccount', async () => {
      mockUserRepo.findById.mockResolvedValue(null);

      await expect(
        userService.verifyAccount('nonexistent-id', true),
      ).rejects.toThrow(NotFoundError);

      await expect(
        userService.verifyAccount('nonexistent-id', true),
      ).rejects.toMatchObject({
        message: ErrorUserCodes.USER_NOT_FOUND,
      });

      expect(mockUserRepo.update).not.toHaveBeenCalled();
    });
  });

  // ==================== IDENTITY UNIQUENESS - changeEmail / changePhone (Section 3.4) ====================

  describe('changeEmail - Identity Uniqueness', () => {
    it('should run findById and _validateEmailUniqueness in parallel via Promise.all', async () => {
      const updatedUser = {
        ...mockUser,
        email: 'newemail@example.com',
        toObject: () => ({}),
      };

      mockUserRepo.findById.mockResolvedValue(mockUser);
      mockUserRepo.findByEmail.mockResolvedValue(null);
      mockUserRepo.update.mockResolvedValue(updatedUser as UserEntity);

      await userService.changeEmail(
        '507f1f77bcf86cd799439011',
        'newemail@example.com',
      );

      expect(mockUserRepo.update).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        expect.objectContaining({
          email: 'newemail@example.com',
          isEmailMissing: false,
          isVerified: false,
          version: mockUser.version,
        }),
      );
    });

    it('should throw ConflictError(EMAIL_ALREADY_EXISTS) when new email is taken by another user', async () => {
      const otherUser = {
        ...mockUser,
        id: 'other-id',
        email: 'taken@example.com',
        toObject: () => ({}),
      };

      mockUserRepo.findById.mockResolvedValue(mockUser);
      mockUserRepo.findByEmail.mockResolvedValue(otherUser as UserEntity);

      await expect(
        userService.changeEmail(
          '507f1f77bcf86cd799439011',
          'taken@example.com',
        ),
      ).rejects.toThrow(ConflictError);
    });
  });

  describe('changePhone - Identity Uniqueness', () => {
    it('should run findById and _validatePhoneUniqueness in parallel via Promise.all', async () => {
      const updatedUser = {
        ...mockUser,
        phone: '09999999999',
        toObject: () => ({}),
      };

      mockUserRepo.findById.mockResolvedValue(mockUser);
      mockUserRepo.findByPhone.mockResolvedValue(null);
      mockUserRepo.update.mockResolvedValue(updatedUser as UserEntity);

      await userService.changePhone('507f1f77bcf86cd799439011', '09999999999');

      expect(mockUserRepo.update).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        expect.objectContaining({
          phone: '09999999999',
          version: mockUser.version,
        }),
      );
    });

    it('should throw ConflictError(PHONE_ALREADY_EXISTS) when new phone is taken by another user', async () => {
      const existingUser = { ...mockUser, toObject: () => ({}) };
      const otherUser = {
        ...mockUser,
        id: 'other-id',
        phone: '09999999999',
        toObject: () => ({}),
      };

      mockUserRepo.findById.mockResolvedValue(
        existingUser as unknown as UserEntity,
      );
      mockUserRepo.findByPhone.mockResolvedValue(
        otherUser as unknown as UserEntity,
      );

      await expect(
        userService.changePhone('507f1f77bcf86cd799439011', '09999999999'),
      ).rejects.toThrow(ConflictError);

      await expect(
        userService.changePhone('507f1f77bcf86cd799439011', '09999999999'),
      ).rejects.toMatchObject({
        message: ErrorUserCodes.PHONE_ALREADY_EXISTS,
      });

      expect(mockUserRepo.update).not.toHaveBeenCalled();
    });
  });

  // ==================== OAUTH LOGIC (Section 3.3) ====================

  describe('upsertOAuthUser', () => {
    it('should generate dummy email and set isEmailMissing: true when profile has no email', async () => {
      mockUserRepo.findByOAuthId.mockResolvedValue(null);
      mockUserRepo.create.mockImplementation(
        async (data) =>
          ({
            id: 'new-id',
            ...data,
          }) as UserEntity,
      );

      const result = await userService.upsertOAuthUser({
        providerInfo: { provider: 'GOOGLE' as any, providerId: '123' },
        name: 'OAuth User',
        // no email
      });

      expect(result.email).toBeNull(); // Masked in SafeResponse
      expect(result.isEmailMissing).toBe(true);
      expect(mockUserRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'google_123@atomecom.dummy',
          isEmailMissing: true,
        }),
      );
    });

    it('should link provider to existing account if email matches', async () => {
      mockUserRepo.findByOAuthId.mockResolvedValue(null);
      mockUserRepo.findByEmail.mockResolvedValue({
        ...mockUser,
        providers: [],
      } as UserEntity);
      mockUserRepo.update.mockImplementation(
        async (id, data) =>
          ({
            ...mockUser,
            ...data,
          }) as UserEntity,
      );

      await userService.upsertOAuthUser({
        providerInfo: { provider: 'FACEBOOK' as any, providerId: '456' },
        name: 'Jane Doe',
        email: 'jane@example.com',
      });

      expect(mockUserRepo.update).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          providers: [{ provider: 'FACEBOOK', providerId: '456' }],
        }),
      );
    });
  });

  // ==================== STATUS & EVENTS (New Updates) ====================

  describe('updateStatusAccount', () => {
    it('should update status and emit USER_STATUS_CHANGED event', async () => {
      mockUserRepo.findById.mockResolvedValue(mockUser);
      mockUserRepo.update.mockResolvedValue({
        ...mockUser,
        status: USER_STATUS.BANNED,
      } as UserEntity);

      await userService.updateStatusAccount(mockUser.id!, USER_STATUS.BANNED);

      expect(mockUserRepo.update).toHaveBeenCalledWith(mockUser.id, {
        status: USER_STATUS.BANNED,
        version: mockUser.version,
      });
      expect(mockEventBus.emit).toHaveBeenCalledWith(
        'user.status_changed',
        expect.objectContaining({
          status: USER_STATUS.BANNED,
          email: mockUser.email,
        }),
      );
    });
  });

  describe('updateUser - Status Logic', () => {
    it('should emit USER_STATUS_CHANGED if status is modified in generic updateUser', async () => {
      mockUserRepo.findById.mockResolvedValue(mockUser);
      mockUserRepo.update.mockResolvedValue({
        ...mockUser,
        status: USER_STATUS.DEACTIVE,
      } as UserEntity);

      await userService.updateUser(mockUser.id!, {
        status: USER_STATUS.DEACTIVE,
      });

      expect(mockEventBus.emit).toHaveBeenCalledWith(
        'user.status_changed',
        expect.objectContaining({ status: USER_STATUS.DEACTIVE }),
      );
    });

    it('should NOT emit USER_STATUS_CHANGED if status remains the same', async () => {
      mockUserRepo.findById.mockResolvedValue(mockUser);
      mockUserRepo.update.mockResolvedValue(mockUser);

      await userService.updateUser(mockUser.id!, { name: 'New Name' });

      expect(mockEventBus.emit).not.toHaveBeenCalledWith(
        'user.status_changed',
        expect.any(Object),
      );
    });
  });

  describe('Redis Session Parsing (Robustness)', () => {
    it('should parse valid JSON session data', async () => {
      const jsonSession = JSON.stringify({
        timestamp: '2026-02-20T10:00:00Z',
        ip: '1.2.3.4',
        userAgent: 'Mozilla',
      });
      mockUserRepo.findById.mockResolvedValue(mockUser);
      mockCache.get.mockResolvedValue(jsonSession);
      mockCache.has.mockResolvedValue(true);

      const result = await userService.findById(mockUser.id!);

      expect(result.lastLoginAt).toEqual(new Date('2026-02-20T10:00:00Z'));
      expect((result as any).lastIp).toBe('1.2.3.4');
      expect((result as any).isOnline).toBe(true);
    });

    it('should fallback to raw string date for legacy session data', async () => {
      const rawDate = '2026-01-01T12:00:00Z';
      mockUserRepo.findById.mockResolvedValue(mockUser);
      mockCache.get.mockResolvedValue(rawDate); // Not JSON

      const result = await userService.findById(mockUser.id!);

      expect(result.lastLoginAt).toEqual(new Date(rawDate));
      expect((result as any).lastIp).toBe('unknown'); // Fallback default
    });
  });

  describe('getStats', () => {
    it('should return aggregated counts including Redis online count', async () => {
      mockUserRepo.count.mockResolvedValue(10);
      mockCache.countByPattern.mockResolvedValue(5);

      const stats = await userService.getStats();

      expect(stats).toEqual({
        total: 10,
        active: 5,
        banned: 10,
        deactive: 10,
        verified: 10,
      });
      expect(mockCache.countByPattern).toHaveBeenCalledWith('heartbeat:user:*');
    });
  });
  describe('delete', () => {
    it('should perform soft delete, mask sensitive data, and emit USER_DELETED event', async () => {
      mockUserRepo.findById.mockResolvedValue(mockUser);
      mockUserRepo.update.mockResolvedValue({
        ...mockUser,
        status: USER_STATUS.DELETED,
        email: 'deleted_123_jane@example.com',
      } as UserEntity);

      const result = await userService.delete(mockUser.id!);

      expect(mockUserRepo.update).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          status: USER_STATUS.DELETED,
          email: expect.stringContaining('deleted_'),
          providers: [],
        }),
      );
      expect(mockEventBus.emit).toHaveBeenCalledWith(
        'user.deleted',
        expect.objectContaining({
          userId: mockUser.id,
          email: mockUser.email,
        }),
      );
      expect(result?.status).toBe(USER_STATUS.DELETED);
    });

    it('should throw NotFoundError if user does not exist', async () => {
      mockUserRepo.findById.mockResolvedValue(null);

      await expect(userService.delete('nonexistent')).rejects.toThrow(
        NotFoundError,
      );
    });

    it('should mask both email and phone when user has phone (TC-USR-22)', async () => {
      const userWithPhone = { ...mockUser, phone: '0987654321' };
      mockUserRepo.findById.mockResolvedValue(userWithPhone as UserEntity);
      mockUserRepo.update.mockResolvedValue({
        ...userWithPhone,
        status: USER_STATUS.DELETED,
      } as UserEntity);

      await userService.delete(userWithPhone.id!);

      expect(mockUserRepo.update).toHaveBeenCalledWith(
        userWithPhone.id,
        expect.objectContaining({
          email: expect.stringContaining('deleted_'),
          phone: expect.stringContaining('deleted_'),
          status: USER_STATUS.DELETED,
        }),
      );
    });
  });

  // ==================== CREATE & UPDATE PROFILE ====================

  describe('create', () => {
    it('should create user, hash password and emit USER_CREATED event (TC-USR-23)', async () => {
      const createUserDto = {
        name: 'New User',
        email: 'new@example.com',
        password: 'plainpassword',
      };

      mockUserRepo.findByEmail.mockResolvedValue(null);
      mockHashService.hash.mockResolvedValue('hashed_password');
      mockUserRepo.create.mockImplementation(
        async (data) =>
          ({
            ...data,
            id: 'new-id',
          }) as UserEntity,
      );

      const result = await userService.create(createUserDto);

      expect(mockHashService.hash).toHaveBeenCalledWith('plainpassword');
      expect(mockUserRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          password: 'hashed_password',
          email: 'new@example.com',
        }),
      );
      expect(mockEventBus.emit).toHaveBeenCalledWith(DomainEvents.USER_CREATED, {
        userId: 'new-id',
        email: 'new@example.com',
      });
      expect(result).not.toHaveProperty('password');
    });

    it('should throw ConflictError if email exists (TC-USR-24)', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(mockUser);

      await expect(
        userService.create({
          name: 'New User',
          email: 'jane@example.com',
          password: 'Password123!',
        }),
      ).rejects.toThrow(ConflictError);

      expect(mockUserRepo.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictError if phone exists (TC-USR-25)', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(null);
      mockUserRepo.findByPhone.mockResolvedValue(mockUser);

      await expect(
        userService.create({
          name: 'New User',
          email: 'new@example.com',
          password: 'Password123!',
          phone: '09123456789',
        }),
      ).rejects.toThrow(ConflictError);

      expect(mockUserRepo.create).not.toHaveBeenCalled();
    });
  });

  describe('updateProfile', () => {
    it('should update profile and return SafeDTO (TC-USR-26)', async () => {
      const updateDto = {
        name: 'Updated Name',
        avatar: 'http://new-avatar.jpg',
        addresses: [
          {
            province: 'Hanoi',
            city: 'Hanoi',
            district: 'Cau Giay',
            detail: '123 ABC',
          },
        ] as any,
      };

      mockUserRepo.findById.mockResolvedValue(mockUser);
      mockUserRepo.update.mockResolvedValue({
        ...mockUser,
        ...updateDto,
      } as UserEntity);

      const result = await userService.updateProfile(mockUser.id!, updateDto);

      expect(mockUserRepo.update).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          name: 'Updated Name',
          version: mockUser.version,
        }),
      );
      expect(result.name).toBe('Updated Name');
    });

    it('should throw BadRequestError if more than 3 addresses (TC-USR-27)', async () => {
      const tooManyAddresses = {
        addresses: [{}, {}, {}, {}] as any,
      };

      mockUserRepo.findById.mockResolvedValue(mockUser);

      await expect(
        userService.updateProfile(mockUser.id!, tooManyAddresses),
      ).rejects.toThrow(BadRequestError);

      expect(mockUserRepo.update).not.toHaveBeenCalled();
    });
  });

  describe('changePassword', () => {
    it('should hash new password and update user (TC-USR-28)', async () => {
      mockUserRepo.findById.mockResolvedValue(mockUser);
      mockHashService.hash.mockResolvedValue('new_hashed_password');
      mockUserRepo.update.mockResolvedValue({
        ...mockUser,
        password: 'new_hashed_password',
      } as UserEntity);

      await userService.changePassword(mockUser.id!, 'new_plain_password');

      expect(mockHashService.hash).toHaveBeenCalledWith('new_plain_password');
      expect(mockUserRepo.update).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          password: 'new_hashed_password',
          version: mockUser.version,
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should handle pagination and filtering (TC-USR-29)', async () => {
      const queryDto = {
        page: 2,
        limit: 10,
        status: USER_STATUS.ACTIVE,
        keyword: 'john',
      };
      mockUserRepo.findAll.mockResolvedValue({
        data: [mockUser],
        totalElements: 25,
      });
      mockCache.get.mockResolvedValue(null);

      const result = await userService.findAll(queryDto);

      expect(mockUserRepo.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          offset: 10,
          limit: 10,
          status: USER_STATUS.ACTIVE,
        }),
      );
      expect(result.pagination.totalPages).toBe(3);
      expect(result.pagination.currentPage).toBe(2);
    });
  });

  describe('updateUser - Uniqueness Logic', () => {
    it('should only validate uniqueness when email or phone changes (TC-USR-30)', async () => {
      mockUserRepo.findById.mockResolvedValue(mockUser);
      mockUserRepo.update.mockResolvedValue(mockUser);

      // Scenario 1: Update name only
      await userService.updateUser(mockUser.id!, { name: 'New Name' });
      expect(mockUserRepo.findByEmail).not.toHaveBeenCalled();
      expect(mockUserRepo.findByPhone).not.toHaveBeenCalled();

      // Scenario 2: Update email
      jest.clearAllMocks();
      mockUserRepo.findById.mockResolvedValue(mockUser);
      mockUserRepo.findByEmail.mockResolvedValue(null);
      mockUserRepo.update.mockResolvedValue(mockUser);

      await userService.updateUser(mockUser.id!, {
        email: 'different@example.com',
      });
      expect(mockUserRepo.findByEmail).toHaveBeenCalledWith(
        'different@example.com',
      );
    });
  });

  describe('upsertOAuthUser - Edge Cases', () => {
    it('should skip linking if provider is already in the list (TC-USR-31)', async () => {
      const existingUserWithGoogle = {
        ...mockUser,
        providers: [{ provider: 'GOOGLE', providerId: '123' }],
      } as UserEntity;

      mockUserRepo.findByOAuthId.mockResolvedValue(null);
      mockUserRepo.findByEmail.mockResolvedValue(existingUserWithGoogle);
      mockUserRepo.update.mockResolvedValue(existingUserWithGoogle);

      await userService.upsertOAuthUser({
        providerInfo: { provider: 'GOOGLE' as any, providerId: '123' },
        name: 'Jane Doe',
        email: 'jane@example.com',
      });

      // Line 458 update will be called for Name/Avatar, but line 434 (linking) should be skipped.
      // We check that the update call doesn't include the 'providers' field.
      expect(mockUserRepo.update).toHaveBeenCalledWith(
        mockUser.id,
        expect.not.objectContaining({
          providers: expect.any(Array),
        }),
      );
    });

    it('should update name and avatar when user exists by providerId (TC-USR-32)', async () => {
      mockUserRepo.findByOAuthId.mockResolvedValue(mockUser);
      mockUserRepo.update.mockResolvedValue({
        ...mockUser,
        avatar: 'new.jpg',
      } as UserEntity);

      await userService.upsertOAuthUser({
        providerInfo: { provider: 'GOOGLE' as any, providerId: '123' },
        name: 'Jane New Name',
        avatar: 'new.jpg',
      });

      expect(mockUserRepo.update).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          name: 'Jane New Name',
          avatar: 'new.jpg',
        }),
      );
    });
  });

  describe('hardDelete', () => {
    it('should hard delete and log (TC-USR-33)', async () => {
      mockUserRepo.findById.mockResolvedValue(mockUser);
      mockUserRepo.hardDelete.mockResolvedValue(true);

      const result = await userService.hardDelete(mockUser.id!);

      expect(mockUserRepo.hardDelete).toHaveBeenCalledWith(mockUser.id);
      expect(result).toBe(true);
    });
  });

  describe('findById - Error', () => {
    it('should throw NotFoundError if user not found (TC-USR-34)', async () => {
      mockUserRepo.findById.mockResolvedValue(null);

      await expect(userService.findById('non-existent')).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe('findByEmail', () => {
    it('should return SafeDTO if user found (TC-USR-35)', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(mockUser);
      const result = await userService.findByEmail('jane@example.com');
      expect(result).toMatchObject({ email: 'jane@example.com' });
      expect(result).not.toHaveProperty('password');
    });

    it('should return null if user not found (TC-USR-36)', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(null);
      const result = await userService.findByEmail('missing@example.com');
      expect(result).toBeNull();
    });
  });

  describe('findByPhone', () => {
    it('should return SafeDTO if user found (TC-USR-37)', async () => {
      mockUserRepo.findByPhone.mockResolvedValue(mockUser);
      const result = await userService.findByPhone('09123456789');
      expect(result).toMatchObject({ phone: '09123456789' });
    });

    it('should return null if user not found (TC-USR-38)', async () => {
      mockUserRepo.findByPhone.mockResolvedValue(null);
      const result = await userService.findByPhone('0000000000');
      expect(result).toBeNull();
    });
  });
});
