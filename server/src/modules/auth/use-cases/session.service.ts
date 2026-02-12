import type { AuthSession } from '@modules/auth/domain/authSession.model.js';
import { UnauthorizedError } from '@shared/core/error.response.js';
import type { ICacheRepo } from '@shared/interfaces/ICache.repo.js';

export class SessionService {
  constructor(private readonly _cache: ICacheRepo) {}

  /**
   * Generates a structured Redis key for user sessions.
   * Pattern: auth:user:{userId}:session:{sessionId}
   */
  private _generateKey(userId: string, sessionId: string): string {
    return `auth:user:${userId}:session:${sessionId}`;
  }

  /**
   * Persists the session object to the cache with a specific TTL.
   */
  public async saveRefreshTokenToCache(
    session: AuthSession,
    ttl: number,
  ): Promise<void> {
    const key = this._generateKey(session.userId, session.sessionId);
    await this._cache.set(key, session, ttl);
  }

  /**
   * Handles the logic for Refresh Token Rotation and Security Validation.
   */
  public async handleRefreshToken(
    userId: string,
    sessionId: string,
    receivedToken: string,
    newToken: string,
    expiresAt: number,
  ): Promise<void> {
    const key = this._generateKey(userId, sessionId);
    const session = await this._cache.get<AuthSession>(key);

    // 1. Verify if the session exists (it might be expired or manually revoked)
    if (!session) {
      throw new UnauthorizedError('SESSION_INVALID');
    }

    // 2. REUSE DETECTION: If the token has been used before, it indicates a breach.
    // ACTION: Revoke ALL active sessions for this user to ensure absolute security.
    if (session.refreshTokensUsed.includes(receivedToken)) {
      await this.revokeAllUserSessions(userId);
      throw new UnauthorizedError('TOKEN_REUSED_DETECTION');
    }

    // 3. INTEGRITY CHECK: The provided token must match the latest one stored in cache.
    if (session.refreshToken !== receivedToken) {
      throw new UnauthorizedError('INVALID_REFRESH_TOKEN');
    }

    // 4. TOKEN ROTATION: Update session state with the new token pair.
    session.refreshTokensUsed.push(receivedToken);

    // Keep the used tokens history lean to optimize cache storage (limit to last 5).
    if (session.refreshTokensUsed.length > 5) {
      session.refreshTokensUsed.shift();
    }
    session.refreshToken = newToken;

    // 5. SYNCHRONIZATION: Save the updated session back to cache with the remaining TTL.
    const remainingTTL = Math.max(
      1,
      Math.floor((expiresAt - Date.now()) / 1000),
    );
    await this.saveRefreshTokenToCache(session, remainingTTL);
  }

  /**
   * Revokes a specific session (e.g., during a standard Logout).
   */
  public async revokeRefreshToken(
    userId: string,
    sessionId: string,
  ): Promise<void> {
    const key = this._generateKey(userId, sessionId);
    await this._cache.del(key);
  }

  /**
   * Revokes every active session belonging to a user.
   * Leverages SCAN pattern to perform a non-blocking mass deletion in cache(Redis).
   */
  public async revokeAllUserSessions(userId: string): Promise<void> {
    const pattern = `auth:user:${userId}:session:*`;

    // Safety check: Ensure the repo supports pattern deletion before execution.
    if (this._cache.deleteByPattern) {
      await this._cache.deleteByPattern(pattern);
    }
  }
}
