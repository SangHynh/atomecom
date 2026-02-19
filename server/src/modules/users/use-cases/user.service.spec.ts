import { OauthProvider, USER_ROLE, USER_STATUS } from '@atomecom/shared';
import type { IHashService } from '@modules/users/domain/IHash.service.js';
import type { UserEntity } from '@modules/users/domain/user.entity.js';
import type { IUserRepository } from '@modules/users/domain/user.repo.js';
import { UserService } from '@modules/users/use-cases/user.service.js';
import type { EventBus } from '@shared/infra/event-bus.js';

describe('UserService', () => {
  let userService: UserService;
  let mockUserRepo: jest.Mocked<IUserRepository>;
  let mockHashService: jest.Mocked<IHashService>;
  let mockEventBus: jest.Mocked<EventBus>;

  beforeEach(() => {
    mockUserRepo = {
      findByOAuthId: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      findByPhone: jest.fn(),
    };

    mockHashService = {
      hash: jest.fn(),
      compare: jest.fn(),
    };

    mockEventBus = {
      emit: jest.fn(),
    } as any;

    userService = new UserService({
      userRepo: mockUserRepo,
      hashService: mockHashService,
      eventBus: mockEventBus,
    });
  });

  describe('upsertOAuthUser', () => {
    const mockProviderInfo = {
      provider: OauthProvider.GOOGLE,
      providerId: '123456789',
    };

    it('should create a NEW user with isVerified=TRUE if email is provided', async () => {
      // Arrange
      mockUserRepo.findByOAuthId.mockResolvedValue(null);
      mockUserRepo.findByEmail.mockResolvedValue(null);

      const createdUser: UserEntity = {
        id: 'user-1',
        name: 'New User',
        email: 'test@example.com',
        role: USER_ROLE.USER,
        status: USER_STATUS.ACTIVE,
        isVerified: true, // Expected
        isEmailMissing: false,
        isExternal: true,
        addresses: [],
        providers: [mockProviderInfo],
      };
      mockUserRepo.create.mockResolvedValue(createdUser);

      // Act
      const result = await userService.upsertOAuthUser({
        providerInfo: mockProviderInfo,
        email: 'test@example.com',
        name: 'New User',
      });

      // Assert
      expect(mockUserRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          isVerified: true,
          isEmailMissing: false,
        }),
      );
      expect(result.isVerified).toBe(true);
    });

    it('should create a NEW user with isVerified=FALSE if email is MISSING', async () => {
      // Arrange
      mockUserRepo.findByOAuthId.mockResolvedValue(null);
      mockUserRepo.findByEmail.mockResolvedValue(null);

      const createdUser: UserEntity = {
        id: 'user-2',
        name: 'No Email User',
        email: 'google_123456789@atomecom.dummy',
        role: USER_ROLE.USER,
        status: USER_STATUS.ACTIVE,
        isVerified: false, // Expected
        isEmailMissing: true,
        isExternal: true,
        addresses: [],
        providers: [mockProviderInfo],
      };
      mockUserRepo.create.mockResolvedValue(createdUser);

      // Act
      await userService.upsertOAuthUser({
        providerInfo: mockProviderInfo,
        name: 'No Email User',
      });

      // Assert
      expect(mockUserRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          isVerified: false,
          isEmailMissing: true,
        }),
      );
    });

    it('should UPDATE existing user and AUTO-VERIFY if new login has email', async () => {
      // Arrange
      const existingUser: UserEntity = {
        id: 'user-3',
        name: 'Old User',
        email: 'test@example.com',
        role: USER_ROLE.USER,
        status: USER_STATUS.ACTIVE,
        isVerified: false, // Currently unverified
        isEmailMissing: false,
        isExternal: true,
        addresses: [],
        providers: [mockProviderInfo],
      };

      mockUserRepo.findByOAuthId.mockResolvedValue(existingUser);

      const updatedUser: UserEntity = {
        ...existingUser,
        isVerified: true, // Verify successful
      };
      mockUserRepo.update.mockResolvedValue(updatedUser);

      // Act
      await userService.upsertOAuthUser({
        providerInfo: mockProviderInfo,
        email: 'test@example.com', // Contains email
        name: 'Old User',
      });

      // Assert
      expect(mockUserRepo.update).toHaveBeenCalledWith(
        'user-3',
        expect.objectContaining({
          isVerified: true, // Check auto-verify logic
        }),
      );
    });

    it('should NOT unverify existing verified user if login has NO email', async () => {
      // Arrange
      const existingUser: UserEntity = {
        id: 'user-4',
        name: 'Verified User',
        email: 'test@example.com',
        role: USER_ROLE.USER,
        status: USER_STATUS.ACTIVE,
        isVerified: true, // Already verified
        isEmailMissing: false,
        isExternal: true,
        addresses: [],
        providers: [mockProviderInfo],
      };

      mockUserRepo.findByOAuthId.mockResolvedValue(existingUser);
      mockUserRepo.update.mockResolvedValue(existingUser);

      // Act
      await userService.upsertOAuthUser({
        providerInfo: mockProviderInfo,
        name: 'Verified User',
      });

      // Assert
      expect(mockUserRepo.update).toHaveBeenCalledWith(
        'user-4',
        expect.objectContaining({
          isVerified: true, // Should remain true
        }),
      );
    });
  });
});
