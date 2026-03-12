import { UserActivityListener } from '@modules/users/use-cases/user-activity.listener.js';
import { DomainEvents } from '@shared/constants/event.constants.js';

describe('UserActivityListener', () => {
  let userActivityListener: UserActivityListener;
  let mockEventBus: any;
  let mockCache: any;

  beforeEach(() => {
    mockEventBus = {
      on: jest.fn(),
    };
    mockCache = {
      set: jest.fn().mockResolvedValue(true),
    };

    userActivityListener = new UserActivityListener({
      eventBus: mockEventBus,
      cache: mockCache,
    });
  });

  describe('Initialization', () => {
    it('should setup listeners on initialization (TC-UAL-01)', () => {
      expect(mockEventBus.on).toHaveBeenCalledWith(
        DomainEvents.USER_ACTIVITY,
        expect.any(Function),
      );
      expect(mockEventBus.on).toHaveBeenCalledWith(
        DomainEvents.USER_LOGGED_IN,
        expect.any(Function),
      );
    });
  });

  describe('Event Handlers', () => {
    it('should handle USER_ACTIVITY event (TC-UAL-02)', async () => {
      const handler = mockEventBus.on.mock.calls.find(
        (call: any) => call[0] === DomainEvents.USER_ACTIVITY,
      )[1];

      const payload = { userId: 'u1', ip: '1.2.3.4', userAgent: 'Mozilla' };
      await handler(payload);

      // Heartbeat 5 mins
      expect(mockCache.set).toHaveBeenCalledWith(
        'heartbeat:user:u1',
        expect.any(String),
        300,
      );

      // Last login 30 days
      expect(mockCache.set).toHaveBeenCalledWith(
        'user:last_login:u1',
        expect.objectContaining({
          ip: '1.2.3.4',
          userAgent: 'Mozilla',
        }),
        3600 * 24 * 30,
      );
    });

    it('should handle USER_LOGGED_IN event (TC-UAL-03)', async () => {
      const handler = mockEventBus.on.mock.calls.find(
        (call: any) => call[0] === DomainEvents.USER_LOGGED_IN,
      )[1];

      const payload = { userId: 'u1' };
      await handler(payload);

      expect(mockCache.set).toHaveBeenCalledWith(
        'user:last_login:u1',
        expect.objectContaining({
          timestamp: expect.any(String),
        }),
        3600 * 24 * 30,
      );
    });
  });

  describe('Resilience', () => {
    it('should NOT throw error if cache.set fails during activity handling (TC-UAL-04)', async () => {
      mockCache.set.mockRejectedValue(new Error('Redis Error'));
      const handler = mockEventBus.on.mock.calls.find(
        (call: any) => call[0] === DomainEvents.USER_ACTIVITY,
      )[1];

      await expect(
        handler({ userId: 'u1', ip: '1.2.3.4', userAgent: 'Mozilla' }),
      ).resolves.not.toThrow();
    });

    it('should NOT throw error if cache.set fails during login handling (TC-UAL-05)', async () => {
      mockCache.set.mockRejectedValue(new Error('Redis Error'));
      const handler = mockEventBus.on.mock.calls.find(
        (call: any) => call[0] === DomainEvents.USER_LOGGED_IN,
      )[1];

      await expect(handler({ userId: 'u1' })).resolves.not.toThrow();
    });
  });
});
