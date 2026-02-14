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
import { ErrorUserCodes } from '@shared/core/error.enum.js';
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from '@shared/core/error.response.js';
import { USER_STATUS } from '@shared/enum/userStatus.enum.js';
import type { UserEntity } from '@modules/users/domain/user.entity.js';
import { USER_ROLE } from '@shared/enum/userRole.enum.js';

describe('UserService', () => {
  let userService: UserService;
  let mockUserRepo: jest.Mocked<IUserRepository>;
  let mockHashService: jest.Mocked<IHashService>;

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
    version: 1,
  };

  beforeEach(() => {
    mockUserRepo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByPhone: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };

    mockHashService = {
      hash: jest.fn(),
      compare: jest.fn(),
    };

    userService = new UserService({
      userRepo: mockUserRepo as unknown as IUserRepository,
      hashService: mockHashService as unknown as IHashService,
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
        userService.verifyCredentials('nonexistent@example.com', 'password123'),
      ).rejects.toThrow(UnauthorizedError);

      await expect(
        userService.verifyCredentials('nonexistent@example.com', 'password123'),
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
        userService.verifyCredentials('jane@example.com', 'password123'),
      ).rejects.toThrow(UnauthorizedError);

      await expect(
        userService.verifyCredentials('jane@example.com', 'password123'),
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
      const existingUser = { ...mockUser, toObject: () => ({}) };
      const updatedUser = {
        ...mockUser,
        email: 'newemail@example.com',
        toObject: () => ({}),
      };

      mockUserRepo.findById.mockResolvedValue(
        existingUser as unknown as UserEntity,
      );
      mockUserRepo.findByEmail.mockResolvedValue(null); // new email is unique
      mockUserRepo.update.mockResolvedValue(
        updatedUser as unknown as UserEntity,
      );

      await userService.changeEmail(
        '507f1f77bcf86cd799439011',
        'newemail@example.com',
      );

      expect(mockUserRepo.findById).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        USER_STATUS.ACTIVE,
      );
      expect(mockUserRepo.findByEmail).toHaveBeenCalledWith(
        'newemail@example.com',
      );
      expect(mockUserRepo.update).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        {
          email: 'newemail@example.com',
        },
      );
    });

    it('should throw ConflictError(EMAIL_ALREADY_EXISTS) when new email is taken by another user', async () => {
      const existingUser = { ...mockUser, toObject: () => ({}) };
      const otherUser = {
        ...mockUser,
        id: 'other-id',
        email: 'taken@example.com',
        toObject: () => ({}),
      };

      mockUserRepo.findById.mockResolvedValue(
        existingUser as unknown as UserEntity,
      );
      mockUserRepo.findByEmail.mockResolvedValue(
        otherUser as unknown as UserEntity,
      );

      await expect(
        userService.changeEmail(
          '507f1f77bcf86cd799439011',
          'taken@example.com',
        ),
      ).rejects.toThrow(ConflictError);

      await expect(
        userService.changeEmail(
          '507f1f77bcf86cd799439011',
          'taken@example.com',
        ),
      ).rejects.toMatchObject({
        message: ErrorUserCodes.EMAIL_ALREADY_EXISTS,
      });

      expect(mockUserRepo.update).not.toHaveBeenCalled();
    });

    it('should allow changeEmail when new email is same as current (excludeId prevents false conflict)', async () => {
      const existingUser = {
        ...mockUser,
        email: 'jane@example.com',
        toObject: () => ({ ...mockUser, email: 'jane@example.com' }),
      };

      mockUserRepo.findById.mockResolvedValue(
        existingUser as unknown as UserEntity,
      );
      mockUserRepo.findByEmail.mockResolvedValue(
        existingUser as unknown as UserEntity,
      );
      mockUserRepo.update.mockResolvedValue(
        existingUser as unknown as UserEntity,
      );

      const result = await userService.changeEmail(
        '507f1f77bcf86cd799439011',
        'jane@example.com',
      );

      expect(result).toBeDefined();
      expect(mockUserRepo.update).toHaveBeenCalled();
    });
  });

  describe('changePhone - Identity Uniqueness', () => {
    it('should run findById and _validatePhoneUniqueness in parallel via Promise.all', async () => {
      const existingUser = { ...mockUser, toObject: () => ({}) };
      const updatedUser = {
        ...mockUser,
        phone: '09999999999',
        toObject: () => ({}),
      };

      mockUserRepo.findById.mockResolvedValue(
        existingUser as unknown as UserEntity,
      );
      mockUserRepo.findByPhone.mockResolvedValue(null);
      mockUserRepo.update.mockResolvedValue(
        updatedUser as unknown as UserEntity,
      );

      await userService.changePhone('507f1f77bcf86cd799439011', '09999999999');

      expect(mockUserRepo.findById).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        USER_STATUS.ACTIVE,
      );
      expect(mockUserRepo.findByPhone).toHaveBeenCalledWith('09999999999');
      expect(mockUserRepo.update).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        {
          phone: '09999999999',
        },
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
});
