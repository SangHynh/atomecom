import { setupUserServiceTest, mockUser } from '../__fixtures__/user.fixtures.js';
import { ConflictError, NotFoundError } from '@shared/core/error.response.js';
import type { UserEntity } from '@modules/users/domain/user.entity.js';

describe('UserService - Part 3 & 4: change identity (email & phone)', () => {
  let { userService, mockUserRepo } = setupUserServiceTest();

  beforeEach(() => {
    ({ userService, mockUserRepo } = setupUserServiceTest());
  });

  describe('Part 3: changeEmail', () => {
    it('should update email and set isVerified to false (TC-USR-14)', async () => {
      mockUserRepo.findById.mockResolvedValue(mockUser);
      mockUserRepo.findByEmail.mockResolvedValue(null);
      mockUserRepo.update.mockResolvedValue({
        ...mockUser,
        email: 'new@example.com',
        isVerified: false,
      } as UserEntity);

      const result = await userService.changeEmail(mockUser.id!, 'new@example.com');

      expect(mockUserRepo.update).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          email: 'new@example.com',
          isVerified: false,
        }),
      );
      expect(result!.email).toBe('new@example.com');
    });

    it('should throw ConflictError if email already exists (TC-USR-15)', async () => {
      mockUserRepo.findById.mockResolvedValue(mockUser);
      // Mock search for another user with the same email
      mockUserRepo.findByEmail.mockResolvedValue({ id: 'other-user-uuid' } as UserEntity);

      await expect(
        userService.changeEmail(mockUser.id!, 'taken@example.com'),
      ).rejects.toThrow(ConflictError);
    });

    it('should throw NotFoundError if user not found via id', async () => {
      mockUserRepo.findById.mockResolvedValue(null);
      
      await expect(
        userService.changeEmail('ghost', 'new@ex.com')
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('Part 4: changePhone', () => {
    it('should update phone successfully (TC-USR-16)', async () => {
      mockUserRepo.findById.mockResolvedValue(mockUser);
      mockUserRepo.findByPhone.mockResolvedValue(null);
      mockUserRepo.update.mockResolvedValue({
        ...mockUser,
        phone: '0987654321',
      } as UserEntity);

      const result = await userService.changePhone(mockUser.id!, '0987654321');

      expect(mockUserRepo.update).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({ phone: '0987654321' }),
      );
      expect(result!.phone).toBe('0987654321');
    });

    it('should throw ConflictError if phone already exists (TC-USR-17)', async () => {
      mockUserRepo.findById.mockResolvedValue(mockUser);
      mockUserRepo.findByPhone.mockResolvedValue({ id: 'other-user-uuid' } as UserEntity);

      await expect(
        userService.changePhone(mockUser.id!, '0987654321'),
      ).rejects.toThrow(ConflictError);
    });
  });
});
