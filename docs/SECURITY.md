# LeadMap AI — Security Requirements & Policy

**Document:** `SECURITY.md` & `docs/SECURITY.md`  
**Status:** Active Security Standard  
**Target:** Production Baseline  
**Core Principle:** *Security must be engineered into the architecture from day one, not retrofitted five minutes before deployment.*

---

## 1. Authentication & Session Security

* **Protected Routes:** All routes under `/dashboard`, `/finder`, `/leads`, `/lists`, `/analytics`, `/integrations`, and `/billing` require authenticated sessions (Laravel Sanctum SPA stateful cookies or Bearer API tokens).
* **Password Hashing:** Passwords must be hashed using **Argon2id** (memory cost 65536 KiB, time cost 4, threads 1). Never use MD5, SHA1, or unsalted algorithms.
* **Brute-Force & Rate Limiting:**
  * Authentication endpoints (`/api/v1/auth/login`, `/register`) are rate-limited to 10 requests per minute per IP.
  * 5 consecutive failed login attempts trigger a 15-minute account lock.
* **Session Lifecycle:**
  * Stateful session cookies must enforce `HttpOnly`, `Secure`, and `SameSite=Lax` (or `Strict`).
  * Expired sessions return `HTTP 401 Unauthorized` and prompt the user to re-authenticate.
* **Password Reset Security:** Reset tokens must be cryptographically secure (min 64 chars), single-use, and expire strictly after 60 minutes.

---

## 2. Authorization & Multi-Tenant Boundaries (BOLA / IDOR Defense)

* **Server-Side Tenant Enforcement:**
  * Every query targeting tenant data must include a server-enforced `workspace_id` scope.
  * Never trust client-submitted workspace IDs in request payloads without verifying active membership via `TenantIsolationMiddleware`.
* **Resource Ownership Policies:**
  * Direct object references (`/api/v1/leads/{id}`, `/api/v1/lists/{id}`) must pass policy checks (`LeadPolicy`, `ListPolicy`).
  * Attempting to access or manipulate a resource belonging to another workspace must immediately return `HTTP 403 Forbidden` and log a security audit event.
* **Role-Based Access Control (RBAC):**
  * `OWNER`: Full administrative, billing, and workspace destruction privileges.
  * `ADMIN`: Team management, integrations, and operational controls.
  * `MEMBER`: Search execution, lead management, outreach generation, exports.
  * `VIEWER`: Read-only access; cannot spend credits or mutate data.

---

## 3. Server-Side Request Forgery (SSRF) Defense for Website Crawler

> **CRITICAL VULNERABILITY MITIGATION:**  
> The Website Analyzer inspects arbitrary, publicly accessible business URLs. Without strict controls, this subsystem can be exploited as an SSRF proxy to query internal network services or cloud metadata.

The crawler must execute a mandatory **pre-flight security filter** before opening any network socket:

```
Target URL Input (e.g. https://clinic.example)
        ↓
1. Protocol Whitelist Check (http:// and https:// only)
        ↓
2. DNS Hostname Resolution (getaddrinfo)
        ↓
3. Resolved IP Blacklist Evaluation:
   • Reject Loopback: 127.0.0.0/8, ::1
   • Reject RFC 1918 Private Ranges: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16
   • Reject Link-Local: 169.254.0.0/16, fe80::/10
   • Reject Cloud Metadata: 169.254.169.254, metadata.google.internal
        ↓
   ├── Blacklisted IP Detected → Abort Connection & Throw SecurityViolationException
   └── Valid Public IP Verified → Proceed to HTTP Request
        ↓
4. Connection Execution:
   • Max Timeout: 10,000 ms
   • Max Redirect Depth: 3 (Each redirect MUST re-run Steps 1–3)
   • Max Response Size: 5 MB (Abort stream if exceeded)
```

---

## 4. Secret Hygiene & Zero Client Exposure

* **No Secrets in Source Control:** `.env`, API keys, private certificates, and database credentials must never be committed to Git.
* **Client-Side Secret Isolation:**
  * Browser JavaScript must **never** receive Google Maps server keys, OpenAI/Anthropic API keys, Razorpay webhook secrets, or CRM tokens.
  * `NEXT_PUBLIC_` environment variables in `apps/web` are strictly limited to non-sensitive identifiers (e.g., public Mapbox access tokens, app URL).
* **Credential Encryption at Rest:**
  * Third-party CRM credentials (RiffCRM API keys) must be stored encrypted using AES-256-GCM via Laravel's encryption engine (`APP_KEY`).
* **Sanitized Logging:**
  * Application logging formatters must automatically redact sensitive fields (`password`, `password_confirmation`, `token`, `secret`, `authorization`, `credit_card`).

---

## 5. Database & Infrastructure Network Isolation

* **Zero Public Port Exposure:**
  * PostgreSQL port `5432` and Redis port `6379` must bind **strictly** to internal Docker virtual networks or `127.0.0.1`.
  * Public network access to database and cache ports must be explicitly blocked by host firewall rules (`ufw deny 5432`, `ufw deny 6379`).
* **Principle of Least Privilege:**
  * The production application must connect using a dedicated database user granted only `SELECT`, `INSERT`, `UPDATE`, `DELETE` privileges.
  * Administrative schema changes must run through controlled migration pipelines.
* **Encrypted Backups:**
  * Automated nightly database dumps must be encrypted with GPG before transmission to offsite object storage (Cloudflare R2 / AWS S3).

---

## 6. Input Validation & Injection Prevention

* **Strict Request Validation:**
  * All incoming HTTP request bodies, query strings, and headers must be validated via Laravel FormRequests on the backend and Zod on the frontend.
* **SQL Injection Prevention:**
  * Use Eloquent ORM parameterized queries exclusively. Raw SQL queries (`DB::raw`) are banned unless accompanied by explicit parameter bindings and security review.
* **Cross-Site Scripting (XSS) Prevention:**
  * Automatic HTML escaping enabled across Next.js JSX and Laravel templates.
  * Content-Security-Policy (CSP) headers enforced to prevent execution of unauthorized inline scripts.
* **Mass-Assignment Defense:**
  * Never pass raw `$request->all()` into model creation or updates. Use explicit DTO mapping and `$guarded = ['*']` by default.

---

## 7. Webhook & Payment Security

* **HMAC Signature Verification:**
  * The Razorpay webhook endpoint (`/api/v1/billing/webhook`) must verify HMAC-SHA256 signatures using `RAZORPAY_WEBHOOK_SECRET` before processing.
  * Payloads failing signature verification must immediately return `HTTP 400 Bad Request` and trigger an alert.
* **Replay Attack Defense & Idempotency:**
  * Webhook event IDs must be recorded in an append-only `webhook_events` table with a unique constraint.
  * Duplicate events must be acknowledged with `HTTP 200 OK` and discarded without re-processing.

---

## 8. File Uploads & Export Security

* **CSV Formula Injection Prevention:**
  * When generating CSV exports, sanitize cell values starting with `= `, `+`, `-`, or `@` by prefixing a single quote (`'`) to prevent remote code execution in spreadsheet software.
* **Export Access Controls:**
  * Exported files must be stored in private S3 buckets.
  * Downloads are served strictly via signed, expiring URLs with a maximum TTL of 15 minutes.
* **File Upload Validation (Future):**
  * Validate MIME type via file magic bytes (not file extension).
  * Enforce maximum file size limits (10 MB).
  * Sanitize filenames to prevent path traversal attacks (`../`).

---

## 9. Network & Edge Security Headers

The reverse proxy (Caddy / Nginx) and Cloudflare edge must enforce standard production security headers:

```http
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.leadmap.ai;
```

---

## 10. Vulnerability Reporting & Incident Response

* **Reporting:** Security vulnerabilities should be reported directly to `security@leadmap.ai`.
* **Triage SLA:** Critical vulnerabilities (SSRF, tenant bypass, remote execution) must be triaged within 4 hours and patched within 24 hours.
