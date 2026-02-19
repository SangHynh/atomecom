import type { ICacheRepo } from '@shared/interfaces/ICache.repo.js';

export interface IPStatus {
  ip: string;
  violationCount: number;
  lastViolationAt: number;
  isBanned: boolean;
  bannedUntil?: number;
}

export class BlacklistService {
  private readonly _prefix = 'blacklist:ip:';

  constructor(private readonly _cache: ICacheRepo) {}

  private _getKey(ip: string): string {
    return `${this._prefix}${ip}`;
  }

  /**
   * Records a honeypot trigger and applies escalation logic.
   */
  public async recordViolation(ip: string): Promise<void> {
    const key = this._getKey(ip);
    let status = await this._cache.get<IPStatus>(key);

    if (!status) {
      status = {
        ip,
        violationCount: 1,
        lastViolationAt: Date.now(),
        isBanned: false,
      };
    } else {
      status.violationCount += 1;
      status.lastViolationAt = Date.now();
    }

    // Escalation Logic
    let ttl = 7 * 24 * 60 * 60; // Default 7 days

    if (status.violationCount >= 3) {
      // Level 3: Ban for 24 hours
      status.isBanned = true;
      status.bannedUntil = Date.now() + 24 * 60 * 60 * 1000;
      ttl = 24 * 60 * 60;
    }

    await this._cache.set(key, status, ttl);
  }

  /**
   * Checks if an IP is allowed and returns the rate limit if throttled.
   */
  public async checkStatus(ip: string): Promise<{
    isBanned: boolean;
    limit?: number; // requests per minute
  }> {
    const key = this._getKey(ip);
    const status = await this._cache.get<IPStatus>(key);

    if (!status) return { isBanned: false };

    if (
      status.isBanned &&
      status.bannedUntil &&
      status.bannedUntil > Date.now()
    ) {
      return { isBanned: true };
    }

    // If ban expired
    if (
      status.isBanned &&
      status.bannedUntil &&
      status.bannedUntil <= Date.now()
    ) {
      await this._cache.del(key);
      return { isBanned: false };
    }

    if (status.violationCount === 1) {
      return { isBanned: false, limit: 5 };
    }

    if (status.violationCount === 2) {
      return { isBanned: false, limit: 1 };
    }

    return { isBanned: false };
  }

  /**
   * Performs a per-minute rate limit check for throttled IPs.
   */
  public async isRateLimited(ip: string, limit: number): Promise<boolean> {
    const key = `throttle:ip:${ip}`;
    const current = await this._cache.get<number>(key);

    if (current && current >= limit) {
      return true;
    }

    const newCount = (current || 0) + 1;
    // Set/Update counter with 1 minute expiration
    await this._cache.set(key, newCount, 60);
    return false;
  }
}
