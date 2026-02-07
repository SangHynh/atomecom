import os from 'os';
import process from 'process';
import type { IDatabase } from '@shared/interfaces/IDatabase.js';
import type { ICache } from '@shared/interfaces/ICache.js';


class HealthService {
  constructor(private readonly db: IDatabase, private readonly cache: ICache) {}
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
        type: this.db.name,
        activeConnections: this.db.getNumberOfConnections(),
        info: await this.db.getInfo(),
      },
      cache: {
        type: this.cache.name,
        info: await this.cache.getInfo(),
      },
    };
  }
}

export default HealthService;
