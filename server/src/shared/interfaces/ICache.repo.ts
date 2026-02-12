export interface ICacheRepo {
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  get<T>(key: string): Promise<T | null>;
  del(key: string): Promise<void>;
  deleteByPattern(pattern: string): Promise<void>;
  has(key: string): Promise<boolean>;
  flushAll?(): Promise<void>;
}
