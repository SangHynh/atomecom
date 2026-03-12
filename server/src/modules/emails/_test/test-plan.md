# Test Plan: Emails Module

## Thông tin
- **Module source**:
  - `server/src/modules/emails/use-cases/email.listener.ts`
  - `server/src/modules/emails/infra/resend-mail.service.ts`
- **File test**:
  - `server/src/modules/emails/_test/unit/email.listener.spec.ts`
  - `server/src/modules/emails/_test/unit/resend-mail.service.spec.ts`

---

## PHẦN 1: EmailListener

### Dependencies cần mock:
- `EventBus` (eventBus)
- `IEmailService` (emailService)
- `MailTokenService` (mailTokenService)

> **Lưu ý**: EmailListener không có public methods nào để gọi trực tiếp — toàn bộ logic nằm trong event handlers đăng ký qua `eventBus.on(...)`. Cách test là: sau khi khởi tạo, lấy handler đã được đăng ký qua `mockEventBus.on.mock.calls`, rồi gọi trực tiếp handler đó với payload giả.

---

### Bảng tổng quát — EmailListener

| ID | Event / Kịch bản | Loại | Trạng thái |
|---|---|---|---|
| TC-EML-01 | Constructor: đăng ký đủ 5 event listeners | Happy Path | ✅ DONE |
| TC-EML-02 | `USER_CREATED` → createMailToken + sendVerificationEmail | Happy Path | ✅ DONE |
| TC-EML-03 | `USER_STATUS_CHANGED` (BANNED) → sendStatusChangeEmail | Happy Path | ✅ DONE |
| TC-EML-04 | `USER_DELETED` → sendStatusChangeEmail với status DELETED | Happy Path | ✅ DONE |
| TC-EML-05 | `PASSWORD_RESET_REQUESTED` → createMailToken(RESET_PASSWORD) + sendResetPasswordEmail | Happy Path | ✅ DONE |
| TC-EML-06 | `VERIFICATION_EMAIL_REQUESTED` → createMailToken(EMAIL_VERIFICATION) + resendVerificationEmail | Happy Path | ✅ DONE |
| TC-EML-07 | Email send fail → KHÔNG throw ra ngoài (fire-and-forget, log error) | Resilience | ✅ DONE |
| TC-EML-08 | `USER_CREATED`: token type phải là `EMAIL_VERIFICATION` | Security | ✅ DONE |
| TC-EML-09 | `VERIFICATION_EMAIL_REQUESTED`: token type phải là `EMAIL_VERIFICATION` | Security | ✅ DONE |
| TC-EML-10 | `createMailToken` fail: KHÔNG throw ra ngoài | Resilience | ✅ DONE |
| TC-EML-11 | `USER_STATUS_CHANGED` (DEACTIVE): sendStatusChangeEmail | Edge Case | ✅ DONE |
| TC-EML-12 | `USER_STATUS_CHANGED` (ACTIVE): sendStatusChangeEmail | Edge Case | ✅ DONE |
| TC-EML-13 | `sendStatusChangeEmail` fail: KHÔNG throw ra ngoài | Resilience | ✅ DONE |

> **Tiến độ: 13/13 (100%)** ✅

---

### Chi tiết từng Test Case — EmailListener

### Constructor / Khởi tạo

#### TC-EML-01: Constructor đăng ký đủ 5 event listeners [✅ DONE]
- **Loại**: Happy Path
- **Mô tả**: Đảm bảo tất cả domain events đều được lắng nghe ngay khi module khởi động.
- **Verify**: `eventBus.on` được gọi đúng 5 lần với các event:
  - `DomainEvents.USER_CREATED`
  - `DomainEvents.VERIFICATION_EMAIL_REQUESTED`
  - `DomainEvents.PASSWORD_RESET_REQUESTED`
  - `DomainEvents.USER_STATUS_CHANGED`
  - `DomainEvents.USER_DELETED`

---

### `USER_CREATED` handler

#### TC-EML-02: USER_CREATED → tạo token + gửi verification email [✅ DONE]
- **Loại**: Happy Path
- **Payload**: `{ userId: 'u1', email: 'test@ex.com' }`.
- **Verify (theo thứ tự)**:
  1. `mailTokenService.createMailToken('u1', 'test@ex.com', 'EMAIL_VERIFICATION')`.
  2. `emailService.sendVerificationEmail('test@ex.com', 'fake-token')`.

#### TC-EML-08: USER_CREATED → token type phải là EMAIL_VERIFICATION (không phải RESET_PASSWORD) [✅ DONE]
- **Loại**: Security
- **Mô tả**: Đảm bảo token dùng cho đăng ký không bị nhầm sang loại reset password.
- **Verify**: `createMailToken` được gọi với argument thứ 3 là `'EMAIL_VERIFICATION'`, không phải `'RESET_PASSWORD'`.

---

### `VERIFICATION_EMAIL_REQUESTED` handler

#### TC-EML-06: VERIFICATION_EMAIL_REQUESTED → tạo token + gửi resend email [✅ DONE]
- **Loại**: Happy Path
- **Payload**: `{ userId: 'u3', email: 'v@ex.com' }`.
- **Verify**:
  1. `mailTokenService.createMailToken('u3', 'v@ex.com', 'EMAIL_VERIFICATION')`.
  2. `emailService.resendVerificationEmail('v@ex.com', 'fake-token')`.

#### TC-EML-09: VERIFICATION_EMAIL_REQUESTED → token type phải là EMAIL_VERIFICATION [✅ DONE]
- **Loại**: Security
- **Mô tả**: Cả `USER_CREATED` và `VERIFICATION_EMAIL_REQUESTED` đều dùng token type `EMAIL_VERIFICATION` (không phải RESEND). Xem code dòng 104-105.
- **Verify**: `createMailToken` argument thứ 3 là `'EMAIL_VERIFICATION'`.

---

### `PASSWORD_RESET_REQUESTED` handler

#### TC-EML-05: PASSWORD_RESET_REQUESTED → tạo RESET_PASSWORD token + gửi reset email [✅ DONE]
- **Loại**: Happy Path
- **Payload**: `{ userId: 'u2', email: 'reset@ex.com' }`.
- **Verify**:
  1. `mailTokenService.createMailToken('u2', 'reset@ex.com', 'RESET_PASSWORD')`.
  2. `emailService.sendResetPasswordEmail('reset@ex.com', 'fake-token')`.

---

### `USER_STATUS_CHANGED` handler

#### TC-EML-03: USER_STATUS_CHANGED (BANNED) → sendStatusChangeEmail [✅ DONE]
- **Loại**: Happy Path
- **Payload**: `{ email, name, status: 'BANNED' }`.
- **Verify**: `emailService.sendStatusChangeEmail(email, name, 'BANNED')`.

#### TC-EML-11: USER_STATUS_CHANGED (DEACTIVE) → sendStatusChangeEmail [✅ DONE]
- **Loại**: Edge Case
- **Payload**: `{ email, name, status: 'DEACTIVE' }`.
- **Verify**: `emailService.sendStatusChangeEmail(email, name, 'DEACTIVE')`.

#### TC-EML-12: USER_STATUS_CHANGED (ACTIVE — restored) → sendStatusChangeEmail [✅ DONE]
- **Loại**: Edge Case
- **Mô tả**: Khi admin mở lại tài khoản bị khóa → user cần nhận email thông báo phục hồi.
- **Payload**: `{ email, name, status: 'ACTIVE' }`.
- **Verify**: `emailService.sendStatusChangeEmail(email, name, 'ACTIVE')`.

#### TC-EML-13: sendStatusChangeEmail fail → KHÔNG throw [✅ DONE]
- **Loại**: Resilience
- **Mock setup**: `emailService.sendStatusChangeEmail(...)` → throw.
- **Expected**: Handler resolve bình thường (không throw ra ngoài).
- **Mô tả**: Email là background task — lỗi gửi mail không được crash app.

---

### `USER_DELETED` handler

#### TC-EML-04: USER_DELETED → sendStatusChangeEmail với status DELETED [✅ DONE]
- **Loại**: Happy Path
- **Payload**: `{ email, name, status: 'DELETED' }`.
- **Verify**: `emailService.sendStatusChangeEmail(email, name, 'DELETED')`.

---

### Error Isolation (Fire-and-Forget)

#### TC-EML-07: Email send fail → KHÔNG throw ra ngoài [✅ DONE]
- **Loại**: Resilience
- **Mô tả**: Đây là điểm quan trọng nhất của EmailListener: lỗi email KHÔNG được lan rộng ra ngoài.
- **Mock setup**: `emailService.sendVerificationEmail(...)` → throw `Error('Send failed')`.
- **Expected**: Handler resolve thành công (`resolves.not.toThrow()`).
- **Ghi chú**: Đây là thiết kế cố ý — Email là fire-and-forget background task.

#### TC-EML-10: createMailToken fail → KHÔNG throw ra ngoài [✅ DONE]
- **Loại**: Resilience
- **Mock setup**: `mailTokenService.createMailToken(...)` → throw `Error('DB Down')`.
- **Expected**: Handler resolve thành công.
- **Verify**: `emailService.sendVerificationEmail` KHÔNG được gọi (token chưa tạo được).

---

## PHẦN 2: ResendMailService

### Mocks cần thiết (bắt buộc trong test file):
```typescript
jest.mock('@shared/configs/app.config.js', () => ({ /* fake config */ }));
jest.mock('resend', () => ({ Resend: jest.fn().mockImplementation(() => ({ emails: { send: jest.fn() } })) }));
jest.mock('fs/promises', () => ({ readFile: jest.fn().mockResolvedValue('<html>{{userName}} {{url}}</html>') }));
jest.mock('handlebars', () => ({ compile: jest.fn().mockReturnValue(() => 'rendered-html') }));
jest.mock('@shared/utils/logger.js', () => ({ default: { info: jest.fn(), error: jest.fn() } }));
```

---

### Bảng tổng quát — ResendMailService

| ID | Method / Kịch bản | Loại | Trạng thái |
|---|---|---|---|
| TC-RES-01 | `sendVerificationEmail` → gửi thành công, đúng subject | Happy Path | ✅ DONE |
| TC-RES-02 | `resendVerificationEmail` → gửi thành công, đúng subject | Happy Path | ✅ DONE |
| TC-RES-03 | `sendResetPasswordEmail` → gửi thành công, đúng subject | Happy Path | ✅ DONE |
| TC-RES-04 | `sendStatusChangeEmail` (BANNED) → đúng subject | Happy Path | ✅ DONE |
| TC-RES-05 | `sendStatusChangeEmail` (ACTIVE) → đúng subject | Happy Path | ✅ DONE |
| TC-RES-06 | Resend API trả error → throw InternalServerError | Error Case | ✅ DONE |
| TC-RES-07 | Constructor: thiếu API_KEY → throw ngay khi khởi tạo | Config Error | ✅ DONE |
| TC-RES-08 | `_send`: thiếu FROM_EMAIL → throw trước khi gọi Resend API | Config Error | ✅ DONE |
| TC-RES-09 | `sendVerificationEmail` | URL chứa đúng token | Edge Case | ✅ DONE |
| TC-RES-10 | `sendResetPasswordEmail` | URL chứa đúng token | Edge Case | ✅ DONE |
| TC-RES-11 | `sendStatusChangeEmail` (DEACTIVE) | đúng subject | Edge Case | ✅ DONE |
| TC-RES-12 | `sendStatusChangeEmail` (DELETED) | đúng subject | Edge Case | ✅ DONE |
| TC-RES-13 | `sendStatusChangeEmail` (status không biết) | fallback subject | Edge Case | ✅ DONE |
| TC-RES-14 | `sendVerificationEmail` | priority là '1 (Highest)' | Edge Case | ✅ DONE |
| TC-RES-15 | Template render fail (readFile error) | throw InternalServerError | Error Case | ✅ DONE |

> **Tiến độ: 15/15 (100%)** ✅

---

### Chi tiết từng Test Case — ResendMailService

### Constructor

#### TC-RES-07: Constructor thiếu API_KEY → throw ngay khi khởi tạo [✅ DONE]
- **Loại**: Config Error — Fail Fast
- **Mô tả**: Phát hiện lỗi cấu hình ngay khi app startup, không đợi đến lúc gửi mail mới crash.
- **Mock setup**: `appConfig.email.apiKey = ''`.
- **Expected**: `new ResendMailService()` → throw `InternalServerError('MISSING_EMAIL_API_KEY_IN_ENV')`.

---

### `sendVerificationEmail(to, token)`

#### TC-RES-01: Gửi thành công, đúng subject [✅ DONE]
- **Loại**: Happy Path
- **Mock setup**: `resend.emails.send(...)` → `{ error: null }`.
- **Verify**: `send` được gọi với `to: ['test@example.com']`, `subject` chứa `'WELCOME: VERIFY YOUR ATOMECOM ACCOUNT'`.

#### TC-RES-09: URL chứa đúng token [✅ DONE]
- **Loại**: Edge Case
- **Mô tả**: Đảm bảo link xác thực có đúng token → nếu token sai thì user verify không được.
- **Input**: `token='my-token-123'`.
- **Verify**: `readFile` mock trả template, nhưng cần xác nhận rằng context truyền vào template có chứa `url: expect.stringContaining('my-token-123')`.

#### TC-RES-14: Priority là '1 (Highest)' [✅ DONE]
- **Loại**: Edge Case
- **Mô tả**: Email xác thực là critical → phải được ưu tiên cao nhất.
- **Verify**: `send` được gọi với `headers: { 'X-Priority': '1 (Highest)' }`.

---

### `resendVerificationEmail(to, token)`

#### TC-RES-02: Gửi thành công, đúng subject [✅ DONE]
- **Verify**: Subject chứa `'NEW LINK: VERIFY YOUR ATOMECOM ACCOUNT'`.

---

### `sendResetPasswordEmail(to, token)`

#### TC-RES-03: Gửi thành công, đúng subject [✅ DONE]
- **Verify**: Subject chứa `'RESET YOUR PASSWORD'`.

#### TC-RES-10: URL chứa đúng token [✅ DONE]
- **Loại**: Edge Case
- **Input**: `token='reset-secret-token'`.
- **Verify**: Context truyền vào template có `url: expect.stringContaining('reset-secret-token')`.

---

### `sendStatusChangeEmail(to, userName, status)`

#### TC-RES-04: Status BANNED → subject chứa '🚫 ACCOUNT RESTRICTED' [✅ DONE]
- **Loại**: Happy Path

#### TC-RES-05: Status ACTIVE → subject chứa '✅ ACCOUNT ACTIVATED' [✅ DONE]
- **Loại**: Happy Path

#### TC-RES-11: Status DEACTIVE → subject chứa '⚠️ ACCOUNT DEACTIVATED' [✅ DONE]
- **Loại**: Edge Case
- **Verify**: Subject chứa `'⚠️ ACCOUNT DEACTIVATED'`.

#### TC-RES-12: Status DELETED → subject chứa '🗑️ ACCOUNT DELETED' [✅ DONE]
- **Loại**: Edge Case
- **Verify**: Subject chứa `'🗑️ ACCOUNT DELETED'`.

#### TC-RES-13: Status không nằm trong statusMap → fallback '📢 ACCOUNT STATUS UPDATE' [✅ DONE]
- **Loại**: Edge Case — Defensive Programming
- **Mô tả**: Tránh crash khi hệ thống thêm status mới mà quên cập nhật email template.
- **Input**: `status='UNKNOWN_STATUS'`.
- **Verify**: Subject chứa `'📢 ACCOUNT STATUS UPDATE'`.

---

### Error Cases

#### TC-RES-06: Resend API trả error → throw InternalServerError [✅ DONE]
- **Loại**: Error Case
- **Mock setup**: `resend.emails.send(...)` → `{ error: { message: 'Api Error' } }`.
- **Expected**: Throw `InternalServerError('EMAIL_DELIVERY_FAILED')`.

#### TC-RES-08: Thiếu FROM_EMAIL → throw trước khi gọi Resend [✅ DONE]
- **Loại**: Config Error
- **Mock setup**: `appConfig.email.fromEmail = ''`.
- **Expected**: Throw `InternalServerError('MISSING_REQUIRED_EMAIL_CONFIG_IN_ENV')`.
- **Verify**: `resend.emails.send` KHÔNG được gọi (validate trước khi call API).

#### TC-RES-15: Template render fail → throw InternalServerError [✅ DONE]
- **Loại**: Error Case
- **Mock setup**: `readFile` (fs/promises) → throw `Error('File not found')`.
- **Expected**: `sendVerificationEmail(...)` → throw `InternalServerError('EMAIL_TEMPLATE_ERROR')`.

---

## Tổng kết module Emails

| Service | Done | Total | % |
|---|---|---|---|
| `EmailListener` | 13 | 13 | 100% |
| `ResendMailService` | 15 | 15 | 100% |
| **TỔNG** | **28** | **28** | **100%** |

> **Kết luận**: Module Emails đã hoàn thành 100% Unit Tests (28/28 cases), đảm bảo tính ổn định của luồng gửi thông báo và khả năng chịu lỗi (resilience) khi làm việc với background tasks.
