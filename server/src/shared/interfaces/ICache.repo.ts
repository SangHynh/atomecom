export interface ICacheRepo {
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  get<T>(key: string): Promise<T | null>;
  del(key: string): Promise<void>;
  deleteByPattern(pattern: string): Promise<void>;
  countByPattern(pattern: string): Promise<number>;
  has(key: string): Promise<boolean>;
  flushAll?(): Promise<void>;

  // Locking mechanism (Clean Architecture compliant)
  acquireLock(key: string, ttlMs: number): Promise<boolean>;
  releaseLock(key: string): Promise<void>;
  waitAndAcquire(
    key: string,
    ttlMs: number,
    timeoutMs?: number,
  ): Promise<boolean>;
}
