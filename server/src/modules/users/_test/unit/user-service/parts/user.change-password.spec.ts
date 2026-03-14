import { setupUserServiceTest, mockUser } from '../__fixtures__/user.fixtures.js';
import type { UserEntity } from '@modules/users/domain/user.entity.js';

describe('UserService - Part 14: changePassword', () => {
  let { userService, mockUserRepo, mockHashService } = setupUserServiceTest();

  beforeEach(() => {
    ({ userService, mockUserRepo, mockHashService } = setupUserServiceTest());
  });

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
