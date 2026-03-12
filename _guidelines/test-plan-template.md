# 📋 HƯỚNG DẪN VIẾT TEST PLAN — ATOMECOM

> Tài liệu này định nghĩa **format chuẩn** để viết Test Plan cho mỗi module.  
> Mỗi module sẽ có 1 file `test-plan.md` đặt trong thư mục `_test/` của module đó.  
> AI hoặc developer chỉ cần đọc file này + source code → viết test chính xác.

---

## 1. Cấu trúc thư mục

```
modules/
  └── <module>/
      └── _test/
          ├── test-plan.md              ← Kịch bản test chi tiết
          ├── unit/
          │   ├── <service>.create.spec.ts  ← Tách theo Use Case (Khuyên dùng cho module lớn)
          │   └── <service>.auth.spec.ts
          ├── integration/
          │   ├── <module>.create.spec.ts  ← Tách theo Use Case (Integration)
          │   └── <module>.delete.spec.ts
          └── seed/
              └── <module>.seed.ts      ← Dữ liệu mẫu cho test
```

---

## 2. Format Test Plan

Mỗi file `test-plan.md` PHẢI có các phần sau:

```markdown
# Test Plan: <TênService>

## Thông tin
- **File source**: `<đường dẫn tới file service>`
- **File test**: `<đường dẫn tới file spec>`
- **Dependencies cần mock**: Liệt kê tất cả dependencies

---

## Unit Tests

### <Tên method>

#### TC-<số>: <Tên kịch bản> [TRẠNG THÁI]
- **Loại**: Happy Path | Edge Case | Error Case | Security
- **Mô tả**: Giải thích ngắn kịch bản
- **Preconditions**: Điều kiện trước khi chạy
- **Input**: Tham số đầu vào
- **Mock setup**: Các mock cần setup (mock nào return gì)
- **Expected**: Kết quả mong đợi
- **Verify**: Các assertion cần kiểm tra
- **Ghi chú**: Lưu ý đặc biệt (optional)
```

### Quy ước trạng thái:
- `[✅ DONE]` — Đã viết test
- `[❌ TODO]` — Chưa viết, cần làm
- `[⏭️ SKIP]` — Bỏ qua có lý do

---

## 3. MẪU HOÀN CHỈNH: InventoryService

> Đây là ví dụ thực tế dựa trên code hiện tại của dự án.  
> Copy format này cho các module khác.

---

# Test Plan: InventoryService

## Thông tin
- **File source**: `server/src/modules/inventory/use-cases/inventory.service.ts`
- **File test**: `server/src/modules/inventory/_test/unit/inventory.service.spec.ts`
- **Dependencies cần mock**:
  - `IInventoryRepository` (inventoryRepo) — CRUD + stock operations
  - `ICacheRepo` (cacheRepo) — Redis distributed lock

---

## Bảng tổng quát

| ID | Method | Kịch bản | Loại | Trạng thái |
|---|---|---|---|---|
| TC-INV-01 | `reserveProductStock` | Reserve thành công khi đủ hàng | Happy Path | ✅ DONE |
| TC-INV-02 | `reserveProductStock` | Lock timeout (request khác đang giữ) | Edge Case | ✅ DONE |
| TC-INV-03 | `reserveProductStock` | DB lỗi → vẫn release lock | Error Case | ✅ DONE |
| TC-INV-04 | `reserveProductStock` | Không đủ hàng → throw ConflictError | Edge Case | ❌ TODO |
| TC-INV-05 | `reserveProductStock` | Lock key chứa đúng skuId | Edge Case | ❌ TODO |
| TC-INV-06 | `releaseProductStock` | Release thành công | Happy Path | ❌ TODO |
| TC-INV-07 | `releaseProductStock` | Release > reserved → throw | Edge Case | ❌ TODO |
| TC-INV-08 | `confirmProductStock` | Confirm thành công | Happy Path | ❌ TODO |
| TC-INV-09 | `confirmProductStock` | Confirm thất bại → throw | Edge Case | ❌ TODO |
| TC-INV-10 | `addStock` | Thêm stock thành công | Happy Path | ✅ DONE |
| TC-INV-11 | `addStock` | Inventory không tồn tại | Error Case | ✅ DONE |
| TC-INV-12 | `addStock` | Amount âm → throw | Edge Case | ❌ TODO |
| TC-INV-13 | `addStock` | Amount = 0 → throw | Edge Case | ❌ TODO |
| TC-INV-14 | `create` | Tạo inventory thành công | Happy Path | ❌ TODO |
| TC-INV-15 | `delete` | Soft delete thành công | Happy Path | ✅ DONE |
| TC-INV-16 | `delete` | Inventory không tồn tại | Error Case | ✅ DONE |
| TC-INV-17 | `delete` | Custom deletedAt (cascade) | Edge Case | ❌ TODO |
| TC-INV-18 | `findBySkuId` | Tìm thấy | Happy Path | ❌ TODO |
| TC-INV-19 | `findBySkuId` | Không tìm thấy → null | Edge Case | ❌ TODO |

> **Tiến độ: 19/19 (100%)** — Mọi test case đã được đồng bộ hóa với Code thực tế.

---

## 4. CHIẾN LƯỢC TỔ CHỨC FILE TEST (Bảo trì lâu dài)

Khi module trở nên phức tạp (ví dụ: `Users`, `Orders`), tuyệt đối KHÔNG viết tất cả test vào một file duy nhất. Hãy chia nhỏ theo **Use Case**:

### Quy tắc chia file:
1. **Unit Test**: Tách theo nhóm tính năng của Service.
   - Ví dụ: `user.profile.unit.spec.ts`, `user.auth.unit.spec.ts`.
2. **Integration Test**: Tách theo nhóm API Endpoints.
   - Ví dụ: `user.mutation.int.spec.ts` (Create/Update/Delete), `user.query.int.spec.ts` (FindAll/FindById).

### Lợi ích:
- Tránh file test dài hàng nghìn dòng.
- Cô lập Side Effects (dữ liệu rác từ test trước không ảnh hưởng test sau).
- Chạy test song song nhanh hơn.

---

## Chi tiết từng Test Case

### `reserveProductStock(skuId, quantity)`

> **Mục đích**: Reserve stock cho đơn hàng. Dùng Redis Lock để chống race condition,
> MongoDB atomic query để chống overselling.

#### TC-INV-01: Reserve thành công khi đủ hàng [✅ DONE]
- **Loại**: Happy Path
- **Mô tả**: Lock acquired, repo trả true → return true
- **Input**: `skuId='sku-123'`, `quantity=5`
- **Mock setup**:
  - `cacheRepo.waitAndAcquire('inventory:reserve:sku-123', 5000, 3000)` → `true`
  - `inventoryRepo.reserveStock('sku-123', 5)` → `true`
- **Expected**: Return `true`
- **Verify**:
  - `waitAndAcquire` được gọi với đúng lockKey, TTL, timeout
  - `reserveStock` được gọi với đúng skuId, quantity
  - `releaseLock` PHẢI được gọi (finally block)

#### TC-INV-02: Throw ConflictError khi không lấy được lock [✅ DONE]
- **Loại**: Edge Case — Concurrent Access
- **Mô tả**: Có request khác đang giữ lock → timeout → throw
- **Input**: `skuId='sku-123'`, `quantity=5`
- **Mock setup**:
  - `cacheRepo.waitAndAcquire(...)` → `false`
- **Expected**: Throw `ConflictError('System is busy...')`
- **Verify**:
  - `reserveStock` KHÔNG được gọi
  - `releaseLock` KHÔNG được gọi (chưa acquire)

#### TC-INV-03: Release lock khi DB lỗi (finally block) [✅ DONE]
- **Loại**: Error Case — DB Failure
- **Mô tả**: Lock acquired nhưng DB query fail → lock vẫn phải release
- **Input**: `skuId='sku-123'`, `quantity=5`
- **Mock setup**:
  - `cacheRepo.waitAndAcquire(...)` → `true`
  - `inventoryRepo.reserveStock(...)` → `throw new Error('DB Error')`
- **Expected**: Throw `Error('DB Error')`
- **Verify**:
  - `releaseLock` VẪN PHẢI được gọi (đảm bảo lock không bị leak)

#### TC-INV-04: Throw ConflictError khi không đủ hàng [❌ TODO]
- **Loại**: Edge Case — Insufficient Stock
- **Mô tả**: Lock OK nhưng `available < quantity` → repo trả false → Service throw
- **Input**: `skuId='sku-123'`, `quantity=100`
- **Mock setup**:
  - `cacheRepo.waitAndAcquire(...)` → `true`
  - `inventoryRepo.reserveStock('sku-123', 100)` → `false`
- **Expected**: Throw `ConflictError('Insufficient stock...')`
- **Verify**:
  - `releaseLock` PHẢI được gọi
  - Error message chứa 'Insufficient stock'

#### TC-INV-05: Lock key chứa đúng skuId [❌ TODO]
- **Loại**: Edge Case — Key Isolation
- **Mô tả**: Đảm bảo mỗi SKU có lock key riêng, không ảnh hưởng SKU khác
- **Input**: `skuId='sku-AAA'`, `quantity=1`
- **Mock setup**: Bất kỳ
- **Expected**: `waitAndAcquire` được gọi với key `'inventory:reserve:sku-AAA'`
- **Verify**: Lock key format đúng pattern

---

### `releaseProductStock(skuId, quantity)`

> **Mục đích**: Trả lại stock đã reserve (khi checkout bị cancel).

#### TC-INV-06: Release thành công [❌ TODO]
- **Loại**: Happy Path
- **Input**: `skuId='sku-123'`, `quantity=3`
- **Mock setup**:
  - `inventoryRepo.releaseStock('sku-123', 3)` → `true`
- **Expected**: Return `true`
- **Verify**: `releaseStock` gọi đúng params

#### TC-INV-07: Throw BadRequestError khi release thất bại [❌ TODO]
- **Loại**: Edge Case — Release > Reserved
- **Mô tả**: Cố release nhiều hơn số lượng đang reserved
- **Input**: `skuId='sku-123'`, `quantity=999`
- **Mock setup**:
  - `inventoryRepo.releaseStock('sku-123', 999)` → `false`
- **Expected**: Throw `BadRequestError('Failed to release stock...')`

---

### `confirmProductStock(skuId, quantity)`

> **Mục đích**: Xác nhận bán hàng (sau khi thanh toán thành công).
> Trừ cả `quantity` và `reserved`.

#### TC-INV-08: Confirm thành công [❌ TODO]
- **Loại**: Happy Path
- **Input**: `skuId='sku-123'`, `quantity=2`
- **Mock setup**:
  - `inventoryRepo.confirmStock('sku-123', 2)` → `true`
- **Expected**: Return `true`

#### TC-INV-09: Throw BadRequestError khi confirm thất bại [❌ TODO]
- **Loại**: Edge Case — Confirm > Quantity hoặc > Reserved
- **Input**: `skuId='sku-123'`, `quantity=999`
- **Mock setup**:
  - `inventoryRepo.confirmStock('sku-123', 999)` → `false`
- **Expected**: Throw `BadRequestError('Failed to confirm stock...')`

---

### `addStock(skuId, amount)`

> **Mục đích**: Admin nhập thêm hàng vào kho.

#### TC-INV-10: Thêm stock thành công [✅ DONE]
- **Loại**: Happy Path
- **Input**: `skuId='sku-1'`, `amount=10`
- **Mock setup**:
  - `inventoryRepo.findBySkuId('sku-1')` → `{ skuId: 'sku-1' }`
- **Expected**: `updateStock('sku-1', 10, 0)` được gọi

#### TC-INV-11: Throw NotFoundError nếu inventory không tồn tại [✅ DONE]
- **Loại**: Error Case
- **Input**: `skuId='sku-1'`, `amount=10`
- **Mock setup**:
  - `inventoryRepo.findBySkuId('sku-1')` → `null`
- **Expected**: Throw `NotFoundError('Inventory not found')`
- **Verify**: `updateStock` KHÔNG được gọi

#### TC-INV-12: Throw BadRequestError nếu amount <= 0 [❌ TODO]
- **Loại**: Edge Case — Invalid Input
- **Input**: `skuId='sku-1'`, `amount=-5`
- **Expected**: Throw `BadRequestError('Amount to add must be greater than zero.')`
- **Verify**: `findBySkuId` KHÔNG được gọi (validate trước khi query)

#### TC-INV-13: Throw BadRequestError nếu amount = 0 [❌ TODO]
- **Loại**: Edge Case — Boundary
- **Input**: `skuId='sku-1'`, `amount=0`
- **Expected**: Throw `BadRequestError('Amount to add must be greater than zero.')`

---

### `create(inventory)`

> **Mục đích**: Tạo bản ghi inventory mới cho SKU (gọi khi tạo Product).

#### TC-INV-14: Tạo inventory thành công [❌ TODO]
- **Loại**: Happy Path
- **Input**: `{ skuId: 'sku-new', quantity: 50, reserved: 0, available: 50 }`
- **Mock setup**:
  - `inventoryRepo.create(...)` → return input
- **Expected**: Return entity đã tạo

---

### `delete(skuId, deletedAt?)`

> **Mục đích**: Soft delete inventory (khi xóa Product/SKU).

#### TC-INV-15: Soft delete thành công [✅ DONE]
- **Loại**: Happy Path
- **Input**: `skuId='sku-1'`
- **Mock setup**:
  - `inventoryRepo.findBySkuId('sku-1')` → `{ skuId: 'sku-1' }`
  - `inventoryRepo.delete('sku-1', ...)` → `true`
- **Expected**: Return `true`

#### TC-INV-16: Throw NotFoundError nếu inventory không tồn tại [✅ DONE]
- **Loại**: Error Case
- **Input**: `skuId='sku-1'`
- **Mock setup**:
  - `inventoryRepo.findBySkuId('sku-1')` → `null`
- **Expected**: Throw `NotFoundError('Inventory not found')`

#### TC-INV-17: Truyền deletedAt custom (cascade delete) [❌ TODO]
- **Loại**: Edge Case — Cascade Consistency
- **Mô tả**: Khi cascade delete từ Product, tất cả child dùng cùng timestamp
- **Input**: `skuId='sku-1'`, `deletedAt=new Date('2026-01-01')`
- **Mock setup**:
  - `inventoryRepo.findBySkuId(...)` → `{ skuId: 'sku-1' }`
  - `inventoryRepo.delete(...)` → `true`
- **Expected**: `inventoryRepo.delete` được gọi với đúng `deletedAt` truyền vào

---

### `findBySkuId(skuId)`

#### TC-INV-18: Tìm thấy inventory [❌ TODO]
- **Loại**: Happy Path
- **Input**: `skuId='sku-1'`
- **Mock setup**: `inventoryRepo.findBySkuId('sku-1')` → `{ skuId: 'sku-1', quantity: 100 }`
- **Expected**: Return entity

#### TC-INV-19: Không tìm thấy → return null [❌ TODO]
- **Loại**: Edge Case — Not Found
- **Input**: `skuId='nonexistent'`
- **Mock setup**: `inventoryRepo.findBySkuId('nonexistent')` → `null`
- **Expected**: Return `null` (không throw, để caller quyết định)

---

## Tổng kết

| Trạng thái | Số lượng |
|---|---|
| ✅ DONE | 7 |
| ❌ TODO | 12 |
| Tổng cộng | 19 |

---

## Hướng dẫn cho AI viết test

Khi viết test từ plan này, tuân theo các quy tắc:

1. **Mock logger**: Luôn mock logger ở đầu file
```typescript
jest.mock('@shared/utils/logger.js', () => ({
  __esModule: true,
  default: { info: jest.fn(), error: jest.fn(), debug: jest.fn(), warn: jest.fn() },
}));
```

2. **Đặt tên test**: Dùng format `it('TC-INV-XX: <mô tả>', ...)`
```typescript
it('TC-INV-04: should throw ConflictError when insufficient stock', async () => {
  // ...
});
```

3. **Nhóm theo method**: Mỗi method 1 `describe` block
```typescript
describe('reserveProductStock', () => {
  it('TC-INV-01: ...', ...);
  it('TC-INV-02: ...', ...);
});
```

4. **Mock setup trong beforeEach**: Setup các mock mặc định, override trong từng test.
5. **Verify đủ**: Kiểm tra cả return value VÀ side effects (hàm nào được gọi, hàm nào KHÔNG được gọi).
6. **Import error classes**: Import từ `@shared/core/error.response.js`.

---

## 6. BÀI HỌC KINH NGHIỆM (QUY TẮC VÀNG) ⚠️

Đảm bảo dữ liệu trong Test PHẢI khớp với **Zod Schemas** và **Mongoose Model**:

1. **Password**: Luôn sử dụng mật khẩu mạnh cho test (ví dụ: `Password123!`).
   - *Lý do*: Schema yêu cầu chữ hoa, số và ký tự đặc biệt. Mật khẩu yếu sẽ bị lỗi 400.
2. **ObjectId**: Luôn sử dụng `mongoose.Types.ObjectId().toString()` hoặc một chuỗi hex 24 ký tự hợp lý.
   - *Lý do*: Tránh lỗi `CastError` (500) khi Mongoose validator chặn ID sai định dạng.
3. **Soft Delete**: Khi verify dữ liệu đã xóa mềm trong Integration Test:
   - Sử dụng `UserModel.collection.findOne({ _id: ... })`.
   - *Lý do*: Các hàm `findById` hay `findOne` thông thường sẽ bị Middleware của Mongoose lọc mất bản ghi có `deletedAt: null`.
4. **Zod Error Mapping**: Error Handler trả về lỗi validation trong mảng `errors`.
   - Kiểm tra thuộc tính `field` (ví dụ: `body.name`) và `message` để xác nhận đúng lỗi.
