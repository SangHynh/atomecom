import { setupUserServiceTest, mockUser } from '../__fixtures__/user.fixtures.js';
import { BadRequestError } from '@shared/core/error.response.js';
import type { UserEntity } from '@modules/users/domain/user.entity.js';

describe('UserService - Part 13: updateProfile', () => {
  let { userService, mockUserRepo } = setupUserServiceTest();

  beforeEach(() => {
    ({ userService, mockUserRepo } = setupUserServiceTest());
  });

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
