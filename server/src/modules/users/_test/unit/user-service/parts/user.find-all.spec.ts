import { setupUserServiceTest, mockUser } from '../__fixtures__/user.fixtures.js';
import { USER_STATUS } from '@atomecom/shared';

describe('UserService - Part 15: findAll', () => {
  let { userService, mockUserRepo, mockCache } = setupUserServiceTest();

  beforeEach(() => {
    ({ userService, mockUserRepo, mockCache } = setupUserServiceTest());
  });

  it('should handle pagination and filtering (TC-USR-29)', async () => {
    const queryDto = {
      page: 2,
      limit: 10,
      status: USER_STATUS.ACTIVE,
      keyword: 'john',
    };
    mockUserRepo.findAll.mockResolvedValue({
      data: [mockUser],
      totalElements: 25,
    });
    mockCache.get.mockResolvedValue(null);

    const result = await userService.findAll(queryDto);

    expect(mockUserRepo.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        offset: 10,
        limit: 10,
        status: USER_STATUS.ACTIVE,
      }),
    );
    expect(result.pagination.totalPages).toBe(3);
    expect(result.pagination.currentPage).toBe(2);
  });
});
