# Test Plan: UserService

## Thông tin
- **File source**: `server/src/modules/users/use-cases/user.service.ts`
- **File test**: `server/src/modules/users/_test/unit/user.service.spec.ts`
- **Dependencies cần mock**:
  - `IUserRepository` (userRepo)
  - `IHashService` (hashService)
  - `EventBus` (eventBus)
  - `ICacheRepo` (cache)

---

## Bảng tổng quát

| ID | Method | Kịch bản | Loại | Trạng thái |
|---|---|---|---|---|
| TC-USR-01 | `verifyCredentials` | Email và password khớp → trả SafeDTO | Happy Path | ✅ DONE |
| TC-USR-02 | `verifyCredentials` | User không tồn tại → INVALID_CREDENTIALS | Error Case | ✅ DONE |
| TC-USR-03 | `verifyCredentials` | User không có password (OAuth account) | Error Case | ✅ DONE |
| TC-USR-04 | `verifyCredentials` | Password không khớp | Error Case | ✅ DONE |
| TC-USR-05 | `verifyAccount` | Verify thành công, truyền đúng version | Happy Path | ✅ DONE |
| TC-USR-06 | `verifyAccount` | Version mismatch → ConflictError | Edge Case | ✅ DONE |
| TC-USR-07 | `verifyAccount` | User không tồn tại | Error Case | ✅ DONE |
| TC-USR-08 | `changeEmail` | Đổi email thành công, chạy parallel check | Happy Path | ✅ DONE |
| TC-USR-09 | `changeEmail` | Email mới đã tồn tại → ConflictError | Edge Case | ✅ DONE |
| TC-USR-10 | `changePhone` | Đổi phone thành công | Happy Path | ✅ DONE |
| TC-USR-11 | `changePhone` | Phone mới đã tồn tại → ConflictError | Edge Case | ✅ DONE |
| TC-USR-12 | `upsertOAuthUser` | Tạo user mới với dummy email khi thiếu email | Edge Case | ✅ DONE |
| TC-USR-13 | `upsertOAuthUser` | Link provider vào account đã có cùng email | Edge Case | ✅ DONE |
| TC-USR-14 | `updateStatusAccount` | Update status và emit event | Happy Path | ✅ DONE |
| TC-USR-15 | `updateUser` | Emit status_changed event khi status đổi | Happy Path | ✅ DONE |
| TC-USR-16 | `updateUser` | Không emit event khi status giữ nguyên | Edge Case | ✅ DONE |
| TC-USR-17 | `findById` | Parse JSON session data từ Redis | Happy Path | ✅ DONE |
| TC-USR-18 | `findById` | Fallback legacy string session từ Redis | Edge Case | ✅ DONE |
| TC-USR-19 | `getStats` | Aggregated counts kể cả Redis online count | Happy Path | ✅ DONE |
| TC-USR-20 | `delete` | Soft delete, mask email+providers, emit event | Happy Path | ✅ DONE |
| TC-USR-21 | `delete` | User không tồn tại → NotFoundError | Error Case | ✅ DONE |
| TC-USR-22 | `delete` | User có phone → mask cả phone lẫn email | Edge Case | ✅ DONE |
| TC-USR-23 | `create` | Tạo user thành công + hash password + emit event | Happy Path | ✅ DONE |
| TC-USR-24 | `create` | Email đã tồn tại → ConflictError | Edge Case | ✅ DONE |
| TC-USR-25 | `create` | Phone đã tồn tại → ConflictError | Edge Case | ✅ DONE |
| TC-USR-26 | `updateProfile` | Update thành công (name, avatar, addresses) | Happy Path | ✅ DONE |
| TC-USR-27 | `updateProfile` | addresses > 3 → BadRequestError | Security | ✅ DONE |
| TC-USR-28 | `changePassword` | Hash password mới and update thành công | Happy Path | ✅ DONE |
| TC-USR-29 | `findAll` | Pagination và filtering đúng (offset, limit) | Happy Path | ✅ DONE |
| TC-USR-30 | `updateUser` | Chỉ validate uniqueness khi email/phone thay đổi | Business Rule | ✅ DONE |
| TC-USR-31 | `upsertOAuthUser` | Provider đã linked → skip linking, không update | Edge Case | ✅ DONE |
| TC-USR-32 | `upsertOAuthUser` | User đã tồn tại → cập nhật Name/Avatar | Happy Path | ✅ DONE |
| TC-USR-33 | `hardDelete` | Xóa vĩnh viễn, log được ghi nhận | Edge Case | ✅ DONE |
| TC-USR-34 | `findById` | User không tồn tại → NotFoundError | Error Case | ✅ DONE |
| TC-USR-35 | `findByEmail` | Tìm thấy → trả SafeDTO (không có password) | Happy Path | ✅ DONE |
| TC-USR-36 | `findByEmail` | Không tìm thấy → trả null (không throw) | Edge Case | ✅ DONE |
| TC-USR-37 | `findByPhone` | Tìm thấy → trả SafeDTO | Happy Path | ✅ DONE |
| TC-USR-38 | `findByPhone` | Không tìm thấy → trả null | Edge Case | ✅ DONE |
| TC-USR-39 | `createWithSession` | Happy Path: User + Session thành công | Happy Path | ⏳ TODO |
| TC-USR-40 | `createWithSession` | Session lỗi → Trigger hardDelete (Compensate) | Edge Case | ⏳ TODO |
| TC-USR-41 | `createWithSession` | Session lỗi + hardDelete lỗi → Fatal Rollback | Resilience| ⏳ TODO |

> **Tiến độ: 38/41 (92%)** — Đang cập nhật cho `createWithSession`.

---

## Chi tiết từng Test Case

### `verifyCredentials(email, password)`

#### TC-USR-01: Email và password khớp → trả SafeDTO [✅ DONE]
- **Loại**: Happy Path
- **Input**: `email='jane@example.com'`, `password='correctpassword'`
- **Mock setup**:
  - `userRepo.findByEmail('jane@example.com', ACTIVE)` → user entity có hashed password.
  - `hashService.compare('correctpassword', hashedPw)` → `true`.
- **Expected**: Trả về SafeUserResponseDTO — không có field `password`, không có `__v`.
- **Verify**: `findByEmail` được gọi với đúng status `ACTIVE`.

#### TC-USR-02: User không tồn tại [✅ DONE]
- **Loại**: Error Case
- **Mock setup**: `userRepo.findByEmail(...)` → `null`.
- **Expected**: Throw `UnauthorizedError(INVALID_CREDENTIALS)`.
- **Verify**: `hashService.compare` KHÔNG được gọi.

#### TC-USR-03: User không có password (OAuth account) [✅ DONE]
- **Loại**: Error Case
- **Mô tả**: User đăng ký qua Google, không có `password` trong DB → không được login theo luồng email/pw.
- **Mock setup**: `userRepo.findByEmail(...)` → user có `password: undefined`.
- **Expected**: Throw `UnauthorizedError(INVALID_CREDENTIALS)`.
- **Verify**: `hashService.compare` KHÔNG được gọi.

#### TC-USR-04: Password không khớp [✅ DONE]
- **Loại**: Error Case
- **Mock setup**: `hashService.compare(...)` → `false`.
- **Expected**: Throw `UnauthorizedError(INVALID_CREDENTIALS)`.

---

### `verifyAccount(id, isVerified)`

#### TC-USR-05: Verify thành công, truyền đúng version [✅ DONE]
- **Loại**: Happy Path
- **Mock setup**:
  - `userRepo.findById(id, ACTIVE)` → user có `version: 2`.
  - `userRepo.update(id, { isVerified: true, version: 2 })` → updated user.
- **Verify**: `update` được gọi với `version: 2` (Optimistic Locking).

#### TC-USR-06: Version mismatch → ConflictError [✅ DONE]
- **Loại**: Edge Case
- **Mô tả**: Request khác đã sửa user trước → version lệch → DB throw conflict.
- **Mock setup**: `userRepo.update(...)` → throw `ConflictError`.
- **Expected**: Propagate `ConflictError(USER_DATA_MODIFIED_CONCURRENTLY)`.

#### TC-USR-07: User không tồn tại [✅ DONE]
- **Loại**: Error Case
- **Mock setup**: `userRepo.findById(...)` → `null`.
- **Expected**: Throw `NotFoundError(USER_NOT_FOUND)`.
- **Verify**: `userRepo.update` KHÔNG được gọi.

---

### `changeEmail(id, newEmail)`

#### TC-USR-08: Đổi email thành công, chạy parallel check [✅ DONE]
- **Loại**: Happy Path
- **Mock setup**:
  - `userRepo.findById(id, ACTIVE)` → SUCCESS.
  - `userRepo.findByEmail(newEmail)` → `null`.
- **Expected**: `userRepo.update` được gọi với `{ email: newEmail, isVerified: false, isEmailMissing: false, version: ... }`.

#### TC-USR-09: Email mới đã tồn tại → ConflictError [✅ DONE]
- **Loại**: Edge Case
- **Mock setup**: `userRepo.findByEmail(newEmail)` → user **khác** tồn tại.
- **Expected**: Throw `ConflictError(EMAIL_ALREADY_EXISTS)`.
- **Verify**: `userRepo.update` KHÔNG được gọi.

---

### `changePhone(id, newPhone)`

#### TC-USR-10: Đổi phone thành công [✅ DONE]
- **Loại**: Happy Path
- **Mock setup**: `userRepo.findByPhone(newPhone)` → `null`.
- **Expected**: `userRepo.update` được gọi với `{ phone: newPhone, version: ... }`.

#### TC-USR-11: Phone mới đã tồn tại → ConflictError [✅ DONE]
- **Loại**: Edge Case
- **Mock setup**: `userRepo.findByPhone(newPhone)` → user **khác** tồn tại.
- **Expected**: Throw `ConflictError(PHONE_ALREADY_EXISTS)`.
- **Verify**: `userRepo.update` KHÔNG được gọi.

---

### `upsertOAuthUser(profile)`

#### TC-USR-12: Tạo user mới với dummy email khi thiếu email [✅ DONE]
- **Loại**: Edge Case
- **Mô tả**: Một số provider không trả về email (hiếm nhưng possible).
- **Mock setup**: `userRepo.findByOAuthId(...)` → `null`. Không có email.
- **Expected**: `userRepo.create` được gọi với `email: 'google_123@atomecom.dummy'` và `isEmailMissing: true`.
- **Verify**: Trả về SafeDTO với `email: null` (đã mask).

#### TC-USR-13: Link provider vào account đã có cùng email [✅ DONE]
- **Loại**: Edge Case
- **Mô tả**: User đã có account thường → Login Google cùng email → Phải gộp (link), không tạo mới.
- **Mock setup**:
  - `userRepo.findByOAuthId(...)` → `null`.
  - `userRepo.findByEmail(email)` → existing user (chưa có Google provider).
- **Expected**: `userRepo.update` được gọi với array `providers` chứa provider mới.
- **Verify**: `userRepo.create` KHÔNG được gọi.

#### TC-USR-31: Provider đã linked rồi → skip linking [✅ DONE]
- **Loại**: Edge Case
- **Mô tả**: User login Google lần 2 → Google đã trong `providers` → không push thêm, không update.
- **Mock setup**:
  - `userRepo.findByOAuthId(...)` → `null`.
  - `userRepo.findByEmail(email)` → user đã có `providers: [{ provider: 'GOOGLE', providerId: '123' }]`.
- **Expected**: `userRepo.update` KHÔNG được gọi thêm lần nữa để link.
- **Verify**: Providers array không bị push thêm bản sao.

#### TC-USR-32: User đã tồn tại (by providerId) → cập nhật Name/Avatar [✅ DONE]
- **Loại**: Happy Path
- **Mô tả**: User login Google lần 2 sau khi đổi avatar on Google → avatar phải cập nhật.
- **Mock setup**:
  - `userRepo.findByOAuthId(...)` → existing user với `avatar: 'old.jpg'`.
- **Expected**: `userRepo.update` được gọi với `avatar: 'new.jpg'` từ provider profile.

---

### `updateStatusAccount(id, status)`

#### TC-USR-14: Update status và emit event [✅ DONE]
- **Loại**: Happy Path
- **Mock setup**:
  - `userRepo.findById(id)` → mockUser.
  - `userRepo.update(...)` → user với status mới.
- **Verify**: `eventBus.emit('user.status_changed', { userId, email, name, status })`.

---

### `updateUser(id, dto)`

#### TC-USR-15: Emit status_changed event khi status đổi [✅ DONE]
- **Loại**: Happy Path
- **Input**: `{ status: 'BANNED' }` (status cũ là `ACTIVE`).
- **Verify**: `eventBus.emit('user.status_changed', ...)` được gọi.

#### TC-USR-16: Không emit event khi status giữ nguyên [✅ DONE]
- **Loại**: Edge Case
- **Input**: `{ name: 'New Name' }` (không có field status).
- **Verify**: `eventBus.emit` KHÔNG được gọi với event `user.status_changed`.

#### TC-USR-30: Chỉ validate uniqueness khi email/phone thay đổi [✅ DONE]
- **Loại**: Business Rule
- **Mô tả**: Nếu admin update trường khác (name), không được check uniqueness → tránh báo lỗi sai.
- **Input**: `{ name: 'New Name' }` (email và phone không có trong DTO).
- **Verify**: `userRepo.findByEmail` KHÔNG được gọi. `userRepo.findByPhone` KHÔNG được gọi.

---

### `findById(id)`

#### TC-USR-17: Parse JSON session data từ Redis [✅ DONE]
- **Loại**: Happy Path
- **Mock setup**: `cache.get('user:last_login:xxx')` → JSON string `{"timestamp": "...", "ip": "1.2.3.4"}`.
- **Expected**: User object có `isOnline: true`, `lastIp: "1.2.3.4"`, `lastDevice: "..."`.

#### TC-USR-18: Fallback legacy string session từ Redis [✅ DONE]
- **Loại**: Edge Case
- **Mock setup**: `cache.get(...)` → plain date string `"2026-01-01T12:00:00Z"`.
- **Expected**: `lastLoginAt` parse đúng ngày. `lastIp: 'unknown'`. `lastDevice: 'unknown'`.

#### TC-USR-34: User không tồn tại → NotFoundError [✅ DONE]
- **Loại**: Error Case
- **Mock setup**: `userRepo.findById(...)` → `null`.
- **Expected**: Throw `NotFoundError(USER_NOT_FOUND)`.

---

### `getStats()`

#### TC-USR-19: Aggregated counts kể cả Redis online count [✅ DONE]
- **Loại**: Happy Path
- **Verify**: `cache.countByPattern('heartbeat:user:*')` được gọi để đếm số online.

---

### `delete(id)`

#### TC-USR-20: Soft delete thành công, mask email+providers, emit event [✅ DONE]
- **Loại**: Happy Path
- **Mô tả**: Status → DELETED, email → `deleted_timestamp_email`, providers → `[]`.
- **Verify**: `eventBus.emit('user.deleted', { userId, email (original), name, status })`.

#### TC-USR-21: User không tồn tại → NotFoundError [✅ DONE]
- **Loại**: Error Case
- **Mock setup**: `userRepo.findById(...)` → `null`.
- **Expected**: Throw `NotFoundError`.

#### TC-USR-22: User có phone → mask cả phone lẫn email [✅ DONE]
- **Loại**: Edge Case
- **Mô tả**: Đảm bảo giải phóng unique index cho cả phone để người khác có thể đăng ký số đó.
- **Mock setup**: `userRepo.findById(...)` → user có cả `email` và `phone`.
- **Verify**: `userRepo.update` được gọi với `phone: expect.stringContaining('deleted_')`.

---

### `create(dto)`

#### TC-USR-23: Tạo user thành công + hash password + emit event [✅ DONE]
- **Loại**: Happy Path
- **Input**: `{ email: 'new@ex.com', password: 'plain123', name: 'New User' }`.
- **Mock setup**:
  - `userRepo.findByEmail(...)` → `null`.
  - `hashService.hash('plain123')` → `'hashed_pw'`.
  - `userRepo.create(...)` → user entity.
- **Expected**: Trả về SafeDTO (không có `password`).
- **Verify**:
  - `hashService.hash` được gọi trước `userRepo.create`.
  - `userRepo.create` được gọi với `password: 'hashed_pw'`.
  - `eventBus.emit('user.created', { userId, email })`.

#### TC-USR-24: Email đã tồn tại → ConflictError [✅ DONE]
- **Loại**: Edge Case
- **Mock setup**: `userRepo.findByEmail(email)` → existing user.
- **Expected**: Throw `ConflictError(EMAIL_ALREADY_EXISTS)`.
- **Verify**: `userRepo.create` KHÔNG được gọi.

#### TC-USR-25: Phone đã tồn tại → ConflictError [✅ DONE]
- **Loại**: Edge Case
- **Input**: `{ phone: '0901234567', ... }`.
- **Mock setup**: `userRepo.findByPhone('0901234567')` → existing user.
- **Expected**: Throw `ConflictError(PHONE_ALREADY_EXISTS)`.
- **Verify**: `userRepo.create` KHÔNG được gọi.

---

### `updateProfile(id, dto)`

#### TC-USR-26: Update thành công (name, avatar, addresses) [✅ DONE]
- **Loại**: Happy Path
- **Input**: `{ name: 'New Name', avatar: 'http://...', addresses: [addr1] }`.
- **Mock setup**: `userRepo.findById(id, ACTIVE)` → user. `userRepo.update(...)` → updated user.
- **Expected**: Trả về SafeDTO với thông tin mới.
- **Verify**: `userRepo.update` được gọi với `version` của user hiện tại.

#### TC-USR-27: addresses > 3 → BadRequestError [✅ DONE]
- **Loại**: Security / Business Rule
- **Mô tả**: Chặn spam địa chỉ, bảo vệ DB khỏi user tạo hàng trăm địa chỉ.
- **Input**: `{ addresses: [a1, a2, a3, a4] }` (4 phần tử).
- **Expected**: Throw `BadRequestError('Maximum of 3 addresses allowed per user.')`.
- **Verify**: `userRepo.update` KHÔNG được gọi.

---

### `changePassword(id, newPassword)`

#### TC-USR-28: Hash password mới và update thành công [✅ DONE]
- **Loại**: Happy Path
- **Input**: `id='user-1'`, `newPasswordPlain='newPass123'`.
- **Mock setup**:
  - `userRepo.findById(id, ACTIVE)` → user.
  - `hashService.hash('newPass123')` → `'hashed_new'`.
  - `userRepo.update(...)` → updated user.
- **Expected**: Trả về SafeDTO.
- **Verify**: `userRepo.update` được gọi với `{ password: 'hashed_new', version: user.version }`.

---

### `findAll(dto)`

#### TC-USR-29: Pagination và filtering đúng [✅ DONE]
- **Loại**: Happy Path
- **Input**: `{ page: 2, limit: 10, status: 'ACTIVE', keyword: 'john' }`.
- **Mock setup**: `userRepo.findAll(query)` → `{ data: [...], totalElements: 50 }`.
- **Verify**: `userRepo.findAll` được gọi với `{ offset: 10, limit: 10, status: 'ACTIVE', keyword: 'john' }`.
- **Expected**: Trả về `pagination.totalPages: 5`, `currentPage: 2`.

---

### `hardDelete(id)`

#### TC-USR-33: Xóa vĩnh viễn, log được ghi nhận [✅ DONE]
- **Loại**: Edge Case (Compensating Flow)
- **Mô tả**: Dùng để rollback khi register thất bại. Chỉ được gọi nội bộ, không expose API.
- **Mock setup**:
  - `userRepo.findById(id)` → user.
  - `userRepo.hardDelete(id)` → `true`.
- **Expected**: Trả về `true`.
- **Verify**: `userRepo.hardDelete` (không phải `update`) được gọi → đây là xóa thật khỏi DB.

---

### `findByEmail(email)`

#### TC-USR-35: Tìm thấy → trả SafeDTO (không có password) [✅ DONE]
- **Loại**: Happy Path
- **Mock setup**: `userRepo.findByEmail(email)` → user entity.
- **Expected**: Trả về SafeUserResponseDTO. Không có field `password`.

#### TC-USR-36: Không tìm thấy → trả null (không throw) [✅ DONE]
- **Loại**: Edge Case
- **Mô tả**: Return null thay vì throw để caller tự quyết định logic (validate email hoặc login OAuth).
- **Mock setup**: `userRepo.findByEmail(email)` → `null`.
- **Expected**: Trả về `null`.

---

### `createWithSession(dto, sessionCreator)`

#### TC-USR-39: Happy Path: User + Session thành công [⏳ TODO]
- **Loại**: Happy Path
- **Input**: `dto`, `sessionCreator` (mock callback returning tokens)
- **Verify**:
  - `this.create(dto)` được gọi.
  - `sessionCreator(user)` được gọi với user vừa tạo.
  - Trả về `{ user, result: tokens }`.
  - `hardDelete` KHÔNG được gọi.

#### TC-USR-40: Session lỗi → Trigger hardDelete (Compensate) [⏳ TODO]
- **Loại**: Edge Case (Compensating Transaction)
- **Mock setup**:
  - `this.create(dto)` → SUCCESS.
  - `sessionCreator(user)` → throw `Error('Session Fail')`.
  - `this.hardDelete(user.id)` → SUCCESS.
- **Expected**: Propagate `Error('Session Fail')`.
- **Verify**: `hardDelete(user.id)` được gọi để rollback.

#### TC-USR-41: Session lỗi + hardDelete lỗi → Fatal Rollback [⏳ TODO]
- **Loại**: Resilience
- **Mock setup**:
  - `sessionCreator` → throw `Error('Session Fail')`.
  - `this.hardDelete` → throw `Error('DB Down')`.
- **Expected**: `logger.error` được gọi cho cả 2 lỗi. Vẫn propagate `Error('Session Fail')`.
- **Verify**: Handler không "nuốt" lỗi rollback nhưng prioritize ném lỗi gốc.

---

### `findByPhone(phone)`

#### TC-USR-37: Tìm thấy → trả SafeDTO [✅ DONE]
- **Loại**: Happy Path
- **Mock setup**: `userRepo.findByPhone(phone)` → user entity.
- **Expected**: Trả về SafeUserResponseDTO.

#### TC-USR-38: Không tìm thấy → trả null [✅ DONE]
- **Loại**: Edge Case
- **Mock setup**: `userRepo.findByPhone(phone)` → `null`.
- **Expected**: Trả về `null`.

---

## PHẦN 2: UserActivityListener

### Dependencies cần mock:
- `EventBus` (eventBus)
- `ICacheRepo` (cache)

### Bảng tổng quát -- UserActivityListener

| ID | Event / Method | Kịch bản | Loại | Trạng thái |
|---|---|---|---|---|
| TC-UAL-01 | `_setupListeners` | Đăng ký đúng 2 events: USER_ACTIVITY, USER_LOGGED_IN | Happy Path | ✅ DONE |
| TC-UAL-02 | `USER_ACTIVITY` | Ghi heartbeat (5m) và login data (30d) vào Redis | Happy Path | ✅ DONE |
| TC-UAL-03 | `USER_LOGGED_IN` | Cập nhật login data (30d) vào Redis | Happy Path | ✅ DONE |
| TC-UAL-04 | `_handleActivity` | Lỗi Redis -> catch exception, KHÔNG crash app | Resilience | ✅ DONE |
| TC-UAL-05 | `_handleLastLogin` | Lỗi Redis -> catch exception, KHÔNG crash app | Resilience | ✅ DONE |

> **Tiến độ UserActivityListener: 5/5 (100%)** ✅

---

### Chi tiết từng Test Case -- UserActivityListener

#### TC-UAL-01: Đăng ký đúng các event [✅ DONE]
- **Loại**: Happy Path
- **Verify**: `eventBus.on` được gọi với các event:
  - `DomainEvents.USER_ACTIVITY`
  - `DomainEvents.USER_LOGGED_IN`

#### TC-UAL-02: USER_ACTIVITY ghi nhận trạng thái online [✅ DONE]
- **Loại**: Happy Path
- **Payload**: `{ userId: 'u1', ip: '1.1.1.1', userAgent: 'Chrome' }`
- **Verify**:
  - `cache.set` gọi với key `heartbeat:user:u1`, TTL 300s.
  - `cache.set` gọi với key `user:last_login:u1`, TTL 2592000s (30 ngày).

#### TC-UAL-03: USER_LOGGED_IN cập nhật thông tin đăng nhập [✅ DONE]
- **Loại**: Happy Path
- **Payload**: `{ userId: 'u1' }`
- **Verify**: `cache.set` gọi với key `user:last_login:u1`, TTL 30 ngày.

#### TC-UAL-04: Lỗi Redis khi xử lý Activity [✅ DONE]
- **Loại**: Resilience
- **Mock setup**: `cache.set` -> throw `Error('Redis connection lost')`.
- **Expected**: Handler kết thúc bình thường, không ném lỗi ra ngoài.

#### TC-UAL-05: Lỗi Redis khi xử lý Last Login [✅ DONE]
- **Loại**: Resilience
- **Mock setup**: `cache.set` -> throw `Error('Redis connection lost')`.
- **Expected**: Handler kết thúc bình thường, không ném lỗi ra ngoài.
