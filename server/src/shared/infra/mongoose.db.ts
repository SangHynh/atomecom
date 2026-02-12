import mongoose from 'mongoose';
import { InternalServerError } from '@core/error.response.js';
import type { IDatabase } from '@shared/interfaces/IDatabase.provider.js';

const MAX_POOL_SIZE = 100;
const MIN_POOL_SIZE = 5;
const SOCKET_TIMEOUT_MS = 45000;
const SERVER_SELECTION_TIMEOUT_MS = 5000;

export class MongoDatabase implements IDatabase {
  private readonly _uri: string;
  public readonly name = 'MongoDB';
  constructor(uri: string) {
    if (!uri) {
      throw new InternalServerError('DATABASE_URI_REQUIRED');
    }
    this._uri = uri;
  }

  public async connect(): Promise<void> {
    try {
      console.log(`[${this.name}] Connecting to ${this._uri}...`);
      await mongoose.connect(this._uri, {
        maxPoolSize: MAX_POOL_SIZE,
        minPoolSize: MIN_POOL_SIZE,
        socketTimeoutMS: SOCKET_TIMEOUT_MS,
        serverSelectionTimeoutMS: SERVER_SELECTION_TIMEOUT_MS,
      });
      console.log(`[${this.name}] Connected successfully.`);
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      throw new InternalServerError(
        `MongoDB Connection Failed: ${errorMessage}`,
      );
    }
  }

  public async disconnect(): Promise<void> {
    await mongoose.disconnect();
    console.log(`[${this.name}] Disconnected`);
  }

  public getNumberOfConnections(): number {
    return mongoose.connections.filter((conn) => conn.readyState === 1).length;
  }

  public async getInfo(): Promise<Record<string, any> | null> {
    try {
      if (mongoose.connection.readyState !== 1) return null;

      const db = mongoose.connection.db;
      if (!db) return null;

      const serverStatus = await db.admin().serverStatus();

      return {
        version: serverStatus.version,
        uptime: `${serverStatus.uptime}s`,
        connections: serverStatus.connections,
        pid: serverStatus.pid,
      };
    } catch (error) {
      console.error('Failed to get MongoDB info:', error);
      return null;
    }
  }
}
