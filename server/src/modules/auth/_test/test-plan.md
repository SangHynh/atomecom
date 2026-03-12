# Test Plan: Auth Module

## Thông tin
- **Module source**:
  - `server/src/modules/auth/use-cases/auth.service.ts`
  - `server/src/modules/auth/use-cases/session.service.ts`
  - `server/src/modules/auth/use-cases/mailToken.service.ts`
  - `server/src/modules/auth/use-cases/blacklist.service.ts`
- **File test**:
  - `server/src/modules/auth/_test/unit/auth.service.spec.ts`
  - `server/src/modules/auth/_test/unit/session.service.spec.ts`
  - `server/src/modules/auth/_test/unit/mailToken.service.spec.ts`
  - `server/src/modules/auth/_test/unit/blacklist.service.spec.ts`

---

## PHẦN 1: AuthService

### Dependencies cần mock:
- `UserService` (userService)
- `ITokenService` (tokenService)
- `SessionService` (sessionService)
- `MailTokenService` (mailTokenService)
- `OauthFactory` (oauthFactory)
- `EventBus` (eventBus)

> **Lưu ý quan trọng**: Phải mock `@shared/utils/logger.js` và `@shared/configs/app.config.js` vì AuthService import chúng trực tiếp. Nếu không, Jest sẽ fail khi load module.

---

### Bảng tổng quát — AuthService

| ID | Method | Kịch bản | Loại | Trạng thái |
|---|---|---|---|---|
| TC-AUTH-01 | `login` | Đăng nhập thành công → tạo session + trả token | Happy Path | ✅ DONE |
| TC-AUTH-02 | `login` | Credentials sai → propagate UnauthorizedError | Error Case | ✅ DONE |
| TC-AUTH-03 | `login` | Đăng nhập thành công → emit USER_LOGGED_IN event | Happy Path | ✅ DONE |
| TC-AUTH-04 | `login` | Session limit >= 5 → revoke oldest trước khi tạo mới | Edge Case | ✅ DONE |
| TC-AUTH-05 | `register` | Đăng ký thành công → trả token + tạo session | Happy Path | ✅ DONE |
| TC-AUTH-06 | `register` | Session fail → rollback hardDelete user | Transaction | ✅ DONE |
| TC-AUTH-07 | `register` | Email trùng → propagate ConflictError từ UserService | Error Case | ✅ DONE |
| TC-AUTH-08 | `register` | hardDelete fail trong rollback → log lỗi, KHÔNG ném lại | Error Case | ✅ DONE |
| TC-AUTH-09 | `refresh` | Token hợp lệ → rotate và trả token mới | Happy Path | ✅ DONE |
| TC-AUTH-10 | `refresh` | Token expired/invalid → INVALID_REFRESH_TOKEN | Error Case | ✅ DONE |
| TC-AUTH-11 | `refresh` | Payload thiếu userId/sessionId → INVALID_REFRESH_TOKEN | Error Case | ✅ DONE |
| TC-AUTH-12 | `refresh` | User bị ban (không còn ACTIVE) → NotFoundError | Security | ✅ DONE |
| TC-AUTH-13 | `logout` | Token hợp lệ → revoke session | Happy Path | ✅ DONE |
| TC-AUTH-14 | `logout` | Token invalid → vẫn return void (không throw) | Edge Case | ✅ DONE |
| TC-AUTH-15 | `verifyEmail` | Token hợp lệ → verify account + tạo session auto-login | Happy Path | ✅ DONE |
| TC-AUTH-16 | `verifyEmail` | Token hết hạn/đã dùng → throw từ MailTokenService | Error Case | ✅ DONE |
| TC-AUTH-17 | `verifyEmail` | verifyAccount trả null → VERIFY_ACCOUNT_FAILED | Error Case | ✅ DONE |
| TC-AUTH-18 | `resendVerificationEmail` | User tồn tại, chưa verify → emit event | Happy Path | ✅ DONE |
| TC-AUTH-19 | `resendVerificationEmail` | User đã verify → return sớm, không emit | Edge Case | ✅ DONE |
| TC-AUTH-20 | `resendVerificationEmail` | Email không tồn tại → return void (không throw, bảo mật) | Security | ✅ DONE |
| TC-AUTH-21 | `forgotPassword` | User ACTIVE tồn tại → emit PASSWORD_RESET_REQUESTED | Happy Path | ✅ DONE |
| TC-AUTH-22 | `forgotPassword` | Email không tồn tại → return void (không throw - security) | Security | ✅ DONE |
| TC-AUTH-23 | `forgotPassword` | User tồn tại nhưng bị ban → return void (không emit) | Security | ✅ DONE |
| TC-AUTH-24 | `resetPassword` | Token hợp lệ → đổi password thành công | Happy Path | ✅ DONE |
| TC-AUTH-25 | `resetPassword` | Token invalid → throw từ MailTokenService | Error Case | ✅ DONE |
| TC-AUTH-26 | `resetPassword` | changePassword trả null → RESET_PASSWORD_FAILED | Error Case | ✅ DONE |
| TC-AUTH-27 | `socialLogin` | Token Google hợp lệ → upsert user + tạo session | Happy Path | ✅ DONE |
| TC-AUTH-28 | `socialLogin` | OAuth token invalid → throw từ OauthStrategy | Error Case | ✅ DONE |
| TC-AUTH-29 | `socialLogin` | User bị ban sau upsert → ForbiddenError | Security | ✅ DONE |

> **Tiến độ: 29/29 (100%)** — Unit Tests cho AuthService đã hoàn tất.

---

### Chi tiết từng Test Case — AuthService

### `login(dto)`

#### TC-AUTH-01: Đăng nhập thành công → tạo session + trả token [✅ DONE]
- **Loại**: Happy Path
- **Mock setup**:
  - `userService.verifyCredentials(...)` → mockUser (ACTIVE).
  - `tokenService.generateAccessToken` → `'access_token'`.
  - `tokenService.generateRefreshToken` → `'refresh_token'`.
  - `sessionService.countSessions` → `0`.
- **Expected**: Trả về `{ user, tokens: { accessToken, refreshToken } }`.
- **Verify**: `sessionService.saveRefreshTokenToCache` được gọi.

#### TC-AUTH-02: Credentials sai → propagate UnauthorizedError [✅ DONE]
- **Loại**: Error Case
- **Mock setup**: `userService.verifyCredentials(...)` → throw `UnauthorizedError`.
- **Expected**: Throw `UnauthorizedError`.
- **Verify**: `sessionService.saveRefreshTokenToCache` KHÔNG được gọi.

#### TC-AUTH-03: Đăng nhập thành công → emit USER_LOGGED_IN event [✅ DONE]
- **Loại**: Happy Path
- **Mock setup**: Tất cả mock thành công.
- **Verify**: `eventBus.emit('user.logged_in', { userId: user.id })` được gọi.

#### TC-AUTH-04: Session limit >= 5 → revoke oldest trước khi tạo mới [✅ DONE]
- **Loại**: Edge Case — Session Limit
- **Mô tả**: Mỗi user tối đa 5 session active. Login lần 6 → xóa session cũ nhất.
- **Mock setup**:
  - `userService.verifyCredentials(...)` → mockUser.
  - `sessionService.countSessions(userId)` → `5`.
- **Verify**: `sessionService.revokeOldestSession(userId)` được gọi TRƯỚC khi tạo session mới.

---

### `register(dto)`

#### TC-AUTH-05: Đăng ký thành công → trả token + tạo session [✅ DONE]
- **Loại**: Happy Path
- **Input**: `{ name: 'John', email: 'john@ex.com', password: 'pass123' }`.
- **Mock setup**:
  - `userService.create(...)` → mockUser.
  - Token + Session mocks thành công.
- **Expected**: Trả về `AuthResponseDTO` với user và tokens.
- **Verify**: `sessionService.saveRefreshTokenToCache` được gọi.

#### TC-AUTH-06: Session fail → rollback hardDelete user [✅ DONE]
- **Loại**: Transaction / Compensating
- **Mô tả**: Đây là core logic an toàn dữ liệu: không để lại zombie user khi session fail.
- **Mock setup**:
  - `userService.create(...)` → mockUser.
  - `tokenService.generateAccessToken` → throw `Error('Token Service Down')`.
- **Expected**: Throw `Error('Token Service Down')`.
- **Verify**: `userService.hardDelete(mockUser.id)` được gọi để rollback.

#### TC-AUTH-07: Email trùng → propagate ConflictError [✅ DONE]
- **Loại**: Error Case
- **Mock setup**: `userService.create(...)` → throw `ConflictError('EMAIL_ALREADY_EXISTS')`.
- **Expected**: Throw `ConflictError`.
- **Verify**: `userService.hardDelete` KHÔNG được gọi (user chưa tạo được).

#### TC-AUTH-08: hardDelete fail trong rollback → log lỗi, KHÔNG re-throw [✅ DONE]
- **Loại**: Error Case — Resilient Rollback
- **Mô tả**: Nếu hardDelete bị fail (ví dụ DB down), KHÔNG được nuốt lỗi gốc.
- **Mock setup**:
  - `userService.create(...)` → mockUser.
  - `tokenService.generateAccessToken` → throw `Error('Token Error')`.
  - `userService.hardDelete(...)` → throw `Error('DB Down')`.
- **Expected**: Re-throw `Error('Token Error')` (lỗi gốc), không phải `Error('DB Down')`.

---

### `refresh(refreshToken)`

#### TC-AUTH-09: Token hợp lệ → rotate và trả token mới [✅ DONE]
- **Loại**: Happy Path
- **Mock setup**:
  - `tokenService.verifyRefreshToken(token)` → `{ userId, sessionId, exp: futureTimestamp }`.
  - `userService.findById(userId, ACTIVE)` → mockUser.
  - `sessionService.handleRefreshToken(...)` → resolves.
  - Token generation → thành công.
- **Expected**: Trả về `AuthResponseDTO` với access/refresh token mới.

#### TC-AUTH-10: Token expired/invalid → INVALID_REFRESH_TOKEN [✅ DONE]
- **Loại**: Error Case
- **Mock setup**: `tokenService.verifyRefreshToken(token)` → throw hoặc return `null`.
- **Expected**: Throw `UnauthorizedError(INVALID_REFRESH_TOKEN)`.

#### TC-AUTH-11: Payload thiếu userId/sessionId → INVALID_REFRESH_TOKEN [✅ DONE]
- **Loại**: Edge Case
- **Mô tả**: Token verify thành công nhưng payload không đủ field cần thiết.
- **Mock setup**: `tokenService.verifyRefreshToken(token)` → `{}` (empty payload).
- **Expected**: Throw `UnauthorizedError(INVALID_REFRESH_TOKEN)`.

#### TC-AUTH-12: User bị ban sau khi token issued → NotFoundError [✅ DONE]
- **Loại**: Security
- **Mô tả**: Token cũ còn hạn nhưng user đã bị ban → không cho refresh.
- **Mock setup**:
  - `tokenService.verifyRefreshToken(...)` → valid payload.
  - `userService.findById(userId, ACTIVE)` → throw `NotFoundError`.
- **Expected**: Throw `NotFoundError`.

---

### `logout(refreshToken)`

#### TC-AUTH-13: Token hợp lệ → revoke session [✅ DONE]
- **Loại**: Happy Path
- **Mock setup**:
  - `tokenService.verifyRefreshToken(token)` → `{ userId, sessionId }`.
- **Expected**: Return `void` (không throw).
- **Verify**: `sessionService.revokeRefreshToken(userId, sessionId)` được gọi.

#### TC-AUTH-14: Token invalid → vẫn return void (không throw) [✅ DONE]
- **Loại**: Edge Case — Graceful Logout
- **Mô tả**: Token đã hết hạn hoặc giả mạo → vẫn "logout thành công" từ góc nhìn UX.
- **Mock setup**: `tokenService.verifyRefreshToken(token)` → throw `Error`.
- **Expected**: Return `void` (không throw ra ngoài).
- **Verify**: `sessionService.revokeRefreshToken` KHÔNG được gọi (catch block).

---

### `verifyEmail(token)`

#### TC-AUTH-15: Token hợp lệ → verify account + auto-login [✅ DONE]
- **Loại**: Happy Path
- **Mock setup**:
  - `mailTokenService.verifyMailToken(token, 'EMAIL_VERIFICATION')` → `'userId'`.
  - `userService.verifyAccount('userId', true)` → updatedUser.
  - Token + Session → thành công.
- **Expected**: Trả về `AuthResponseDTO` (user đã verified, có token).

#### TC-AUTH-16: Token hết hạn/đã dùng → throw từ MailTokenService [✅ DONE]
- **Loại**: Error Case
- **Mock setup**: `mailTokenService.verifyMailToken(...)` → throw `BadRequestError`.
- **Expected**: Throw `BadRequestError`.

#### TC-AUTH-17: verifyAccount trả null → VERIFY_ACCOUNT_FAILED [✅ DONE]
- **Loại**: Error Case
- **Mock setup**:
  - `mailTokenService.verifyMailToken(...)` → `'userId'`.
  - `userService.verifyAccount(...)` → `null`.
- **Expected**: Throw `InternalServerError('VERIFY_ACCOUNT_FAILED')`.

---

### `resendVerificationEmail(email)`

#### TC-AUTH-18: User tồn tại, chưa verify → emit event [✅ DONE]
- **Loại**: Happy Path
- **Mock setup**:
  - `userService.findByEmail(email)` → user `{ id: 'u1', email, isVerified: false }`.
- **Verify**: `eventBus.emit('verification_email_requested', { userId, email })`.

#### TC-AUTH-19: User đã verify → return sớm, không emit [✅ DONE]
- **Loại**: Edge Case
- **Mock setup**: `userService.findByEmail(email)` → user `{ isVerified: true }`.
- **Verify**: `eventBus.emit` KHÔNG được gọi.

#### TC-AUTH-20: Email không tồn tại → return void (không throw) [✅ DONE]
- **Loại**: Security
- **Mô tả**: Không tiết lộ email có tồn tại trong hệ thống không (chống user enumeration).
- **Mock setup**: `userService.findByEmail(email)` → `null`.
- **Expected**: Return `void` (không throw).
- **Verify**: `eventBus.emit` KHÔNG được gọi.

---

### `forgotPassword(email)`

#### TC-AUTH-21: User ACTIVE tồn tại → emit PASSWORD_RESET_REQUESTED [✅ DONE]
- **Loại**: Happy Path
- **Mock setup**: `userService.findByEmail(email, ACTIVE)` → user.
- **Verify**: `eventBus.emit('password_reset_requested', { userId, email })`.

#### TC-AUTH-22: Email không tồn tại → return void (không throw) [✅ DONE]
- **Loại**: Security — User Enumeration Prevention
- **Mock setup**: `userService.findByEmail(email, ACTIVE)` → `null`.
- **Expected**: Return `void`. `eventBus.emit` KHÔNG được gọi.

#### TC-AUTH-23: User bị ban → return void (không emit) [✅ DONE]
- **Loại**: Security
- **Mô tả**: Chỉ gửi email reset cho ACTIVE users → tránh bị lợi dụng.
- **Mock setup**: `userService.findByEmail(email, ACTIVE)` → `null` (do filter status).
- **Expected**: Return `void`. `eventBus.emit` KHÔNG được gọi.

---

### `resetPassword(token, newPassword)`

#### TC-AUTH-24: Token hợp lệ → đổi password thành công [✅ DONE]
- **Loại**: Happy Path
- **Mock setup**:
  - `mailTokenService.verifyMailToken(token, 'RESET_PASSWORD')` → `'userId'`.
  - `userService.changePassword('userId', newPassword)` → updatedUser.
- **Expected**: Return `void`.

#### TC-AUTH-25: Token invalid → throw từ MailTokenService [✅ DONE]
- **Loại**: Error Case
- **Mock setup**: `mailTokenService.verifyMailToken(...)` → throw `BadRequestError`.
- **Expected**: Throw `BadRequestError`.

#### TC-AUTH-26: changePassword trả null → RESET_PASSWORD_FAILED [✅ DONE]
- **Loại**: Error Case
- **Mock setup**:
  - `mailTokenService.verifyMailToken(...)` → `'userId'`.
  - `userService.changePassword(...)` → `null`.
- **Expected**: Throw `InternalServerError('RESET_PASSWORD_FAILED')`.

---

### `socialLogin(provider, token)`

#### TC-AUTH-27: Token Google hợp lệ → upsert user + tạo session [✅ DONE]
- **Loại**: Happy Path
- **Mock setup**:
  - `oauthFactory.getStrategy('GOOGLE')` → mockStrategy.
  - `mockStrategy.getProfile(token)` → `{ name, email, avatar, provider, providerId }`.
  - `userService.upsertOAuthUser(...)` → user `{ status: ACTIVE }`.
  - Token + Session → thành công.
- **Expected**: Trả về `AuthResponseDTO`.

#### TC-AUTH-28: OAuth token invalid → throw từ OauthStrategy [✅ DONE]
- **Loại**: Error Case
- **Mock setup**: `mockStrategy.getProfile(token)` → throw `UnauthorizedError`.
- **Expected**: Throw `UnauthorizedError`.

#### TC-AUTH-29: User bị ban sau upsert → ForbiddenError [✅ DONE]
- **Loại**: Security
- **Mô tả**: OAuth không trả về status, phải check sau khi upsert.
- **Mock setup**: `userService.upsertOAuthUser(...)` → user `{ status: 'BANNED' }`.
- **Expected**: Throw `ForbiddenError('USER_ACCOUNT_LOCKED')`.
- **Verify**: `sessionService.saveRefreshTokenToCache` KHÔNG được gọi.

---

## PHẦN 2: SessionService

### Dependencies cần mock:
- `ICacheRepo` (cache)

---

### Bảng tổng quát — SessionService

| ID | Method | Kịch bản | Loại | Trạng thái |
|---|---|---|---|---|
| TC-SES-01 | `handleRefreshToken` | Token hợp lệ → rotate thành công | Happy Path | ✅ DONE |
| TC-SES-02 | `handleRefreshToken` | Token reuse → revoke all sessions | Security | ✅ DONE |
| TC-SES-03 | `handleRefreshToken` | Session không tồn tại → INVALID_SESSION | Error Case | ✅ DONE |
| TC-SES-04 | `handleRefreshToken` | Token không khớp (bị đánh cắp) → INVALID_REFRESH_TOKEN | Security | ✅ DONE |
| TC-SES-05 | `handleRefreshToken` | Leeway window: token vừa rotate < 30s → pass | Edge Case | ✅ DONE |
| TC-SES-06 | `handleRefreshToken` | refreshTokensUsed > 5 → shift() giữ array <= 5 | Edge Case | ✅ DONE |
| TC-SES-07 | `saveRefreshTokenToCache` | Lưu session với đúng key và TTL | Happy Path | ✅ DONE |
| TC-SES-08 | `revokeRefreshToken` | Xóa đúng session key | Happy Path | ✅ DONE |
| TC-SES-09 | `revokeAllUserSessions` | Xóa tất cả sessions theo pattern | Happy Path | ✅ DONE |
| TC-SES-10 | `countSessions` | Đếm đúng số session active | Happy Path | ✅ DONE |
| TC-SES-11 | `revokeOldestSession` | Tìm và xóa session cũ nhất | Happy Path | ✅ DONE |
| TC-SES-12 | `revokeOldestSession` | Không có session → return sớm | Edge Case | ✅ DONE |

> **Tiến độ: 12/12 (100%)** — Unit Tests cho SessionService đã hoàn tất.

---

### Chi tiết từng Test Case — SessionService

### `handleRefreshToken(userId, sessionId, receivedToken, newToken, expiresAt)`

#### TC-SES-01: Token hợp lệ → rotate thành công [✅ DONE]
- **Loại**: Happy Path
- **Mock setup**: `cache.get(key)` → session với `refreshToken: 'current-rt'`.
- **Input**: `receivedToken='current-rt'`, `newToken='new-rt'`.
- **Verify**: `cache.set` được gọi với token mới (sau rotation).

#### TC-SES-02: Token reuse → revoke all sessions [✅ DONE]
- **Loại**: Security — Replay Attack Detection
- **Mô tả**: `receivedToken` nằm trong `refreshTokensUsed` → ai đó đang dùng token cũ → nghi ngờ bị đánh cắp.
- **Mock setup**: `cache.get(key)` → session với `refreshTokensUsed: ['old-rt-1']`.
- **Input**: `receivedToken='old-rt-1'` (token cũ đã dùng).
- **Expected**: Throw `UnauthorizedError(TOKEN_REUSED_DETECTION)`.
- **Verify**: `cache.deleteByPattern('auth:user:userId:session:*')` để logout tất cả devices.

#### TC-SES-03: Session không tồn tại → INVALID_SESSION [✅ DONE]
- **Loại**: Error Case
- **Mô tả**: Session đã hết TTL trong Redis hoặc bị revoke thủ công.
- **Mock setup**: `cache.get(key)` → `null`.
- **Expected**: Throw `UnauthorizedError(INVALID_SESSION)`.

#### TC-SES-04: Token không khớp → INVALID_REFRESH_TOKEN [✅ DONE]
- **Loại**: Security
- **Mô tả**: `receivedToken` không phải là token đang active, cũng không trong `used` list → token giả mạo.
- **Mock setup**: Session với `refreshToken: 'current-rt'`.
- **Input**: `receivedToken='fake-token'`.
- **Expected**: Throw `UnauthorizedError(INVALID_REFRESH_TOKEN)`.

#### TC-SES-05: Leeway window → pass không rotate lại [✅ DONE]
- **Loại**: Edge Case — Race Condition
- **Mô tả**: 2 request cùng gửi refresh token cùng lúc → request thứ 2 dùng token vừa rotate, nhưng < 30s → không phải tấn công, cho pass.
- **Mock setup**:
  ```
  session = {
    lastRefreshToken: 'recently-rotated',
    lastTokenValidUntil: Date.now() + 15000,  // còn 15s
    …
  }
  ```
- **Input**: `receivedToken='recently-rotated'`.
- **Expected**: Return `void` (không rotate, không throw).
- **Verify**: `cache.set` KHÔNG được gọi lần 2.

#### TC-SES-06: refreshTokensUsed > 5 → shift() giữ array gọn [✅ DONE]
- **Loại**: Edge Case — Memory Efficiency
- **Mock setup**: Session với `refreshTokensUsed: ['t1','t2','t3','t4','t5']` (đã 5 phần tử).
- **Input**: `receivedToken` hợp lệ.
- **Verify**: `cache.set` được gọi và array `refreshTokensUsed` không vượt quá 5.

---

### `saveRefreshTokenToCache(session, ttl)`

#### TC-SES-07: Lưu session với đúng key và TTL [✅ DONE]
- **Loại**: Happy Path
- **Input**: `session = { sessionId: 's1', userId: 'u1', … }`, `ttl = 3600`.
- **Verify**: `cache.set('auth:user:u1:session:s1', session, 3600)` được gọi với đúng key format.

---

### `revokeRefreshToken(userId, sessionId)`

#### TC-SES-08: Xóa đúng session key [✅ DONE]
- **Loại**: Happy Path
- **Input**: `userId='u1'`, `sessionId='s1'`.
- **Verify**: `cache.del('auth:user:u1:session:s1')` được gọi.

---

### `revokeAllUserSessions(userId)`

#### TC-SES-09: Xóa tất cả sessions theo pattern [✅ DONE]
- **Loại**: Happy Path
- **Input**: `userId='u1'`.
- **Verify**: `cache.deleteByPattern('auth:user:u1:session:*')` được gọi.

---

### `countSessions(userId)`

#### TC-SES-10: Đếm đúng số session active [✅ DONE]
- **Loại**: Happy Path
- **Mock setup**: `cache.countByPattern('auth:user:u1:session:*')` → `3`.
- **Expected**: Return `3`.

---

### `revokeOldestSession(userId)`

#### TC-SES-11: Tìm và xóa session cũ nhất [✅ DONE]
- **Loại**: Happy Path
- **Mô tả**: Khi user đạt giới hạn 5 sessions, đẩy session có `createdAt` nhỏ nhất ra.
- **Mock setup**:
  ```
  cache.getKeysByPattern → ['key1', 'key2', 'key3']
  cache.get('key1') → session createdAt: 1000
  cache.get('key2') → session createdAt: 3000
  cache.get('key3') → session createdAt: 2000
  ```
- **Verify**: `cache.del('key1')` được gọi (session cũ nhất theo `createdAt`).

#### TC-SES-12: Không có session → return sớm [✅ DONE]
- **Loại**: Edge Case
- **Mock setup**: `cache.getKeysByPattern(...)` → `[]`.
- **Expected**: Return `void`.
- **Verify**: `cache.get` KHÔNG được gọi.

---

## PHẦN 3: MailTokenService

### Dependencies cần mock:
- `IMailTokenRepo` (mailTokenRepo)

---

### Bảng tổng quát — MailTokenService

| ID | Method | Kịch bản | Loại | Trạng thái |
|---|---|---|---|---|
| TC-MAIL-01 | `createMailToken` | Tạo token thành công | Happy Path | ✅ DONE |
| TC-MAIL-02 | `verifyMailToken` | Token hợp lệ → trả userId, mark as used | Happy Path | ✅ DONE |
| TC-MAIL-03 | `verifyMailToken` | Token không tồn tại → throw | Error Case | ✅ DONE |
| TC-MAIL-04 | `verifyMailToken` | Token đã dùng (isUsed = true) → throw | Error Case | ✅ DONE |
| TC-MAIL-05 | `verifyMailToken` | Token hết hạn (expiresAt < now) → throw | Error Case | ✅ DONE |
| TC-MAIL-06 | `verifyMailToken` | Token type sai → throw | Security | ✅ DONE |

> **Tiến độ: 6/6 (100%)** — Unit Tests cho MailTokenService đã hoàn tất.

---

### Chi tiết — MailTokenService

### `createMailToken(userId, email, type)`

#### TC-MAIL-01: Tạo token thành công [✅ DONE]
- **Loại**: Happy Path
- **Verify**: `mailTokenRepo.create` được gọi. Token string được trả về.

### `verifyMailToken(token, type)`

#### TC-MAIL-02: Token hợp lệ [✅ DONE]
- **Mock setup**: `findByToken` → `{ userId, isUsed: false, expiresAt: future }`.
- **Expected**: Trả về `userId`. `markAsUsed` được gọi.

#### TC-MAIL-03: Token không tồn tại → throw [✅ DONE]
- **Loại**: Error Case
- **Mock setup**: `findByToken` → `null`.
- **Expected**: Throw `BadRequestError`.

#### TC-MAIL-04: Token đã dùng → throw [✅ DONE]
- **Loại**: Error Case — Replay Attack
- **Mock setup**: `findByToken` → `{ isUsed: true, expiresAt: future }`.
- **Expected**: Throw `BadRequestError`.
- **Verify**: `markAsUsed` KHÔNG được gọi lần 2.

#### TC-MAIL-05: Token hết hạn → throw [✅ DONE]
- **Loại**: Error Case
- **Mock setup**: `findByToken` → `{ isUsed: false, expiresAt: Date.now() - 1000 }` (đã qua).
- **Expected**: Throw `BadRequestError`.

#### TC-MAIL-06: Token type sai → throw [✅ DONE]
- **Loại**: Security
- **Mô tả**: Token `EMAIL_VERIFICATION` không được dùng cho `RESET_PASSWORD`.
- **Mock setup**: `findByToken` → `{ type: 'EMAIL_VERIFICATION', isUsed: false, … }`.
- **Input**: `type='RESET_PASSWORD'`.
- **Expected**: Throw `BadRequestError`.

---

## PHẦN 4: BlacklistService

### Bảng tổng quát — BlacklistService

| ID | Method | Kịch bản | Loại | Trạng thái |
|---|---|---|---|---|
| TC-BL-01 | `recordViolation` | Vi phạm đầu tiên → tạo status mới, count=1 | Happy Path | ✅ DONE |
| TC-BL-02 | `recordViolation` | Vi phạm lần 2 → increment count | Happy Path | ✅ DONE |
| TC-BL-03 | `recordViolation` | Vi phạm lần 3 → ban IP 24h | Edge Case | ✅ DONE |
| TC-BL-04 | `checkStatus` | IP sạch → `{ isBanned: false }` | Happy Path | ✅ DONE |
| TC-BL-05 | `checkStatus` | IP đang bị ban → `{ isBanned: true }` | Error Case | ✅ DONE |
| TC-BL-06 | `checkStatus` | Ban đã hết hạn → xóa khỏi Redis, allow | Edge Case | ✅ DONE |
| TC-BL-07 | `checkStatus` | IP vi phạm 1 lần → limit = 5 req/min | Edge Case | ✅ DONE |
| TC-BL-08 | `checkStatus` | IP vi phạm 2 lần → limit = 1 req/min | Edge Case | ✅ DONE |
| TC-BL-09 | `isRateLimited` | Request dưới limit → allow, increment counter | Happy Path | ✅ DONE |
| TC-BL-10 | `isRateLimited` | Request đạt limit → block | Edge Case | ✅ DONE |

> **Tiến độ: 10/10 (100%)** ✅ Module này đã test đầy đủ!

---

## Tổng kết toàn module Auth

| Service | Done | Total | % |
|---|---|---|---|
| `AuthService` | 29 | 29 | 100% |
| `SessionService` | 12 | 12 | 100% |
| `MailTokenService` | 6 | 6 | 100% |
| `BlacklistService` | 10 | 10 | 100% |
| **TỔNG** | **57** | **57** | **100%** |

> **Kết luận**: Module Auth đã hoàn thành 100% Unit Tests (57/57 cases), bao phủ các khía cạnh an toàn dữ liệu (rollback), bảo mật (session rotate, IP blacklist), và các luồng nghiệp vụ cốt lõi.
