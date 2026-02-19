# Security Strategies

This document outlines the security measures implemented in the Atomecom application to protect user data, prevent automated abuse, and ensure system integrity.

## 1. Authentication & Session Management

We use a dual-token strategy (Access Token & Refresh Token) to balance security and user experience.

### Client-Side
- **Storage**:
  - `Access Token`: Stored in **memory only** (via `axios` closure). This prevents XSS attacks from easily stealing the token.
  - `Refresh Token`: Stored in an **HTTP-only, Secure Cookie**. This prevents client-side JavaScript access, mitigating XSS risks.
- **Axios Interceptors**:
  - **Request**: Automatically attaches the Authorization header (`Bearer <token>`) if an access token exists in memory.
  - **Response**: Handles `401 Unauthorized` errors globally. If an API call fails due to an expired access token, the interceptor attempts to refresh the token using the HTTP-only cookie.
    - If refresh is successful: Retries the original request with the new token.
    - If refresh fails: Logs the user out and redirects to login, preventing infinite loops.
- **Auth Initializer**: A dedicated component (`AuthInitializer`) restores the in-memory access token on startup if a valid refresh cookie exists.

### Server-Side
- **JWT Validation**: Protected routes require a valid `Bearer` token. The `authMiddleware` verifies the token's signature, expiration, and session status in Redis.
- **JWT Nonce**: Every token includes a unique `nonce` (UUID). This ensures that tokens generated for the same user at the same time are mathematically unique, preventing collisions and rotation issues.
- **Token Rotation & Reuse Detection**:
  - Every refresh produces a **new** refresh token and invalidates the old one.
  - The system tracks a history of used tokens (`refreshTokensUsed`) in Redis.
  - **Panic Button**: If a reuse is detected, the system immediately **revokes all active sessions** for that user.
- **Revocation Mechanism**: Sessions can be revoked individually (logout) or globally (breach detection) by deleting the session key in Redis.

## 2. Anti-Bot & Deceptive Response Noise

We implement several layers of distraction and detection for malicious actors to mitigate automated scanning and brute-force attempts.

- **System Honeypot Route**: A specific route `/v1/system/admin/keys` is exposed but hidden from legitimate users.
- **Hidden Frontend Link**: A hidden `<a>` tag in the application layout points to the honeypot route. Legitimate users never see or click it, but web scrapers and automated bots will follow it.
- **Controller-level Honeypots**: Registration and Login forms include a hidden `honey_pot` field. If this field is populated (common in bot-driven automated posting), the request is flagged.
- **Deceptive Noise Response**: When a honeypot is triggered:
  1. The attacker's IP and User-Agent are logged with a `🚨 [SECURITY]` alert.
  2. The system returns a `200 OK` (to deceive the bot into assuming professional success) but includes a generated "System Integrity Hash".
  3. This "hash" is actually a collection of base64-encoded seamless metadata noise to effectively waste the attacker's resources and analysis time.

## 3. Header Obfuscation & Seamless Metadata

To further obfuscate internal architecture and confuse automated scanners, the system injects misleading metadata into HTTP responses.

- **Middleware**: `requestIdMiddleware`
- **Mechanism**: Every response includes an `X-System-Key` header.
- **Content**: The value of this header is a dynamic base64-encoded string generated from the same metadata noise pool used in honeypots.
- **Purpose**: It mimics critical infrastructure tokens or internal encryption keys. Attackers may attempt to analyze or replay it, redirecting their focus away from actual vulnerabilities.

## 4. Opaque Tokens for Sensitive Operations

For high-security one-time operations, we avoid JWTs in favor of **Opaque Tokens**:
- **Usage**: Email Verification and Password Reset.
- **Implementation**: 128-character high-entropy strings generated via `crypto.randomBytes(64)`.
- **Validation**: Stored in MongoDB with a strict expiration and a `isUsed` flag to prevent replay attacks and ensure one-time consumption.

## 5. Permission & Account Status (RBAC)

- **Role-Based Access Control (RBAC)**: The `requireRole` middleware restricts routes to specific roles (e.g., `ADMIN`, `USER`).
- **Account Status Enforcement**: Users must maintain a `status: ACTIVE` to perform most operations. Accounts that are `BANNED` or `DEACTIVE` are rejected early in the auth flow.
- **Verification Requirement**: Sensitive actions, such as placing orders or processing payments, strictly require the account to be `isVerified: true`.
- **Identity Sync**: Social logins (Google/Facebook) automatically link accounts by email but might require additional verification if critical data is missing.

## 6. Network & HTTP Security

- **Proxy Trust**: The application is configured with `app.set('trust proxy', 1)`. This allows the server to correctly identify client IP addresses and protocol information when deployed behind reverse proxies (like Nginx, Cloudflare, or Load Balancers), which is essential for accurate rate limiting and secure cookie handling.
- **CORS**: Strictly configured to allow only trusted origins with `credentials: true`.
- **Helmet**: Sets various secure HTTP headers, including:
  - **Content Security Policy (CSP)**: Custom directives for trusted external scripts and frame protection.
  - **X-Powered-By Removal**: Standard framework headers are explicitly removed to prevent technology fingerprinting and hide the fact that the server is running on Express/Node.js.
- **Rate Limiting**: `globalRateLimiter` enforces a 30 requests/minute limit per IP to prevent DoS and brute-force attacks.

## 7. Data Privacy & Information Protection

- **Sensitive Data Filtering**: The application follows a strict **Safe Response** policy. Sensitive fields, such as `password` (even hashed) or internal system flags (`__v`), are explicitly stripped from domain objects before being returned in API responses.
- **Dummy Email Mechanism**: For social logins missing an email, we use a placeholder (`provider_id@atomecom.dummy`) to satisfy DB constraints but mask it as `null` in API responses to trigger a "Complete Profile" flow.
- **Error Sanitization**: Stack traces and internal implementation details are hidden in production; only standardized error codes are returned to prevent information leakage.

## 8. Reactive IP Penalization (Honeypot Throttling)

To actively deter attackers, the system tracks honeypot violations and applies escalating penalties to the offending IP address.

- **Mechanism**: The `BlacklistService` (backed by Redis) counts triggers for each IP.
- **Escalation Milestones**:
  1. **Level 1 (1st hit)**: The IP is restricted to **5 requests per minute**.
  2. **Level 2 (2nd hit)**: The IP is restricted to **1 request per minute**.
  3. **Level 3 (3rd hit)**: The IP is **fully banned** (`403 Forbidden`) for 24 hours.
- **Implementation**: The `blacklistMiddleware` checks the IP status at the entry of every request, ensuring that penalized actors cannot easily brute-force or scrape the application even after discovering a honeypot.
