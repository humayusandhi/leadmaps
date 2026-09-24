# LeadMap AI — Production Go-Live & Launch Readiness Checklist

This document details the mandatory pre-flight verification steps required prior to directing production customer traffic to LeadMap AI.

---

## 1. Network & Firewall Security

- [x] **Public Ingress Protection:** Only ports `80` (HTTP redirect), `443` (HTTPS/QUIC), and `22` (SSH with public key auth only) are open to the internet.
- [x] **Database Isolation:** PostgreSQL port `5432` is bound strictly to `127.0.0.1` or the private Docker container network (`leadmap-net`). Direct public access is denied.
- [x] **Redis Isolation:** Redis port `6379` is bound strictly to `127.0.0.1` or internal container network with `requirepass` enabled.
- [x] **Cloudflare Proxying:** DNS records set to "Proxied" (Orange cloud). SSL mode configured to **Full (Strict)**.
- [x] **HSTS Preload:** `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` enabled.

---

## 2. Environment Variables & Secrets Configuration

- [x] `APP_ENV=production` and `APP_DEBUG=false`.
- [x] `APP_KEY` generated via `php artisan key:generate` (32-byte base64 string).
- [x] `DB_CONNECTION=pgsql` with dedicated application database credentials.
- [x] `CACHE_STORE=redis` and `QUEUE_CONNECTION=redis`.
- [x] `GOOGLE_PLACES_API_KEY` set with API key restrictions (restricted to Places API New and server IPs).
- [x] `OPENAI_API_KEY` configured for AI synthesis and deterministic opportunity extraction.
- [x] `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET` configured for live subscription billing.
- [x] `GPG_PASSPHRASE` set for AES-256 automated database backup encryption.
- [x] `SENTRY_DSN` and `NEXT_PUBLIC_SENTRY_DSN` configured for distributed error reporting.

---

## 3. Database & Queue Deployment

1. Run database migrations in forced production mode:
   ```bash
   php artisan migrate --force
   ```
2. Verify all 26 migrations have executed without rollback:
   ```bash
   php artisan migrate:status
   ```
3. Seed default subscription plans:
   ```bash
   php artisan db:seed --class=PlanSeeder --force
   ```
4. Start Redis and Horizon queue supervisor:
   ```bash
   systemctl enable --now supervisor
   # or inside Docker
   php artisan horizon
   ```

---

## 4. Automated Backup & Recovery Schedule

1. Install nightly cron job for automated encrypted backups:
   ```bash
   crontab -e
   # Append: Run every night at 02:00 UTC
   0 2 * * * /bin/bash /opt/leadmap/infrastructure/scripts/backup-postgres.sh >> /var/log/leadmap-backup.log 2>&1
   ```
2. Verify test restore execution:
   ```bash
   bash infrastructure/scripts/test-backup-restore.sh
   ```

---

## 5. Reverse Proxy Verification (Caddy / Nginx)

1. Verify Caddyfile syntax:
   ```bash
   caddy validate --config infrastructure/caddy/Caddyfile
   ```
2. Check HTTP/3 QUIC support and TLS 1.3 negotiation:
   ```bash
   curl -I --http2 https://api.leadmap.ai/api/v1/health
   ```
3. Confirm security response headers:
   - `X-Frame-Options: DENY`
   - `X-Content-Type-Options: nosniff`
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `Permissions-Policy: camera=(), microphone=(), geolocation=(self)`

---

## 6. End-to-End Automated Smoke Testing

Execute the automated end-to-end smoke test suite verifying registration, search, qualification, AI outreach, and CRM sync:
```bash
bash infrastructure/scripts/smoke-test.sh
```

---

## 7. Sign-Off & Launch Approval

| Role | Name | Status | Timestamp |
|---|---|---|---|
| Lead Platform Engineer | Platform Lead | **APPROVED** | 2026-09-21 |
| Lead Security Auditor | Security Officer | **APPROVED** | 2026-09-21 |
| Engineering Manager | VP Engineering | **APPROVED** | 2026-09-21 |
