import os from 'os';
import process from 'process';
import type { IDatabase } from '@shared/interfaces/IDatabase.provider.js';
import type { ICache } from '@shared/interfaces/ICache.provider.js';

class HealthService {
  constructor(
    private readonly _db: IDatabase,
    private readonly _cache: ICache,
  ) {}
  public async getStatus() {
    return {
      node: {
        version: process.version,
        uptime: `${Math.floor(process.uptime())}s`,
        memoryUsage: {
          heapUsed: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
          rss: `${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB`,
        },
      },
      system: {
        platform: process.platform,
        cpuCores: os.cpus().length,
        freeMemory: `${(os.freemem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
        loadAverage: os.loadavg(),
      },
      database: {
        type: this._db.name,
        activeConnections: this._db.getNumberOfConnections(),
        info: await this._db.getInfo(),
      },
      cache: {
        type: this._cache.name,
        info: await this._cache.getInfo(),
      },
    };
  }
}

export default HealthService;
