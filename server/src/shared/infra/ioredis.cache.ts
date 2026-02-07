import { InternalServerError } from '@shared/core/error.response.js';
import type { ICache } from '@shared/interfaces/ICache.js';
import type { ICacheRepo } from '@shared/interfaces/ICache.repo.js';
import { Redis } from 'ioredis';

export class RedisCache implements ICache, ICacheRepo {
  public readonly name: string;
  private readonly _uri: string;
  private _client: Redis | null = null;

  constructor(uri: string) {
    if (!uri) throw new InternalServerError('REDIS_URI_REQUIRED');
    this._uri = uri;
    this.name = 'Redis';
  }

  public async connect(): Promise<void> {
    try {
      console.log(`[${this.name}] Connecting to ${this._uri}...`);
      this._client = new Redis(this._uri, {
        connectTimeout: 10000,
        retryStrategy: (times) => Math.min(times * 50, 2000),
      });

      await this._client.ping();

      this._client.on('error', (err) =>
        console.error(`[${this.name}] Error:`, err),
      );
      console.log(`[${this.name}] Connected successfully.`);
    } catch (error: any) {
      throw new InternalServerError(
        `REDIS_CONNECTION_FAILED: ${error.message}`,
      );
    }
  }

  public async disconnect(): Promise<void> {
    if (this._client) {
      await this._client.quit();
      this._client = null;
      console.log(`[${this.name}] Disconnected.`);
    }
  }

  public async getInfo(): Promise<Record<string, any> | null> {
    if (!this._client) return null;

    const rawInfo = await this._client.info();
    const stats: Record<string, string> = {};

    rawInfo.split('\r\n').forEach((line) => {
      const [key, value] = line.split(':');
      if (key && value) {
        stats[key] = value;
      }
    });

    return {
      version: stats['redis_version'],
      memoryUsed: stats['used_memory_human'],
      clients: stats['connected_clients'],
      uptime: stats['uptime_in_seconds'] + 's',
    };
  }

  public async set<T>(
    key: string,
    value: T,
    ttlSeconds?: number,
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }

  public async get<T>(key: string): Promise<T | null> {
    throw new Error('Method not implemented.');
  }

  public async del(key: string): Promise<void> {
    throw new Error('Method not implemented.');
  }

  public async has(key: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  public async flushAll(): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
