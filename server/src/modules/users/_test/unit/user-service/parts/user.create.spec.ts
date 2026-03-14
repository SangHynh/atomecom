import { setupUserServiceTest, mockUser } from '../__fixtures__/user.fixtures.js';
import { DomainEvents } from '@shared/constants/event.constants.js';
import { ConflictError } from '@shared/core/error.response.js';
import type { UserEntity } from '@modules/users/domain/user.entity.js';

describe('UserService - Part 11: create', () => {
  let { userService, mockUserRepo, mockHashService, mockEventBus } = setupUserServiceTest();

  beforeEach(() => {
    ({ userService, mockUserRepo, mockHashService, mockEventBus } = setupUserServiceTest());
  });

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
