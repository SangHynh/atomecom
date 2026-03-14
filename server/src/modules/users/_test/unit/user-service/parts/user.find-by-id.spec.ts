import { setupUserServiceTest, mockUser } from '../__fixtures__/user.fixtures.js';
import { NotFoundError } from '@shared/core/error.response.js';

describe('UserService - Parts 8 & 17: findById', () => {
  let { userService, mockUserRepo, mockCache } = setupUserServiceTest();

  beforeEach(() => {
    ({ userService, mockUserRepo, mockCache } = setupUserServiceTest());
  });

  describe('Part 8: findById & Session Decoration', () => {
    describe('Redis Session Parsing (Robustness)', () => {
      it('should parse valid JSON session data', async () => {
        const jsonSession = JSON.stringify({
          timestamp: '2026-02-20T10:00:00Z',
          ip: '1.2.3.4',
          userAgent: 'Mozilla',
        });
        mockUserRepo.findById.mockResolvedValue(mockUser);
        mockCache.get.mockResolvedValue(jsonSession);
        mockCache.has.mockResolvedValue(true);

        const result = await userService.findById(mockUser.id!);

        expect(result.lastLoginAt).toEqual(new Date('2026-02-20T10:00:00Z'));
        expect((result as any).lastIp).toBe('1.2.3.4');
        expect((result as any).isOnline).toBe(true);
      });

      it('should fallback to raw string date for legacy session data', async () => {
        const rawDate = '2026-01-01T12:00:00Z';
        mockUserRepo.findById.mockResolvedValue(mockUser);
        mockCache.get.mockResolvedValue(rawDate); // Not JSON

        const result = await userService.findById(mockUser.id!);

        expect(result.lastLoginAt).toEqual(new Date(rawDate));
        expect((result as any).lastIp).toBe('unknown'); // Fallback default
      });
    });
  });

  describe('Part 17: findById - Error', () => {
    it('should throw NotFoundError if user not found (TC-USR-34)', async () => {
      mockUserRepo.findById.mockResolvedValue(null);

      await expect(userService.findById('non-existent')).rejects.toThrow(
        NotFoundError,
      );
    });
  });
});
