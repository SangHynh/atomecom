import 'dotenv/config';
import app from './src/app.js';
import appConfig, { NODE_ENV } from './src/shared/configs/app.config.js';
import type { Server } from 'node:http';
import type { IDatabase } from 'src/shared/interfaces/IDatabase.js';
import logger from '@shared/utils/logger.js';
import { MongoDatabase } from '@shared/infra/mongoose.db.js';
import { InternalServerError } from '@shared/core/error.response.js';
import type { ICache } from '@shared/interfaces/ICache.js';
import { RedisCache } from '@shared/infra/ioredis.cache.js';
import { cache, db } from '@shared/container.js';

const SHUTDOWN_TIMEOUT_MS = 10000;
const line = '='.repeat(50);

let server: Server | null = null;

// Main bootstrap
(async () => {
  try {
    if (!appConfig) throw new InternalServerError('Configuration is missing!');

    logger.info(`SERVER BOOTING...`);

    // Initialize database
    await db.connect();
    await cache.connect();

    logger.info(`Initial Connections:::${db.getNumberOfConnections()}`);
    logger.info(line);

    server = app.listen(appConfig.app.port, () => {
      logServerInfo(appConfig?.app.port, appConfig?.app?.host);
    });
  } catch (err) {
    logger.error(`Failed to start server:::`, err);
    process.exit(1);
  }
})();

const logServerInfo = (port: number | undefined, host: string | undefined) => {
  logger.info(`SERVER INFO`);
  logger.info(`URL: http://${host}:${port}`);
  logger.info(`Mode: ${NODE_ENV}`);
  logger.info(line);
};

const shutdown = async () => {
  logger.warn('Shutting down server...');
  const forceQuit = setTimeout(() => {
    logger.error('Forcefully shutting down due to timeout');
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS);

  try {
    if (db) await db.disconnect();
    if (server) {
      server.close(() => {
        logger.info('Server closed successfully');
        clearTimeout(forceQuit);
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  } catch (err) {
    logger.error('Error during shutdown:', err);
    process.exit(1);
  }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection::', err);
  shutdown();
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception::', err);
  shutdown();
});
