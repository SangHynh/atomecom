import { setupUserServiceTest, mockUser } from '../__fixtures__/user.fixtures.js';

describe('UserService - Parts 18 & 19: Find by Identity', () => {
  let { userService, mockUserRepo } = setupUserServiceTest();

  beforeEach(() => {
    ({ userService, mockUserRepo } = setupUserServiceTest());
  });

  describe('Part 18: findByEmail', () => {
    it('should return SafeDTO if user found (TC-USR-35)', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(mockUser);
      const result = await userService.findByEmail('jane@example.com');
      expect(result).toMatchObject({ email: 'jane@example.com' });
      expect(result).not.toHaveProperty('password');
    });

    it('should return null if user not found (TC-USR-36)', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(null);
      const result = await userService.findByEmail('missing@example.com');
      expect(result).toBeNull();
    });
  });

  describe('Part 19: findByPhone', () => {
    it('should return SafeDTO if user found (TC-USR-37)', async () => {
      mockUserRepo.findByPhone.mockResolvedValue(mockUser);
      const result = await userService.findByPhone('09123456789');
      expect(result).toMatchObject({ phone: '09123456789' });
    });

    it('should return null if user not found (TC-USR-38)', async () => {
      mockUserRepo.findByPhone.mockResolvedValue(null);
      const result = await userService.findByPhone('0000000000');
      expect(result).toBeNull();
    });
  });
});
