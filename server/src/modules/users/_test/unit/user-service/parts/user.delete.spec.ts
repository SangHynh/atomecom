import { setupUserServiceTest, mockUser } from '../__fixtures__/user.fixtures.js';
import { USER_STATUS } from '@atomecom/shared';
import { NotFoundError } from '@shared/core/error.response.js';
import type { UserEntity } from '@modules/users/domain/user.entity.js';

describe('UserService - Parts 10 & 16: Delete Logic', () => {
  let { userService, mockUserRepo, mockEventBus } = setupUserServiceTest();

  beforeEach(() => {
    ({ userService, mockUserRepo, mockEventBus } = setupUserServiceTest());
  });

  describe('Part 10: delete', () => {
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

  describe('Part 16: hardDelete', () => {
    it('should hard delete and log (TC-USR-33)', async () => {
      mockUserRepo.findById.mockResolvedValue(mockUser);
      mockUserRepo.hardDelete.mockResolvedValue(true);

      const result = await userService.hardDelete(mockUser.id!);

      expect(mockUserRepo.hardDelete).toHaveBeenCalledWith(mockUser.id);
      expect(result).toBe(true);
    });
  });
});
