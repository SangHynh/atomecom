import { setupUserServiceTest, mockUser } from '../__fixtures__/user.fixtures.js';
import { USER_STATUS } from '@atomecom/shared';
import type { UserEntity } from '@modules/users/domain/user.entity.js';

describe('UserService - Part 6 & 7: Status & Updates', () => {
  let { userService, mockUserRepo, mockEventBus } = setupUserServiceTest();

  beforeEach(() => {
    ({ userService, mockUserRepo, mockEventBus } = setupUserServiceTest());
  });

  describe('Part 6: updateStatusAccount', () => {
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

  describe('Part 7: updateUser', () => {
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
});
