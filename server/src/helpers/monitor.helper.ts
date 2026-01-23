import os from 'os';
import process from 'process';
import type { IDatabase } from '../core/interfaces/IDatabase.js';
import appConfig from '../configs/app.config.js';

// Check overload
export const checkOverload = (dbMonitor: IDatabase) => {
  const numConnection = dbMonitor.getNumberOfConnections();
  const numCores = os.cpus().length;
  const memoryUsage = process.memoryUsage().rss;
  const maxConnections = numCores * appConfig!.monitor.maxConnectionsPerCore;
  console.log(`Active connections::${numConnection}`);
  console.log(`Memory usage::${memoryUsage / 1024 / 1024} MB`);
  if (numConnection > maxConnections) {
    console.warn('Overload detected!');
  }
};

export default {checkOverload};