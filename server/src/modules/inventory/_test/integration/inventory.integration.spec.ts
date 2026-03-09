import type { Express } from 'express';
import express from 'express';
import request from 'supertest';
import { MongooseInventoryRepo } from '../../infra/repositories/mongoose-inventory.repo.js';
import { InventoryService } from '../../use-cases/inventory.service.js';
import { InventoryController } from '../../presentation/inventory.controller.js';
import { errorHandler } from '@shared/middlewares/error.middleware.js';
import {
  connect,
  closeDatabase,
  clearDatabase,
} from '@shared/test/db-helper.js';
import type { ICacheRepo } from '@shared/interfaces/ICache.repo.js';
import mongoose from 'mongoose';
import { InventoryModel } from '../../infra/models/mongoose-inventory.model.js';

// Mock Cache Repo with basic locking logic for integration testing
class MockCacheRepo implements ICacheRepo {
  private _data = new Map<string, any>();
  private _locks = new Set<string>();

  async get<T>(key: string): Promise<T | null> {
    return this._data.get(key) || null;
  }
  async set(key: string, value: any, ttl?: number): Promise<void> {
    this._data.set(key, value);
  }
  async del(key: string): Promise<void> {
    this._data.delete(key);
  }
  async has(key: string): Promise<boolean> {
    return this._data.has(key);
  }
  async countByPattern(_: string): Promise<number> {
    return 0;
  }
  async deleteByPattern(_: string): Promise<void> {}

  async acquireLock(key: string, _ttl: number): Promise<boolean> {
    if (this._locks.has(key)) return false;
    this._locks.add(key);
    return true;
  }
  async releaseLock(key: string): Promise<void> {
    this._locks.delete(key);
  }
  async waitAndAcquire(
    key: string,
    ttl: number,
    timeout: number = 3000,
  ): Promise<boolean> {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      if (await this.acquireLock(key, ttl)) return true;
      await new Promise((r) => setTimeout(r, 10));
    }
    return false;
  }
}

function createTestApp(): Express {
  const cacheRepo = new MockCacheRepo();
  const inventoryRepo = new MongooseInventoryRepo();
  const inventoryService = new InventoryService({ inventoryRepo, cacheRepo });
  const inventoryController = new InventoryController(inventoryService);

  const app = express();
  app.use(express.json());

  app.post('/inventory/reserve', (req, res, next) =>
    inventoryController.reserve(req, res, next),
  );
  app.post('/inventory/add', (req, res, next) =>
    inventoryController.addStock(req, res, next),
  );
  app.get('/inventory/:skuId', (req, res, next) =>
    inventoryController.findBySkuId(req, res, next),
  );

  app.use(errorHandler);
  return app;
}

describe('Inventory Module Integration', () => {
  let app: Express;
  const skuId = '65d123456789012345678902'; // Valid ObjectId

  beforeAll(async () => {
    await connect();
    app = createTestApp();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  beforeEach(async () => {
    await clearDatabase();
    // Pre-create inventory directly via model to ensure correct ObjectId type
    await InventoryModel.create({
      skuId: new mongoose.Types.ObjectId(skuId),
      quantity: 10,
      reserved: 0,
      available: 10,
      lowStockThreshold: 5,
      version: 1,
    } as any);
  });

  it('1. Should reserve stock successfully', async () => {
    const res = await request(app)
      .post('/inventory/reserve')
      .send({ skuId, quantity: 3 });

    if (res.status !== 200) {
      console.log('Reserve Error Body:', JSON.stringify(res.body, null, 2));
    }
    expect(res.status).toBe(200);

    const detail = await request(app).get(`/inventory/${skuId}`);
    console.log('Detail Body:', JSON.stringify(detail.body, null, 2));
    expect(detail.body.data.available).toBe(7);
    expect(detail.body.data.reserved).toBe(3);
  });

  it('2. Should return 400 if stock is insufficient', async () => {
    const res = await request(app)
      .post('/inventory/reserve')
      .send({ skuId, quantity: 11 });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Insufficient stock');
  });

  it('3. Should handle concurrent reservations correctly', async () => {
    // Send two concurrent requests
    const [res1, res2] = await Promise.all([
      request(app).post('/inventory/reserve').send({ skuId, quantity: 6 }),
      request(app).post('/inventory/reserve').send({ skuId, quantity: 5 }),
    ]);

    // One should succeed, one should fail (Total is 10)
    const statuses = [res1.status, res2.status];
    expect(statuses).toContain(200);
    expect(statuses).toContain(400);

    const detail = await request(app).get(`/inventory/${skuId}`);
    // Either 4 or 5 left depending on which won
    expect(detail.body.data.available).toBeLessThanOrEqual(5);
  });
});
