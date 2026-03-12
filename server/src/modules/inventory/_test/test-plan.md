# Test Plan: Inventory Module

## Thông tin
- **Module source**: `server/src/modules/inventory/use-cases/inventory.service.ts`
- **File test**: `server/src/modules/inventory/_test/unit/inventory.service.spec.ts`

---

## PHẦN 1: InventoryService

### Dependencies cần mock:
- `IInventoryRepository` (inventoryRepo)
- `ICacheRepo` (cacheRepo)

### Bảng tổng quát — InventoryService

| ID | Method | Kịch bản | Loại | Trạng thái |
|---|---|---|---|---|
| TC-INV-01 | `reserveProductStock` | Happy Path: Lock thành công, DB trừ kho thành công | Happy Path | ✅ DONE |
| TC-INV-02 | `reserveProductStock` | Không lấy được Redis lock → ConflictError | Edge Case | ✅ DONE |
| TC-INV-03 | `reserveProductStock` | Lỗi DB trong lúc reserve → Vẫn phải release lock | Resilience | ✅ DONE |
| TC-INV-04 | `reserveProductStock` | Lock thành công, DB trừ kho thất bại (hết hàng/fail) → ConflictError | Edge Case | ✅ DONE |
| TC-INV-05 | `addStock` | addStock thông thường → gọi updateStock tại DB | Happy Path | ✅ DONE |
| TC-INV-06 | `addStock` | Inventory record không tồn tại → NotFoundError | Error Case | ✅ DONE |
| TC-INV-07 | `addStock` | Lượng add truyền vào <= 0 → BadRequestError (Validate sớm) | Edge Case | ✅ DONE |
| TC-INV-08 | `delete` | Soft delete truyền vào ID hợp lệ → gọi repo | Happy Path | ✅ DONE |
| TC-INV-09 | `delete` | Xóa ID không tồn tại → NotFoundError | Error Case | ✅ DONE |
| TC-INV-10 | `releaseProductStock` | Logic release thành công trên DB → return true | Happy Path | ✅ DONE |
| TC-INV-11 | `releaseProductStock` | DB thả block thất bại (vượt quá số reserved) → BadRequestError | Edge Case | ✅ DONE |
| TC-INV-12 | `confirmProductStock` | Logic confirm (biến thành sale) thành công → return true | Happy Path | ✅ DONE |
| TC-INV-13 | `confirmProductStock` | DB confirm thất bại (không thủ stock, etc) → BadRequestError | Edge Case | ✅ DONE |
| TC-INV-14 | `create` | Wrap call sang Repo create thành công | Happy Path | ✅ DONE |
| TC-INV-15 | `findBySkuId` | Wrapper tìm kiếm ID → trả InventoryEntity / Null | Happy/Edge Path | ✅ DONE |

> **Tiến độ InventoryService: 15/15 (100%)** ✅

---

### Chi tiết từng Test Case — InventoryService

### `reserveProductStock(skuId, quantity)`

#### TC-INV-01: Happy Path [✅ DONE]
- **Loại**: Happy Path
- **Mock setup**: 
  - `cacheRepo.waitAndAcquire` → `true`.
  - `inventoryRepo.reserveStock` → `true`.
- **Verify**: `waitAndAcquire`, `reserveStock`, và NHẤT ĐỊNH `releaseLock` được gọi (trong khối `finally`).

#### TC-INV-02: Không lấy được Redis lock → ConflictError [✅ DONE]
- **Loại**: Edge Case (Hoạt động đa luồng Race Condition)
- **Mock setup**: `cacheRepo.waitAndAcquire` → `false` (bị giành mất).
- **Expected**: Throw `ConflictError('System is busy processing inventory...')`.
- **Verify**: `inventoryRepo.reserveStock` KHÔNG được gọi.

#### TC-INV-03: Lỗi DB thì vẫn phải release lock [✅ DONE]
- **Loại**: Resilience
- **Mock setup**: `inventoryRepo.reserveStock` → ném `Error('DB Error')`.
- **Expected**: `reserveProductStock` ném lại chính `Error('DB Error')`.
- **Verify**: `cacheRepo.releaseLock` VẪN PHẢI ĐƯỢC GỌI. Tránh Deadlock.

#### TC-INV-04: DB từ chối (hết hàng) → ConflictError [✅ DONE]
- **Loại**: Edge Case
- **Mô tả**: Lock thành công để nhường slot thao tác, thao tác kiểm tra DB nhưng không đủ hàng (hoặc `reserveStock` update bằng `$expr` fail).
- **Mock setup**: 
  - `cacheRepo.waitAndAcquire` → `true`.
  - `inventoryRepo.reserveStock` → `false`.
- **Expected**: Throw `ConflictError('Insufficient stock or reservation failed...')`.
- **Verify**: `cacheRepo.releaseLock` vẫn phải gọi (block `finally`).

### `releaseProductStock(skuId, quantity)`

#### TC-INV-10: Release thành công [✅ DONE]
- **Loại**: Happy Path
- **Mock setup**: `inventoryRepo.releaseStock` → `true`.
- **Expected**: Return `true`.

#### TC-INV-11: DB thả block thất bại → BadRequestError [✅ DONE]
- **Loại**: Edge Case
- **Mock setup**: `inventoryRepo.releaseStock` → `false`.
- **Expected**: Throw `BadRequestError('Failed to release stock...')`. Mới được fix thêm.

### `confirmProductStock(skuId, quantity)`

#### TC-INV-12: Confirm thành công [✅ DONE]
- **Loại**: Happy Path
- **Mock setup**: `inventoryRepo.confirmStock` → `true`.
- **Expected**: Return `true`.

#### TC-INV-13: DB confirm thất bại → BadRequestError [✅ DONE]
- **Loại**: Edge Case
- **Mock setup**: `inventoryRepo.confirmStock` → `false`.
- **Expected**: Throw `BadRequestError('Failed to confirm stock...')`. Mới được fix thêm.

### `addStock(skuId, amount)`

#### TC-INV-05: Add thông thường gọi DB update [✅ DONE]
- **Mock setup**: `inventoryRepo.findBySkuId` → existing entity. `inventoryRepo.updateStock` → resolve.
- **Verify**: `inventoryRepo.updateStock` gọi với tham số (skuId, amount, 0).

#### TC-INV-06: Inventory kỷ lục không tồn tại → NotFoundError [✅ DONE]
- **Mock setup**: `inventoryRepo.findBySkuId` → `null`.
- **Expected**: Throw `NotFoundError`.

#### TC-INV-07: Truyền <= 0 thì văng ngay từ vòng ngoài (Validation) [✅ DONE]
- **Loại**: Edge Case
- **Input**: amount = 0, amount = -10.
- **Expected**: Throw `BadRequestError('Amount to add must be greater than zero.')`.
- **Verify**: `findBySkuId` KHÔNG ĐƯỢC GỌI. 

### `delete(skuId)`

#### TC-INV-08: Soft delete thành công gọi DB update [✅ DONE]
- **Mock setup**: `inventoryRepo.findBySkuId` → existing entity.
- **Verify**: `inventoryRepo.delete` được wrap và pass đúng tham số. Trả về true.

#### TC-INV-09: Inventory không tồn tại → NotFoundError [✅ DONE]
- **Mock setup**: `inventoryRepo.findBySkuId` → `null`.
- **Expected**: Throw `NotFoundError`.

### `create` / `findBySkuId`

#### TC-INV-14: Proxy wrap `create` method [✅ DONE]
- **Loại**: Happy Path
- **Mock setup**: `inventoryRepo.create` → resolves.
- **Verify**: Truyền đúng params sang DB và trả data thành công.

#### TC-INV-15: Proxy wrap `findBySkuId` method [✅ DONE]
- **Loại**: Happy Path
- **Mock setup**: `inventoryRepo.findBySkuId` → resolves entity / null.
- **Expected**: Trả về đúng `InventoryEntity` hoặc `null`.

---
> Kết thúc Test Plan dành cho Inventory Module.
