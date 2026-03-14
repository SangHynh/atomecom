import { setupUserServiceTest, mockUser } from '../__fixtures__/user.fixtures.js';
import { UnauthorizedError } from '@shared/core/error.response.js';

describe('UserService - Part 1: verifyCredentials', () => {
  let { userService, mockUserRepo, mockHashService } = setupUserServiceTest();

  beforeEach(() => {
    ({ userService, mockUserRepo, mockHashService } = setupUserServiceTest());
  });

  it('should return user if credentials match (TC-USR-01)', async () => {
    mockUserRepo.findByEmail.mockResolvedValue(mockUser);
    mockHashService.compare.mockResolvedValue(true);

    const result = await userService.verifyCredentials(
      'jane@example.com',
      'password',
    );

    expect(result!.id).toBe(mockUser.id);
  });

  it('should throw UnauthorizedError if user not found (TC-USR-02)', async () => {
    mockUserRepo.findByEmail.mockResolvedValue(null);

    await expect(
      userService.verifyCredentials('missing@example.com', 'password'),
    ).rejects.toThrow(UnauthorizedError);
  });

  it('should throw UnauthorizedError if password does not match (TC-USR-03)', async () => {
    mockUserRepo.findByEmail.mockResolvedValue(mockUser);
    mockHashService.compare.mockResolvedValue(false);

    await expect(
      userService.verifyCredentials('jane@example.com', 'wrongpassword'),
    ).rejects.toThrow(UnauthorizedError);
  });

  it('should throw UnauthorizedError if user is banned (TC-USR-04)', async () => {
    // The service queries findByEmail(email, USER_STATUS.ACTIVE).
    // If user is banned, the repository (in real life) returns null for that query.
    mockUserRepo.findByEmail.mockResolvedValue(null);

    await expect(
      userService.verifyCredentials('banned@example.com', 'password'),
    ).rejects.toThrow(UnauthorizedError);
  });
});
