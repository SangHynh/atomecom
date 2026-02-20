import type { EventBus } from '@shared/infra/event-bus.js';
import { DomainEvents } from '@shared/constants/event.constants.js';
import type { ICacheRepo } from '@shared/interfaces/ICache.repo.js';

interface UserActivityListenerDependencies {
  eventBus: EventBus;
  cache: ICacheRepo;
}

export class UserActivityListener {
  private readonly _eventBus: EventBus;
  private readonly _cache: ICacheRepo;

  constructor({ eventBus, cache }: UserActivityListenerDependencies) {
    this._eventBus = eventBus;
    this._cache = cache;

    this._setupListeners();
  }

  private _setupListeners(): void {
    // 1. Record real-time activity (Heartbeat)
    this._eventBus.on(
      DomainEvents.USER_ACTIVITY,
      ({ userId, ip, userAgent }) => {
        this._handleActivity(userId, ip, userAgent);
      },
    );

    // 2. Persist last login time to DB
    this._eventBus.on(DomainEvents.USER_LOGGED_IN, ({ userId }) => {
      this._handleLastLogin(userId);
    });
  }

  /**
   * Updates user heartbeat and last login data in Redis.
   */
  private async _handleActivity(
    userId: string,
    ip?: string,
    userAgent?: string,
  ): Promise<void> {
    try {
      const timestamp = new Date().toISOString();
      const sessionData = {
        timestamp,
        ip: ip || 'unknown',
        userAgent: userAgent || 'unknown',
      };

      // 1. Short-term heartbeat (5 mins) for "Online" status
      await this._cache.set(`heartbeat:user:${userId}`, timestamp, 300);

      // 2. Longer-term session info (30 days)
      const key = `user:last_login:${userId}`;
      await this._cache.set(key, sessionData, 3600 * 24 * 30);
    } catch (error) {
      console.error(
        '[UserActivityListener] Failed to record heartbeat:',
        error,
      );
    }
  }

  /**
   * Stores the last login date in Redis (Persistent-ish cache).
   */
  private async _handleLastLogin(userId: string): Promise<void> {
    try {
      const key = `user:last_login:${userId}`;
      const now = new Date().toISOString();
      const sessionData = {
        timestamp: now,
        ip: 'unknown',
        userAgent: 'unknown',
      };
      await this._cache.set(key, sessionData, 3600 * 24 * 30);
    } catch (error) {
      console.error(
        '[UserActivityListener] Failed to update last login in cache:',
        error,
      );
    }
  }
}
