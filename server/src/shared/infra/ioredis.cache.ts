import { InternalServerError } from '@shared/core/error.response.js';
import type { ICache } from '@shared/interfaces/ICache.provider.js';
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
    if (!this._client) throw new InternalServerError('REDIS_NOT_CONNECTED');

    const data = JSON.stringify(value);

    if (ttlSeconds) {
      await this._client.setex(key, ttlSeconds, data);
    } else {
      await this._client.set(key, data);
    }
  }

  public async get<T>(key: string): Promise<T | null> {
    if (!this._client) throw new InternalServerError('REDIS_NOT_CONNECTED');

    const data = await this._client.get(key);
    if (!data) return null;

    try {
      return JSON.parse(data) as T;
    } catch {
      return data as unknown as T;
    }
  }

  public async del(key: string): Promise<void> {
    if (!this._client) throw new InternalServerError('REDIS_NOT_CONNECTED');
    await this._client.del(key);
  }

  public async has(key: string): Promise<boolean> {
    if (!this._client) throw new InternalServerError('REDIS_NOT_CONNECTED');
    const result = await this._client.exists(key);
    return result === 1;
  }

  public async flushAll(): Promise<void> {
    if (!this._client) throw new InternalServerError('REDIS_NOT_CONNECTED');
    await this._client.flushall();
  }

  public async deleteByPattern(pattern: string): Promise<void> {
    const client = this._client;
    if (!client) {
      throw new InternalServerError('REDIS_NOT_CONNECTED');
    }

    const stream = client.scanStream({
      match: pattern,
      count: 100,
    });

    stream.on('data', async (keys: string[]) => {
      if (keys.length > 0) {
        const pipeline = client.pipeline();
        keys.forEach((key) => pipeline.del(key));
        await pipeline.exec();
      }
    });

    return new Promise((resolve, reject) => {
      stream.on('end', resolve);
      stream.on('error', reject);
    });
  }
}
