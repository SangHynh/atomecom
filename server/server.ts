import 'dotenv/config';
import app from './src/app.js';
import appConfig, { NODE_ENV } from './src/shared/configs/app.config.js';
import type { Server } from 'node:http';
import { MongoDatabase } from './src/modules/monitoring/infra/mongoose.db.js';
import type { IDatabase } from 'src/shared/interfaces/IDatabase.js';

const SHUTDOWN_TIMEOUT_MS = 10000;
const line = '='.repeat(50);

let db: IDatabase;
let server: Server | null = null;

// --- MAIN BOOTSTRAP ---
(async () => {
  try {
    // 1. Validation Config
    if (!appConfig) throw new Error('Configuration is missing!');

    console.log(`SERVER BOOTING...`);

    // 2. Init & Connect DB
    db = new MongoDatabase(appConfig.db.uri);
    await db.connect();

    console.log(`Initial Connections:::${db.getNumberOfConnections()}`);
    console.log(line);

    // 3. Start Server
    server = app.listen(appConfig.app.port, () => {
      logServerInfo(appConfig?.app.port, appConfig?.app?.host);
    });
  } catch (err) {
    console.error(`Failed to start server:::`, err);
    process.exit(1);
  }
})();

const logServerInfo = (port: number | undefined, host: string | undefined) => {
  console.log(`SERVER INFO`);
  console.log(`URL: http://${host}:${port}`);
  console.log(`Mode: ${NODE_ENV}`);
  console.log(line);
};

const shutdown = async () => {
  console.log('\nShutting down server...');
  const forceQuit = setTimeout(() => {
    console.error(
      'Could not close connections in time, forcefully shutting down',
    );
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS);
  try {
    if (db) await db.disconnect();
    if (server) {
      server.close(() => {
        console.log('Server has been closed');
        clearTimeout(forceQuit);
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection::', err);
  shutdown();
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception::', err);
  shutdown();
});
