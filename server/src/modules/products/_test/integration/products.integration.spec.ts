import type { Express } from 'express';
import express from 'express';
import request from 'supertest';
import { MongooseProductRepo } from '../../infra/repositories/mongoose-product.repo.js';
import { MongooseSkuRepo } from '../../infra/repositories/mongoose-sku.repo.js';
import { MongooseCategoryRepo } from '../../infra/repositories/mongoose-category.repo.js';
import { MongooseBrandRepo } from '../../infra/repositories/mongoose-brand.repo.js';
import { MongooseInventoryRepo } from '../../../inventory/infra/repositories/mongoose-inventory.repo.js';
import { ProductService } from '../../use-cases/services/product.service.js';
import { SkuService } from '../../use-cases/services/sku.service.js';
import { CategoryService } from '../../use-cases/services/category.service.js';
import { BrandService } from '../../use-cases/services/brand.service.js';
import { InventoryService } from '../../../inventory/use-cases/inventory.service.js';
import { ProductController } from '../../presentation/controllers/product.controller.js';
import { ProductModel } from '../../infra/models/mongoose-product.model.js';
import { SkuModel } from '../../infra/models/mongoose-sku.model.js';
import mongoose from 'mongoose';
import { errorHandler } from '@shared/middlewares/error.middleware.js';
import {
  connect,
  closeDatabase,
  clearDatabase,
} from '@shared/test/db-helper.js';
import type { ICacheRepo } from '@shared/interfaces/ICache.repo.js';

// Mock Cache Repo
class MockCacheRepo implements ICacheRepo {
  private _data = new Map<string, any>();
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
  async acquireLock(_key: string, _ttl: number): Promise<boolean> {
    return true;
  }
  async releaseLock(_key: string): Promise<void> {}
  async waitAndAcquire(
    _key: string,
    _ttl: number,
    _timeout?: number,
  ): Promise<boolean> {
    return true;
  }
}

function createTestApp(): Express {
  const cacheRepo = new MockCacheRepo();
  const productRepo = new MongooseProductRepo();
  const skuRepo = new MongooseSkuRepo();
  const categoryRepo = new MongooseCategoryRepo();
  const brandRepo = new MongooseBrandRepo();
  const inventoryRepo = new MongooseInventoryRepo();

  const skuService = new SkuService({ skuRepo });
  const categoryService = new CategoryService({
    categoryRepo,
    productRepo,
    cacheRepo,
  });
  const brandService = new BrandService({ brandRepo, productRepo });
  const inventoryService = new InventoryService({ inventoryRepo, cacheRepo });

  const productService = new ProductService({
    productRepo,
    skuService,
    inventoryService,
    categoryService,
    brandService,
  });

  const productController = new ProductController(productService);

  const app = express();
  app.use(express.json());

  app.post('/products', (req, res, next) =>
    productController.create(req, res, next),
  );
  app.get('/products/:id', (req, res, next) =>
    productController.findById(req, res, next),
  );
  app.delete('/products/:id', (req, res, next) =>
    productController.delete(req, res, next),
  );

  app.use(errorHandler);
  return app;
}

describe('Product Module Integration', () => {
  let app: Express;

  beforeAll(async () => {
    await connect();
    app = createTestApp();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  it('1. Should create a product with SKUs and Inventory (Happy Path)', async () => {
    // 1. Setup: Create Category and Brand (Directly via repos for speed)
    const categoryRepo = new MongooseCategoryRepo();
    const brandRepo = new MongooseBrandRepo();
    const catId = new mongoose.Types.ObjectId();
    const cat = await categoryRepo.create({
      _id: catId,
      name: 'Electronics',
      slug: 'electronics',
      path: `,${catId.toString()},`,
    } as any);
    const brand = await brandRepo.create({
      name: 'Apple',
      slug: 'apple',
      logo: 'apple-logo.png',
    } as any);

    const createDto = {
      name: 'iPhone 15',
      slug: 'iphone-15',
      description: 'The latest iPhone',
      shortDescription: 'iPhone 15',
      thumbnail: 'iphone15-thumb.png',
      categoryId: cat.id,
      brandId: brand.id,
      basePrice: 999,
      skus: [
        {
          skuCode: 'IP15-BLK-128',
          name: 'iPhone 15 Black 128GB',
          price: { basePrice: 999, salePrice: 999 },
          quantity: 50,
        },
        {
          skuCode: 'IP15-BLU-128',
          name: 'iPhone 15 Blue 128GB',
          price: { basePrice: 999, salePrice: 999 },
          quantity: 30,
        },
      ],
    };

    // 2. Execute: Create Product
    const res = await request(app).post('/products').send(createDto);

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe(createDto.name);

    const productId = res.body.data.id;

    // 3. Verify: Check SKUs were created
    const skuRepo = new MongooseSkuRepo();
    const skus = await skuRepo.findAllByProductId(productId);
    expect(skus.length).toBe(2);

    // 4. Verify: Check Inventory was created
    const inventoryRepo = new MongooseInventoryRepo();
    const sku1Id = skus[0]?.id;
    expect(sku1Id).toBeDefined();
    if (sku1Id) {
      const inv1 = await inventoryRepo.findBySkuId(sku1Id);
      expect(inv1?.quantity).toBe(50);
    }
  });

  it('2. Should rollback product if SKU creation fails (Compensating Transaction)', async () => {
    const categoryRepo = new MongooseCategoryRepo();
    const brandRepo = new MongooseBrandRepo();
    const catId = new mongoose.Types.ObjectId();
    const cat = await categoryRepo.create({
      _id: catId,
      name: 'Test',
      slug: 'test',
      path: `,${catId.toString()},`,
    } as any);
    const brand = await brandRepo.create({
      name: 'Test',
      slug: 'test',
      logo: 'test.png',
    } as any);

    // Setup: Existing SKU Code to trigger a conflict in Step 2
    const skuRepo = new MongooseSkuRepo();
    await skuRepo.create({
      skuCode: 'EXISTING-SKU',
      productId: '65d123456789012345678901',
      name: 'Existing SKU',
      price: { basePrice: 100 },
    } as any); // Use valid ObjectId string

    const createDto = {
      name: 'Failed Product',
      slug: 'failed-product',
      description: 'test',
      shortDescription: 'test',
      thumbnail: 'test.png',
      categoryId: cat.id,
      brandId: brand.id,
      skus: [
        { skuCode: 'EXISTING-SKU', price: { basePrice: 100, salePrice: 100 } },
      ],
    };

    const res = await request(app).post('/products').send(createDto);

    expect(res.status).toBe(409); // Conflict

    // Verify: No product was left behind
    const productRepo = new MongooseProductRepo();
    const product = await productRepo.findBySlug('failed-product');
    expect(product).toBeNull();
  });

  it('3. Should soft delete product and cascade to SKUs', async () => {
    // 1. Setup: Product -> SKU -> Inventory
    const categoryRepo = new MongooseCategoryRepo();
    const catId = new mongoose.Types.ObjectId();
    const cat = await categoryRepo.create({
      _id: catId,
      name: 'Cat',
      slug: 'cat-delete',
      path: `,${catId.toString()},`,
    } as any);

    const brandRepo = new MongooseBrandRepo();
    const brand = await brandRepo.create({
      name: 'Brand',
      slug: 'brand-delete',
      logo: 'brand.png',
    } as any);

    const productRepo = new MongooseProductRepo();
    const product = await productRepo.create({
      name: 'To Delete',
      slug: 'to-delete',
      categoryId: cat.id,
      brandId: brand.id,
      description: 'test description',
      shortDescription: 'test short',
      thumbnail: 'test.png',
      specs: [{ key: 'test', value: 'test' }],
      seo: { title: 'test', description: 'test', keywords: ['test'] },
    } as any);

    const skuRepo = new MongooseSkuRepo();
    const sku = await skuRepo.create({
      skuCode: 'DEL-SKU',
      productId: product.id,
      name: 'Delete SKU',
      price: { basePrice: 100 },
    } as any);

    // 2. Execute: Delete
    const res = await request(app).delete(`/products/${product.id}`);
    expect(res.status).toBe(200);

    // 3. Verify: Soft deleted
    // Bypassing repository/mongoose middleware since they filter out deleted=null
    const deletedProduct = await ProductModel.collection.findOne({
      _id: new mongoose.Types.ObjectId(product.id),
    });
    expect(deletedProduct?.deletedAt).toBeDefined();

    const deletedSku = await SkuModel.collection.findOne({
      _id: new mongoose.Types.ObjectId(sku.id),
    });
    expect(deletedSku?.deletedAt).toBeDefined();
  });
});
