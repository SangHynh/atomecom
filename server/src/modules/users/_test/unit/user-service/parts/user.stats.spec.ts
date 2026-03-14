import { setupUserServiceTest } from '../__fixtures__/user.fixtures.js';

describe('UserService - Part 9: getStats', () => {
  let { userService, mockUserRepo, mockCache } = setupUserServiceTest();

  beforeEach(() => {
    ({ userService, mockUserRepo, mockCache } = setupUserServiceTest());
  });

  it('should return aggregated counts including Redis online count', async () => {
    mockUserRepo.count.mockResolvedValue(10);
    mockCache.countByPattern.mockResolvedValue(5);

    const stats = await userService.getStats();

    expect(stats).toEqual({
      total: 10,
      active: 5,
      banned: 10,
      deactive: 10,
      verified: 10,
    });
    expect(mockCache.countByPattern).toHaveBeenCalledWith('heartbeat:user:*');
  });
});
