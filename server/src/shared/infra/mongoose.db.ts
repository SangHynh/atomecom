import mongoose from 'mongoose';
import { InternalServerError } from '@core/error.response.js';
import type { IDatabase } from '@shared/interfaces/IDatabase.js';

const MAX_POOL_SIZE = 100;
const MIN_POOL_SIZE = 5;
const SOCKET_TIMEOUT_MS = 45000;
const SERVER_SELECTION_TIMEOUT_MS = 5000;

export class MongoDatabase implements IDatabase {
  private readonly _uri: string;
  public readonly name = 'MongoDB';
  constructor(uri: string) {
    if (!uri) {
      throw new Error('Database URI is required');
    }
    this._uri = uri;
  }

  public async connect(): Promise<void> {
    try {
      console.log(`Connecting to MongoDB...`);
      await mongoose.connect(this._uri, {
        maxPoolSize: MAX_POOL_SIZE,
        minPoolSize: MIN_POOL_SIZE,
        socketTimeoutMS: SOCKET_TIMEOUT_MS,
        serverSelectionTimeoutMS: SERVER_SELECTION_TIMEOUT_MS,
      });
      console.log(`MongoDB Connected`);
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      throw new InternalServerError(
        `MongoDB Connection Failed: ${errorMessage}`,
      );
    }
  }

  public async disconnect(): Promise<void> {
    await mongoose.disconnect();
    console.log(`MongoDB Disconnected`);
  }

  public getNumberOfConnections(): number {
    return mongoose.connections.filter((conn) => conn.readyState === 1).length;
  }
}
