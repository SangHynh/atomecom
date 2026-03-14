import { setupUserServiceTest, mockUser } from '../__fixtures__/user.fixtures.js';
import type { UserEntity } from '@modules/users/domain/user.entity.js';

describe('UserService - Part 12: createWithSession', () => {
  let { userService, mockUserRepo, mockHashService } = setupUserServiceTest();

  beforeEach(() => {
    ({ userService, mockUserRepo, mockHashService } = setupUserServiceTest());
  });

  const createUserDto = {
    name: 'New User',
    email: 'new@example.com',
    password: 'plainpassword',
  };

  it('should create user and return session result (TC-USR-39)', async () => {
    mockUserRepo.findByEmail.mockResolvedValue(null);
    mockHashService.hash.mockResolvedValue('hashed');
    mockUserRepo.create.mockResolvedValue({
      ...mockUser,
      id: 'new-id',
      email: createUserDto.email,
    } as UserEntity);

    const sessionCreator = jest.fn().mockResolvedValue('tokens');

    const result = await userService.createWithSession(
      createUserDto,
      sessionCreator,
    );

    expect(result.user.id).toBe('new-id');
    expect(result.result).toBe('tokens');
    expect(sessionCreator).toHaveBeenCalled();
    expect(mockUserRepo.hardDelete).not.toHaveBeenCalled();
  });

  it('should rollback (hardDelete) user if session creator fails (TC-USR-40)', async () => {
    mockUserRepo.findByEmail.mockResolvedValue(null);
    mockHashService.hash.mockResolvedValue('hashed');
    const mockCreatedUser = {
      ...mockUser,
      id: 'new-id',
      email: createUserDto.email,
      toObject: () => ({ ...mockUser, id: 'new-id', email: createUserDto.email }),
    };
    mockUserRepo.create.mockResolvedValue(mockCreatedUser as UserEntity);
    mockUserRepo.findById.mockResolvedValue(mockCreatedUser as UserEntity);
    mockUserRepo.hardDelete.mockResolvedValue(true);

    const sessionCreator = jest
      .fn()
      .mockRejectedValue(new Error('Session Fail'));

    await expect(
      userService.createWithSession(createUserDto, sessionCreator),
    ).rejects.toThrow('Session Fail');

    expect(mockUserRepo.hardDelete).toHaveBeenCalledWith('new-id');
  });

  it('should prioritize origin error and log if hardDelete fails (TC-USR-41)', async () => {
    mockUserRepo.findByEmail.mockResolvedValue(null);
    mockHashService.hash.mockResolvedValue('hashed');
    const mockCreatedUser = {
      ...mockUser,
      id: 'new-id',
      email: createUserDto.email,
      toObject: () => ({ ...mockUser, id: 'new-id', email: createUserDto.email }),
    };
    mockUserRepo.create.mockResolvedValue(mockCreatedUser as UserEntity);
    mockUserRepo.findById.mockResolvedValue(mockCreatedUser as UserEntity);

    const sessionCreator = jest
      .fn()
      .mockRejectedValue(new Error('Origin Error'));
    mockUserRepo.hardDelete.mockRejectedValue(new Error('DB Down'));

    await expect(
      userService.createWithSession(createUserDto, sessionCreator),
    ).rejects.toThrow('Origin Error');

    expect(mockUserRepo.hardDelete).toHaveBeenCalledWith('new-id');
  });
});
