import { setupUserServiceTest, mockUser } from '../__fixtures__/user.fixtures.js';
import type { UserEntity } from '@modules/users/domain/user.entity.js';

describe('UserService - Part 5: upsertOAuthUser', () => {
  let { userService, mockUserRepo } = setupUserServiceTest();

  beforeEach(() => {
    ({ userService, mockUserRepo } = setupUserServiceTest());
  });

  it('should generate dummy email and set isEmailMissing: true when profile has no email', async () => {
    mockUserRepo.findByOAuthId.mockResolvedValue(null);
    mockUserRepo.create.mockImplementation(
      async (data) =>
        ({
          id: 'new-id',
          ...data,
        }) as UserEntity,
    );

    const result = await userService.upsertOAuthUser({
      providerInfo: { provider: 'GOOGLE' as any, providerId: '123' },
      name: 'OAuth User',
      // no email
    });

    expect(result.email).toBeNull(); // Masked in SafeResponse
    expect(result.isEmailMissing).toBe(true);
    expect(mockUserRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'google_123@atomecom.dummy',
        isEmailMissing: true,
      }),
    );
  });

  it('should link provider to existing account if email matches', async () => {
    mockUserRepo.findByOAuthId.mockResolvedValue(null);
    mockUserRepo.findByEmail.mockResolvedValue({
      ...mockUser,
      providers: [],
    } as UserEntity);
    mockUserRepo.update.mockImplementation(
      async (id, data) =>
        ({
          ...mockUser,
          ...data,
        }) as UserEntity,
    );

    await userService.upsertOAuthUser({
      providerInfo: { provider: 'FACEBOOK' as any, providerId: '456' },
      name: 'Jane Doe',
      email: 'jane@example.com',
    });

    expect(mockUserRepo.update).toHaveBeenCalledWith(
      mockUser.id,
      expect.objectContaining({
        providers: [{ provider: 'FACEBOOK', providerId: '456' }],
      }),
    );
  });

  describe('upsertOAuthUser - Edge Cases', () => {
    it('should skip linking if provider is already in the list (TC-USR-31)', async () => {
      const existingUserWithGoogle = {
        ...mockUser,
        providers: [{ provider: 'GOOGLE', providerId: '123' }],
      } as UserEntity;

      mockUserRepo.findByOAuthId.mockResolvedValue(null);
      mockUserRepo.findByEmail.mockResolvedValue(existingUserWithGoogle);
      mockUserRepo.update.mockResolvedValue(existingUserWithGoogle);

      await userService.upsertOAuthUser({
        providerInfo: { provider: 'GOOGLE' as any, providerId: '123' },
        name: 'Jane Doe',
        email: 'jane@example.com',
      });

      // We check that the update call doesn't include the 'providers' field for linking.
      expect(mockUserRepo.update).toHaveBeenCalledWith(
        mockUser.id,
        expect.not.objectContaining({
          providers: expect.any(Array),
        }),
      );
    });

    it('should update name and avatar when user exists by providerId (TC-USR-32)', async () => {
      mockUserRepo.findByOAuthId.mockResolvedValue(mockUser);
      mockUserRepo.update.mockResolvedValue({
        ...mockUser,
        avatar: 'new.jpg',
      } as UserEntity);

      await userService.upsertOAuthUser({
        providerInfo: { provider: 'GOOGLE' as any, providerId: '123' },
        name: 'Jane New Name',
        avatar: 'new.jpg',
      });

      expect(mockUserRepo.update).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          name: 'Jane New Name',
          avatar: 'new.jpg',
        }),
      );
    });
  });
});
