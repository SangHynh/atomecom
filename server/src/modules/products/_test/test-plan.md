# Test Plan: Products Module

## Thông tin
- **Module source**:
  - `server/src/modules/products/use-cases/services/brand.service.ts`
  - `server/src/modules/products/use-cases/services/category.service.ts`
  - `server/src/modules/products/use-cases/services/product.service.ts`
  - `server/src/modules/products/use-cases/services/sku.service.ts`
- **File test**:
  - `server/src/modules/products/_test/unit/brand.service.spec.ts`
  - `server/src/modules/products/_test/unit/category.service.spec.ts`
  - `server/src/modules/products/_test/unit/product.service.spec.ts`
  - `server/src/modules/products/_test/unit/sku.service.spec.ts`

---

## PHẦN 1: BrandService

### Dependencies cần mock:
- `IBrandRepository` (brandRepo)
- `IProductRepository` (productRepo)

### Bảng tổng quát — BrandService

| ID | Method | Kịch bản | Loại | Trạng thái |
|---|---|---|---|---|
| TC-BRD-01 | `create` | Tạo thành công → status PUBLISHED | Happy Path | ✅ DONE |
| TC-BRD-02 | `create` | Slug bị trùng → ConflictError | Edge Case | ✅ DONE |
| TC-BRD-03 | `delete` | Xóa thành công → soft delete (đổi slug) | Happy Path | ✅ DONE |
| TC-BRD-04 | `delete` | Brand đang được sử dụng → ConflictError | Business Rule | ✅ DONE |
| TC-BRD-05 | `delete` | Brand không tồn tại → NotFoundError | Error Case | ✅ DONE |
| TC-BRD-06 | `findById` | Tìm thấy → trả BrandEntity | Happy Path | ✅ DONE |
| TC-BRD-07 | `findBySlug` | Tìm thấy → trả BrandEntity | Happy Path | ✅ DONE |
| TC-BRD-08 | `findAll` | Phân trang limit, offset tính toán chuẩn | Happy Path | ✅ DONE |
| TC-BRD-09 | `update` | Update thông thường thành công | Happy Path | ✅ DONE |
| TC-BRD-10 | `update` | Cập nhật slug mới bị trùng → ConflictError | Edge Case | ✅ DONE |
| TC-BRD-11 | `update` | Brand không tồn tại → NotFoundError | Error Case | ✅ DONE |

> **Tiến độ BrandService: 11/11 (100%)** ✅

---

### Chi tiết từng Test Case — BrandService

### `create(dto)`

#### TC-BRD-01: Tạo thành công → chuẩn hóa dữ liệu, status PUBLISHED [✅ DONE]
- **Loại**: Happy Path
- **Input**: `{ name: 'Samsung', slug: 'samsung', description: 'Tech', logo: 'logo.png' }`
- **Mock setup**: `brandRepo.findBySlug` → `null`. `brandRepo.create` → mockBrand.
- **Expected**: Trả về brand entity với `status: 'PUBLISHED'`, version 1.
- **Verify**: `brandRepo.create` được gọi.

#### TC-BRD-02: Slug bị trùng → ConflictError [✅ DONE]
- **Loại**: Edge Case
- **Mock setup**: `brandRepo.findBySlug` → existing brand.
- **Expected**: Throw `ConflictError('Brand slug already exists')`.

### `delete(id)`

#### TC-BRD-03: Xóa thành công → soft delete [✅ DONE]
- **Loại**: Happy Path
- **Mock setup**: 
  - `brandRepo.findById` → brand.
  - `productRepo.countByBrandId` → `0`.
- **Expected**: Return `true`.
- **Verify**: `brandRepo.update` gọi với `{ deletedAt: Date, slug: 'samsung-deleted-xxx' }`.

#### TC-BRD-04: Brand đang được sử dụng → ConflictError [✅ DONE]
- **Loại**: Business Rule
- **Mock setup**: `brandRepo.findById` → brand. `productRepo.countByBrandId` → `10`.
- **Expected**: Throw `ConflictError('Cannot delete brand. It is used in 10 products.')`.

#### TC-BRD-05: Brand không tồn tại → NotFoundError [✅ DONE]
- **Loại**: Error Case
- **Mock setup**: `brandRepo.findById` → `null`.
- **Expected**: Throw `NotFoundError('Brand not found')`.

### `findById(id)`

#### TC-BRD-06: Tìm thấy → trả BrandEntity [✅ DONE]
- **Loại**: Happy Path
- **Mock setup**: `brandRepo.findById` → brand entity.
- **Expected**: Trả về brand entity tương ứng.

### `findBySlug(slug)`

#### TC-BRD-07: Tìm thấy → trả BrandEntity [✅ DONE]
- **Loại**: Happy Path
- **Mock setup**: `brandRepo.findBySlug` → brand entity.
- **Expected**: Trả về brand entity.

### `findAll(dto)`

#### TC-BRD-08: Phân trang limit, offset chuẩn [✅ DONE]
- **Loại**: Happy Path
- **Input**: `{ page: 2, limit: 10 }`
- **Mock setup**: `brandRepo.findAll` → `{ data: [], totalElements: 20 }`.
- **Verify**: `brandRepo.findAll` gọi với `{ offset: 10, limit: 10 }`.
- **Expected**: Trả về `{ data: [], pagination: { totalElements: 20, totalPages: 2, currentPage: 2, elementsPerPage: 10 } }`.

### `update(id, dto)`

#### TC-BRD-09: Update thông thường thành công [✅ DONE]
- **Loại**: Happy Path
- **Input**: `{ name: 'New Name' }`
- **Mock setup**: 
  - `brandRepo.findById` → brand.
  - `brandRepo.update` → updatedBrand.
- **Verify**: `brandRepo.findBySlug` KHÔNG được gọi vì không đổi slug.

#### TC-BRD-10: Cập nhật slug mới bị trùng → ConflictError [✅ DONE]
- **Loại**: Edge Case
- **Input**: `{ slug: 'new-slug' }`
- **Mock setup**: 
  - `brandRepo.findById` → brand.
  - `brandRepo.findBySlug('new-slug')` → anotherBrand.
- **Expected**: Throw `ConflictError('Brand slug already exists')`.

#### TC-BRD-11: Brand không tồn tại → NotFoundError [✅ DONE]
- **Loại**: Error Case
- **Mock setup**: `brandRepo.findById` → `null`.
- **Expected**: Throw `NotFoundError('Brand not found')`.

---

## PHẦN 2: CategoryService

### Dependencies cần mock:
- `ICategoryRepository` (categoryRepo)
- `IProductRepository` (productRepo)
- `ICacheRepo` (cacheRepo)

### Bảng tổng quát — CategoryService

| ID | Method | Kịch bản | Loại | Trạng thái |
|---|---|---|---|---|
| TC-CAT-01 | `create` | Tạo category root thành công (path: `,id,`) | Happy Path | ✅ DONE |
| TC-CAT-02 | `create` | Tạo child category thành công (path: `,parent,id,`) | Happy Path | ✅ DONE |
| TC-CAT-03 | `create` | Slug bị trùng → ConflictError | Edge Case | ✅ DONE |
| TC-CAT-04 | `move` | Chuyển sang parent mới → update toàn bộ subtree | Happy Path | ✅ DONE |
| TC-CAT-05 | `move` | Move vào chính nó → BadRequestError | Boundary | ✅ DONE |
| TC-CAT-06 | `move` | Move vào descendant của nó → BadRequestError | Boundary | ✅ DONE |
| TC-CAT-07 | `delete` | Xóa thành công → soft delete (đổi slug) | Happy Path | ✅ DONE |
| TC-CAT-08 | `delete` | Category đang chứa Product → ConflictError | Business Rule | ✅ DONE |
| TC-CAT-09 | `create` | Parent category không tồn tại → NotFoundError | Error Case | ✅ DONE |
| TC-CAT-10 | `create` | Vượt quá MAX_CATEGORY_LEVEL → BadRequestError | Boundary | ✅ DONE |
| TC-CAT-11 | `update` | Update thành công → Invalidate cache | Happy Path | ✅ DONE |
| TC-CAT-12 | `update` | Slug mới bị trùng → ConflictError | Edge Case | ✅ DONE |
| TC-CAT-13 | `move` | Move đến cùng parent hiện tại → return sớm | Edge Case | ✅ DONE |
| TC-CAT-14 | `move` | Vượt quá MAX_CATEGORY_LEVEL (cộng dồn subtree) → BadRequestError | Boundary | ✅ DONE |
| TC-CAT-15 | `move` | Lỗi update subtree → revert parent (Compensate) | Transaction | ✅ DONE |
| TC-CAT-16 | `findAll` | Cache miss → query DB, lưu cache | Performance | ✅ DONE |
| TC-CAT-17 | `findAll` | Cache hit → trả ngay từ cache | Performance | ✅ DONE |
| TC-CAT-18 | `getDiscoveryTree` | Cache miss → query root và direct children | Happy Path | ✅ DONE |
| TC-CAT-19 | private `_invalidateCache` | Lỗi Redis → catch exception, KHÔNG crash | Resilience | ✅ DONE |
| TC-CAT-20 | `findById` | Tìm thấy → trả CategoryEntity | Happy Path | ✅ DONE |
| TC-CAT-21 | `findBySlug` | Tìm thấy → trả CategoryEntity | Happy Path | ✅ DONE |
| TC-CAT-22 | `getAncestors` | Parse path và lấy theo list id | Happy Path | ✅ DONE |
| TC-CAT-23 | `findByPath` | Tìm thấy → trả CategoryEntity | Happy Path | ✅ DONE |

> **Tiến độ CategoryService: 23/23 (100%)** ✅

---

### Chi tiết từng Test Case — CategoryService

### `create(dto)`

#### TC-CAT-01: Tạo category root [✅ DONE]
- **Loại**: Happy Path
- **Input**: `{ parentPath: null }`
- **Mock setup**: `categoryRepo.create` → resolves.
- **Verify**: `result.path` format là `,id,`. `cache.deleteByPattern` được gọi.

#### TC-CAT-02: Tạo child category [✅ DONE]
- **Loại**: Happy Path
- **Input**: `{ parentPath: ',parent_id,' }`
- **Mock setup**: `categoryRepo.findByPath` → parent entity.
- **Verify**: `result.path` format là `,parent_id,new_id,`.

#### TC-CAT-03: Slug bị trùng [✅ DONE]
- **Mock setup**: `categoryRepo.findBySlug` → exists.
- **Expected**: Throw `ConflictError`.

#### TC-CAT-09: Parent category không tồn tại [✅ DONE]
- **Loại**: Error Case
- **Input**: `{ parentPath: ',fake,' }`
- **Mock setup**: `categoryRepo.findByPath` → `null`.
- **Expected**: Throw `NotFoundError('Parent category not found')`.

#### TC-CAT-10: Vượt quá MAX_CATEGORY_LEVEL [✅ DONE]
- **Loại**: Boundary
- **Input**: `{ parentPath: ',1,2,3,4,5,' }` (Đã max level 5).
- **Mock setup**: `categoryRepo.findByPath` → parent.
- **Expected**: Throw `BadRequestError('Maximum hierarchy depth... reached')`.

### `move(id, dto)`

#### TC-CAT-04: Chuyển sang parent mới [✅ DONE]
- **Loại**: Happy Path
- **Mock setup**: 
  - `categoryRepo.findById` → sourceCat.
  - `categoryRepo.findByPath` → targetParent.
  - `categoryRepo.update` → updatedCat.
- **Verify**: `categoryRepo.updateSubtreePath` được gọi.

#### TC-CAT-05: Move vào chính nó [✅ DONE]
- **Loại**: Boundary
- **Expected**: Throw `BadRequestError('A category cannot be its own parent.')`.

#### TC-CAT-06: Move vào descendant [✅ DONE]
- **Loại**: Boundary
- **Expected**: Throw `BadRequestError('Cannot move a category to one of its own descendants.')`.

#### TC-CAT-13: Move đến cùng parent hiện tại [✅ DONE]
- **Loại**: Edge Case
- **Input**: `parentPath` bằng chính parent cũ cắt từ `category.path`.
- **Expected**: Return category hiện tại. 
- **Verify**: `categoryRepo.update` KHÔNG được gọi.

#### TC-CAT-14: Move vượt quá MAX_CATEGORY_LEVEL [✅ DONE]
- **Loại**: Boundary
- **Mô tả**: Target parent level + Subtree depth > MAX_LEVEL.
- **Mock setup**: `categoryRepo.findAllDescendants` → mảng category con dài.
- **Expected**: Throw `BadRequestError('Moving this category would exceed...')`.

#### TC-CAT-15: Lỗi update subtree → revert parent [✅ DONE]
- **Loại**: Transaction (Compensating)
- **Mock setup**: 
  - `categoryRepo.update` (Parent) → SUCCESS.
  - `categoryRepo.updateSubtreePath` → throw `Error('DB Error')`.
- **Expected**: Throw `Error('DB Error')`.
- **Verify**: `categoryRepo.update` được gọi LẦN THỨ 2 với version/trạng thái nguyên gốc để revert.

### `update(id, dto)`

#### TC-CAT-11: Update thành công → Invalidate cache [✅ DONE]
- **Loại**: Happy Path
- **Verify**: `cache.deleteByPattern('cat:list:*')` và `cache.del('cat:discovery')` được gọi.

#### TC-CAT-12: Slug mới bị trùng [✅ DONE]
- **Loại**: Edge Case
- **Expected**: Throw `ConflictError`.

### `delete(id)`

#### TC-CAT-07: Xóa thành công [✅ DONE]
- **Loại**: Happy Path
- **Mock setup**: `productRepo.countByCategoryId` → `0`.
- **Expected**: Return `true`.

#### TC-CAT-08: Đang chứa Product [✅ DONE]
- **Loại**: Business Rule
- **Mock setup**: `productRepo.countByCategoryId` → `5`.
- **Expected**: Throw `ConflictError`.

### `findAll` / `getDiscoveryTree`

#### TC-CAT-16: `findAll` Cache miss [✅ DONE]
- **Loại**: Performance
- **Mock setup**: `cache.get` → throw exception / `null`. `categoryRepo.findAll` → data.
- **Verify**: `cache.set` được gọi lưu lại data.

#### TC-CAT-17: `findAll` Cache hit [✅ DONE]
- **Loại**: Performance
- **Mock setup**: `cache.get` → cachedData.
- **Expected**: Trả về `cachedData`.
- **Verify**: `categoryRepo.findAll` KHÔNG được gọi.

#### TC-CAT-18: `getDiscoveryTree` Cache miss [✅ DONE]
- **Loại**: Happy Path
- **Verify**: `categoryRepo.findAll` (with `path: null`) được gọi 1 lần để lấy L1. Chạy vòng for lấy từng L2 children.

#### TC-CAT-19: Lỗi Redis khi query/invalidate [✅ DONE]
- **Loại**: Resilience
- **Mock setup**: `cache.del` / `cache.deleteByPattern` throws Error (như MISCONF Redis).
- **Expected**: Hàm `_invalidateCache` chạy không crash, thao tác chính yếu (e.g. create) vẫn diễn ra thành công.

### `findById` / `findBySlug` / `findByPath` / `getAncestors`

#### TC-CAT-20, 21, 23: Proxy Readers [✅ DONE]
- Các hàm query DB wrapper thông thường, mock repo trả value, verify kết quả.

#### TC-CAT-22: `getAncestors` [✅ DONE]
- **Loại**: Happy Path
- **Input**: `path: ',id1,id2,id3,'`
- **Mock setup**: `categoryRepo.findByIds(['id1', 'id2', 'id3'])` → trả về array.
- **Expected**: Trả về đúng mảng đó.

---

## PHẦN 3: ProductService

### Dependencies cần mock:
- `IProductRepository` (productRepo)
- `CategoryService` (categoryService)
- `BrandService` (brandService)
- `SkuService` (skuService)
- `InventoryService` (inventoryService)

### Bảng tổng quát — ProductService

| ID | Method | Kịch bản | Loại | Trạng thái |
|---|---|---|---|---|
| TC-PRD-01 | `createProduct` | Inventory lỗi → rollback hardDelete Sku và Product | Transaction | ✅ DONE |
| TC-PRD-02 | `createProduct` | Slug trùng lúc nạp → ConflictError | Edge Case | ✅ DONE |
| TC-PRD-03 | `deleteProduct` | Soft delete Product → cascade update xóa SKUs, Inventory | Happy Path | ✅ DONE |
| TC-PRD-04 | `deleteProduct` | Product không tồn tại → NotFoundError | Error Case | ✅ DONE |
| TC-PRD-05 | `createProduct` | Tạo thành công (1 Product + N SKUs + N Inventory) | Happy Path | ✅ DONE |
| TC-PRD-06 | `createProduct` | SkuCode bị trùng → ConflictError (Validation sớm) | Edge Case | ✅ DONE |
| TC-PRD-07 | `createProduct` | CategoryId không tồn tại → NotFoundError | Error Case | ✅ DONE |
| TC-PRD-08 | `createProduct` | BrandId không tồn tại → NotFoundError | Error Case | ✅ DONE |
| TC-PRD-09 | `createProduct` | Rollback bị lỗi promise → bảo toàn ném lỗi gốc | Resilience | ✅ DONE |
| TC-PRD-10 | `updateProduct` | Update thành công, version bảo toàn | Happy Path | ✅ DONE |
| TC-PRD-11 | `updateProduct` | Đổi slug sang slug trùng → ConflictError | Edge Case | ✅ DONE |
| TC-PRD-12 | `updateProduct` | Update Category/Brand mà ID không tồn tại | Error Case | ✅ DONE |
| TC-PRD-13 | `findAll` | Phân trang: limit/offset format | Happy Path | ✅ DONE |
| TC-PRD-14 | `deleteProduct` | Lỗi cascade Inventory → log warn, vẫn trả true | Edge Case | ✅ DONE |
| TC-PRD-15 | `findById` | Tìm thấy → trả ProductEntity | Happy Path | ✅ DONE |
| TC-PRD-16 | `findBySlug` | Tìm thấy → trả ProductEntity | Happy Path | ✅ DONE |

> **Tiến độ ProductService: 16/16 (100%)** ✅

---

### Chi tiết từng Test Case — ProductService

### `createProduct(dto)`

#### TC-PRD-01: Inventory lỗi → rollback Sku/Product [✅ DONE]
- **Loại**: Transaction (Compensating)
- **Mock setup**: `skuService.create` → OK. `inventoryService.create` → throws error.
- **Verify**: `skuService.hardDelete` và `productRepo.hardDelete` được gọi. Throw lỗi gốc ra ngoài.

#### TC-PRD-02: Slug trùng → ConflictError [✅ DONE]
- **Mock setup**: `productRepo.findBySlug` → exists.
- **Expected**: Throw `ConflictError`.

#### TC-PRD-05: Tạo thành công hoàn toàn [✅ DONE]
- **Loại**: Happy Path
- **Input**: Tạo Product có 2 SKUs (trong đó có `initialQuantity`).
- **Mock setup**: Tất cả các bước đều SUCCESS.
- **Verify**: 
  - `productRepo.create` gọi 1 lần.
  - `skuService.create` gọi 2 lần với `priceHistory` mồi ban đầu.
  - `inventoryService.create` gọi 2 lần.

#### TC-PRD-06: SkuCode trùng DB [✅ DONE]
- **Loại**: Edge Case (Validate sớm)
- **Mock setup**: Mảng skus gửi lên chứa 1 SKU có mã đã có. `skuService.findBySkuCode` → exists.
- **Expected**: Throw `ConflictError('SkuCode already exists')`.
- **Verify**: `productRepo.create` KHÔNG được gọi (early exit).

#### TC-PRD-07 & 08: CategoryId/BrandId không hợp lệ [✅ DONE]
- **Loại**: Error Case
- **Mock setup**: `categoryService.findById` hoặc `brandService.findById` → `null`.
- **Expected**: Throw `NotFoundError`.

#### TC-PRD-09: Rollback Promise lỗi → không đè lỗi gốc [✅ DONE]
- **Loại**: Resilience
- **Mock setup**: 
  - `inventoryService.create` throws `Lỗi A`.
  - Hàm `_compensateDeleteSkus` catch lỗi và promise.catch nội bộ failed (v.d `hardDelete` throw `Lỗi B`).
- **Expected**: `createProduct` ném ra `Lỗi A` (Lỗi gốc). Không ném `Lỗi B` hay Unhandled Rejection.

### `updateProduct(id, dto)`

#### TC-PRD-10: Update thành công [✅ DONE]
- **Mock setup**: `productRepo.update` → updatedProduct.
- **Verify**: Gọi repo pass đúng version.

#### TC-PRD-11: Đổi slug sang slug trùng [✅ DONE]
- **Expected**: Throw `ConflictError`.

#### TC-PRD-12: Update Category/Brand mà bị null [✅ DONE]
- **Mô tả**: Khi người dùng update đổi category sang mã mới mà mã cùi. Throw `NotFoundError`.

### `deleteProduct(id)`

#### TC-PRD-03: Soft delete cascade thành công [✅ DONE]
- **Loại**: Happy Path
- **Mock setup**: Tìm thấy Product, SKUs.
- **Verify**: Gọi `productRepo.update`, `skuService.deleteByProductId`, và vòng lặp map `inventoryService.delete`.

#### TC-PRD-04: Product không tồn tại [✅ DONE]
- **Expected**: Throw `NotFoundError`.

#### TC-PRD-14: Lỗi cascade Inventory [✅ DONE]
- **Loại**: Edge Case (Idempotent Design)
- **Mock setup**: Bước `inventoryService.delete` bị lỗi.
- **Expected**: Catch promise (thành rejected array mảng allSettled), API vẫn return `true`.

### `findAll(dto)`

#### TC-PRD-13: Phân trang [✅ DONE]
- **Expected**: Cấu trúc trả ra PaginatedResult chuẩn.

### `findById` / `findBySlug`

#### TC-PRD-15, 16: Proxy Readers [✅ DONE]
- Pass đúng ID/Slug cho Repo và trả ra value.

---

## PHẦN 4: SkuService

### Dependencies cần mock:
- `ISkuRepository` (skuRepo)

### Bảng tổng quát — SkuService

| ID | Method | Kịch bản | Loại | Trạng thái |
|---|---|---|---|---|
| TC-SKU-01 | `create` | Tạo mới SKU thành công | Happy Path | ✅ DONE |
| TC-SKU-02 | `findAllByProductId` | Liệt kê SKU của product chỉ định | Happy Path | ✅ DONE |
| TC-SKU-03 | `update` | Cập nhật thông tin thông thường thành công | Happy Path | ✅ DONE |
| TC-SKU-04 | `update` | Đổi `skuCode` bị trùng SKU có sẵn cứng → ConflictError | Edge Case | ✅ DONE |
| TC-SKU-05 | `updatePrice` | Đổi base/sale price → mảng `$push priceHistory` đúng | Transaction | ✅ DONE |
| TC-SKU-06 | `updatePrice` | SKU cần cập nhật giá không có thật → NotFoundError | Error Case | ✅ DONE |
| TC-SKU-07 | `delete` | Soft delete SKU đơn lẻ (rename skuCode) | Happy Path | ✅ DONE |
| TC-SKU-08 | `deleteByProductId` | Bulk soft delete toàn SKUs bằng repo filter | Happy Path | ✅ DONE |
| TC-SKU-09 | `hardDelete` | Xóa cứng vĩnh cửu ra khỏi Database. | Security | ✅ DONE |
| TC-SKU-10 | `findById` | Tìm thấy → trả SkuEntity | Happy Path | ✅ DONE |
| TC-SKU-11 | `findBySkuCode` | Tìm thấy → trả SkuEntity | Happy Path | ✅ DONE |

> **Tiến độ SkuService: 11/11 (100%)** ✅

---

### Chi tiết từng Test Case — SkuService

### `create` / `findAllByProductId` / `hardDelete` / `deleteByProductId`

#### TC-SKU-01: Tạo mới SKU (Wrapper) [✅ DONE]
- **Loại**: Happy Path
- **Mock setup**: `skuRepo.create` → success.
- **Expected**: Hàm trả về kết quả repo.

#### TC-SKU-02, 08, 09, 10, 11: Wrapper Readers/Deleters [✅ DONE]
- Kiểm thử các hàm gọi truyền mảng proxy pass qua repo (`findById`, `findBySkuCode`, `deleteByProductId`...).

### `update(id, dto)`

#### TC-SKU-03: Cập nhật properties cơ bản [✅ DONE]
- **Loại**: Happy Path
- **Input**: `{ weight: 50 }` (hoặc `barcode`)
- **Verify**: `skuRepo.findBySkuCode` KHÔNG được gọi (do không đổi code).

#### TC-SKU-04: Đổi `skuCode` trùng DB [✅ DONE]
- **Loại**: Edge Case
- **Input**: `{ skuCode: 'EXISTING' }`
- **Mock setup**: `skuRepo.findBySkuCode` → return another sku.
- **Expected**: Throw `ConflictError('SKU code already exists')`.

### `updatePrice(id, dto)`

#### TC-SKU-05: Lưu `$push priceHistory` chuẩn xác [✅ DONE]
- **Loại**: Core Business (Audit Tracing)
- **Mô tả**: Cực kỳ quan trọng, update giá phải chèn lịch sử dùng `$push` operator của MongoDB thay vì build DB logic trên tầng JS. 
- **Input**: `{ basePrice: 150, salePrice: 120, reason: 'Flash Sale' }`
- **Mock setup**: `skuRepo.findById` → Sku có id hợp lệ. `skuRepo.update` → resolve true.
- **Verify**: `skuRepo.update` nhận Object có cụ cụm `$push`:
  ```javascript
  {
     price: { basePrice: 150, salePrice: 120 },
     $push: {
         priceHistory: {
             type: 'MANUAL', basePrice: 150, salePrice: 120, reason: 'Flash Sale'
         }
     }
  }
  ```

#### TC-SKU-06: Sku không tồn tại lúc đổi giá [✅ DONE]
- **Expected**: Throw `NotFoundError`.

### `delete(id)`

#### TC-SKU-07: Rename Soft Delete Nhả Unique Index [✅ DONE]
- **Loại**: Happy Path
- **Mô tả**: Set DeletedAt và dán đuôi vào mã Code.
- **Verify**: Cập nhật DB `$set` trường `skuCode: <oldCode>-deleted-<milisecs>`

---
> Kết thúc Test Plan dành cho Products Workspace.
> **Tổng tiến độ Module Products: 61/61 (100%)** ✅ hoàn thành tất cả Unit Tests.
