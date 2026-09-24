# LeadMap AI — Project Memory & Active State

**Document:** `docs/MEMORY.md`  
**Status:** Baseline Specifications Finalized — Ready for Phase 1 Scaffold  
**Last Updated:** 2026-09-21  

---

## 1. Current Status

Phase 1 through Phase 10 (TASK-001 to TASK-077) are 100% fully implemented, hardened, and verified.
Both the frontend Next.js 15+ application and the Laravel 11 API backend compile and pass all tests, linting, type checks, and automated security penetration suites without error.
All 77 tasks across the entire roadmap are complete.

---

## 2. Completed Milestones & Assets

* [x] **Project Scaffolding Structure:** Directory outline created (`docs/`, `.cursor/rules/`, `src/`, `tests/`).
* [x] **Taste Skills Installed:** Installed 13 design & engineering skills from `Leonxlnx/taste-skill` into `.agents/skills/`.
* [x] **Product Requirements Document ([docs/PRD.md](file:///home/humayu/Downloads/ProjectsRiffas/LeadMaps/docs/PRD.md)):**
  - 16 core sections, multi-tenancy, data classification (Provider, Observed, Derived, AI Inference).
  - Business discovery via Google Places API (New) with zero web scraping.
  - Deterministic lead scoring engine specification (0–100 explainable score).
  - Phased scope breakdown (MVP through V4 / Enterprise).
* [x] **Design System Specification ([docs/DESIGN.md](file:///home/humayu/Downloads/ProjectsRiffas/LeadMaps/docs/DESIGN.md)):**
  - Linear-tier functional minimalism + tactile hardware structuralism.
  - Palette: Void Obsidian (`#090A0D`), Slate Surface (`#111318`), Signal Emerald (`#10B981`).
  - Typography: `Geist Sans` + `Geist Mono` (`Inter` strictly banned).
  - Tactile components: Double-Bezel (Doppelrand) cards + Island Button-in-Button CTAs.
  - Strict anti-pattern blacklist (no AI purple slop, no pure `#000000`, no generic 3-card rows).
* [x] **Technical Architecture Specification ([docs/ARCHITECTURE.md](file:///home/humayu/Downloads/ProjectsRiffas/LeadMaps/docs/ARCHITECTURE.md)):**
  - Modular Monolith + Asynchronous Workers (Next.js 15 + Laravel 11 + PostgreSQL 16 + Redis 7 + Horizon).
  - Multi-layer SSRF defense pipeline for website crawler.
  - Vendor-agnostic provider abstractions (Google Places, OpenAI, Razorpay, RiffCRM).
  - Atomic two-phase credit reservation pattern.
* [x] **Engineering Rulebook & Cursor Rules ([RULES.md](file:///home/humayu/Downloads/ProjectsRiffas/LeadMaps/RULES.md)):**
  - [.cursor/rules/general.md](file:///home/humayu/Downloads/ProjectsRiffas/LeadMaps/.cursor/rules/general.md)
  - [.cursor/rules/frontend.md](file:///home/humayu/Downloads/ProjectsRiffas/LeadMaps/.cursor/rules/frontend.md)
  - [.cursor/rules/backend.md](file:///home/humayu/Downloads/ProjectsRiffas/LeadMaps/.cursor/rules/backend.md)
  - [.cursor/rules/testing.md](file:///home/humayu/Downloads/ProjectsRiffas/LeadMaps/.cursor/rules/testing.md)
* [x] **Master Task Roadmap ([TASKS.md](file:///home/humayu/Downloads/ProjectsRiffas/LeadMaps/TASKS.md)):**
  - 77 granular, sequential engineering tasks across 10 implementation phases.
* [x] **Architectural Decision Records ([docs/DECISIONS.md](file:///home/humayu/Downloads/ProjectsRiffas/LeadMaps/docs/DECISIONS.md)):**
  - ADR-001 through ADR-012 locked into permanent record.

* [x] **Phase 1: Project Foundation & Monorepo Scaffold (TASK-001 to TASK-007):**
  - Monorepo directory blueprint, Docker Compose with private DB ports, Next.js 15+ App Router, Tailwind CSS v4 design tokens, double-bezel cards, Laravel 11 backend skeleton, and Horizon queue definitions.

* [x] **Phase 2: Authentication & Workspace Multi-Tenancy (TASK-008 to TASK-015):**
  - `TASK-008`: PostgreSQL migrations for `users`, `workspaces`, and `workspace_members` with composite unique indexes and role enums.
  - `TASK-009`: Laravel Sanctum authentication models (`User`, `Workspace`, `WorkspaceMember`), FormRequests, and `AuthController` with Argon2id password hashing.
  - `TASK-010`: `TenantIsolationMiddleware` and `BelongsToTenant` trait with global Eloquent scope enforcing `X-Workspace-ID`.
  - `TASK-011`: `WorkspacePolicy` defining RBAC permissions matrix (`OWNER`, `ADMIN`, `MEMBER`, `VIEWER`).
  - `TASK-012`: Centralized frontend API client (`lib/api/client.ts`), stateful `AuthContext`, and `useAuth` hook.
  - `TASK-013`: Frontend auth pages (`/login`, `/register`, `/forgot-password`) adhering to `docs/DESIGN.md`.
  - `TASK-014`: Dashboard app shell (`app/(dashboard)/layout.tsx`), floating island navigation (`FloatingNav`), workspace switcher dropdown (`WorkspaceSwitcher`), live credit ticker, and telemetry dashboard overview (`/dashboard`).
  - `TASK-015`: Comprehensive verification passing `tsc --noEmit`, Next.js production build (`next build` 8/8 routes prerendered), and PHP syntax check on all backend files.

* [x] **Phase 3: Google Places Discovery & Map Experience (TASK-016 to TASK-023):**
  - `TASK-016`: `BusinessDiscoveryProvider` contract, official `GooglePlacesProvider` (Places API New, zero web scraping, FieldMask optimization, rate-limit backoff), and `MockBusinessDiscoveryProvider`.
  - `TASK-017`: Database migrations for `searches`, `businesses`, and `search_results`; `BusinessNormalizerService` with lead deduplication logic and `is_saved` calculation.
  - `TASK-018`: Asynchronous `DiscoverBusinessesJob` on Horizon `search` queue with atomic credit reservation and failure refund policy.
  - `TASK-019`: Search REST API endpoints (`POST /api/v1/searches`, `GET /api/v1/searches/{id}`, `GET /api/v1/searches`) with tenant isolation and `ExecuteSearchRequest` validation (1–50 km).
  - `TASK-020`: High-performance dark vector `MapCanvas` powered by Leaflet & CartoDB Dark Matter tiles, custom Signal Emerald pins (`#10B981`) with pulse animation, dynamic clustering, and "Search this area" controls.
  - `TASK-021`: 50/50 Desktop split-cockpit interface (`app/(dashboard)/finder/page.tsx` & `/discovery`) with responsive mobile single-column toggle (< 768px).
  - `TASK-022`: Double-Bezel `BusinessResultCard` with 4-tier data provenance badges (`PROVIDER`), rating stars, contact details, and bidirectional click-to-center synchronization between list and map.
  - `TASK-023`: Unit tests (`BusinessNormalizerTest`, `GooglePlacesProviderTest`), TypeScript verification (`tsc --noEmit`), and production Next.js build (10/10 static routes).

* [x] **Phase 4: Lead Database & Core Management Pipeline (TASK-024 to TASK-031):**
  - `TASK-024`: Database migrations for `leads`, `lead_scores`, `lead_notes`, `tags`, and `lead_tags` with multi-tenant workspace unique constraints and indexing on `(workspace_id, status)` and `(workspace_id, lead_score)`.
  - `TASK-025`: `LeadStatusEnum` lifecycle state machine (`NEW`, `RESEARCHED`, `CONTACTED`, `REPLIED`, `QUALIFIED`, `MEETING`, `WON`, `LOST`) with strict transition assertions; idempotent `SaveBusinessAsLeadAction` and `UpdateLeadStatusAction`.
  - `TASK-026`: Team collaboration actions: `AddLeadNoteAction` with author attribution, `TagLeadAction`, and `RemoveTagFromLeadAction`.
  - `TASK-027`: Lead Management REST API endpoints (`GET /api/v1/leads`, `POST /api/v1/leads`, `GET /api/v1/leads/{id}`, `PATCH /status`, `POST /notes`, `POST/DELETE /tags`, `PATCH /assign`, `DELETE /archive`) with tenant isolation.
  - `TASK-028`: Double-Bezel `LeadsTable` view (`app/(dashboard)/pipeline/page.tsx` & `/leads`) featuring status tabs, search filter, lead score gauges, inline status selector, and empty state CTA.
  - `TASK-029`: Comprehensive Lead Profile & Diagnostic Dossier view (`app/(dashboard)/leads/[id]/page.tsx`) with lifecycle progression stepper, score waterfall breakdown, provider verification signals, and team notes stream.
  - `TASK-030`: Lead assignment action and workspace member collaborator mapping.
  - `TASK-031`: State machine unit test suite (`LeadStateMachineTest.php`) verifying 16 legal transitions and 6 illegal transition exceptions, TypeScript verification (`tsc --noEmit`), and Next.js production build (12/12 routes).

* [x] **Phase 5: Website Analyzer & SSRF-Safe Crawler (TASK-032 to TASK-039):**
  - `TASK-032`: PostgreSQL migration for `website_analyses` table and Eloquent model with `hasOne` relationship in `Lead`.
  - `TASK-033`: Multi-layer `SsrfProtectionService` enforcing protocol whitelist (`http`/`https`), standard port restrictions, internal hostname blocking, and comprehensive IPv4/IPv6 CIDR blacklist checks (loopback, RFC 1918, link-local, cloud metadata `169.254.169.254`).
  - `TASK-034`: Resilient `SafeWebsiteFetcher` enforcing 10s timeouts, 5MB max payload truncation, max 3 redirects with re-validated SSRF targets, and custom `LeadMapBot/1.0` User-Agent.
  - `TASK-035`: DOM harvesters: `TechnicalSignalExtractor` (SSL status, load latency, mobile viewport) and `SeoSignalExtractor` (title length, meta description, OpenGraph tags, JSON-LD schema markup, heading hierarchy).
  - `TASK-036`: `ConversionSignalExtractor` (hero CTA detection, interactive forms, `tel:` links, WhatsApp chat widgets, Calendly/booking embeds) and heuristic CMS detector (WordPress, Shopify, Wix, Squarespace, Webflow).
  - `TASK-037`: Asynchronous `AnalyzeWebsiteJob` running on Horizon `website-analysis` queue and `AnalysisController` with `POST /api/v1/leads/{id}/analyze` and `GET /api/v1/leads/{id}/analysis`.
  - `TASK-038`: 4-Panel Bento Diagnostic Audit Grid (`TechnicalAuditGrid.tsx` & `SignalIndicatorRow.tsx`) mounted in `app/(dashboard)/leads/[id]/page.tsx` with live polling and provenance indicators.
  - `TASK-039`: Unit test suites (`SsrfProtectionServiceTest.php`, `SignalExtractorsTest.php`) with 100% assertions passing green, shared types rebuilt, `tsc --noEmit` passing, and Next.js build succeeding (12/12 routes).

* [x] **Phase 6: AI Opportunity Engine & Deterministic Lead Scoring (TASK-040 to TASK-047):**
  - `TASK-040`: PostgreSQL migrations for `ai_analyses` and `ai_opportunities` with composite indexes on `(lead_id, category)`; Eloquent models `AiAnalysis` and `AiOpportunity` with relationships in `Lead`.
  - `TASK-041`: `AIProviderInterface` abstraction with production `OpenAIProvider` (structured JSON mode, system prompt versioning, token usage tracking) and `MockAIProvider` (deterministic offline rule-based signal synthesizer).
  - `TASK-042`: Strict `AIOpportunitySchemaValidator` verifying 15 allowed categories, required evidence quotes, confidence levels, and safe string bounds.
  - `TASK-043`: Mathematical `DeterministicLeadScoringService` calculating explainable 0–100 scores across 4 dimensions (Technical Health 25pts, SEO Visibility 25pts, Conversion Deficits 25pts, Local Reputation 25pts) with exact point waterfall generation and persistence.
  - `TASK-044`: Asynchronous `AnalyzeLeadJob` on Horizon `ai-analysis` queue, `OpportunityController` (`POST /api/v1/leads/{id}/opportunities`, `GET /api/v1/leads/{id}/opportunities`), and status progression to `RESEARCHED`.
  - `TASK-045`: Circular SVG `LeadScoreGauge` radial meter (0–100) rendered in `Geist Mono` with animated stroke and `ScoreWaterfallBreakdown` with collapsible point contribution cards.
  - `TASK-046`: Double-Bezel `OpportunityCard` with distinct Category pills, `AI INFERENCE` badges, quoted verifiable evidence, suggested agency services, and confidence chips.
  - `TASK-047`: Comprehensive unit test suites (`DeterministicLeadScoringTest.php`, `AIOpportunityEngineTest.php`) with 100% assertions satisfied, TypeScript checks passing, and Next.js production build succeeding (12/12 routes).

* [x] **Phase 7: Custom Lists, AI Outreach Drafting & CSV Export (TASK-048 to TASK-055):**
  - `TASK-048`: Migrations for `lead_lists` and `lead_list_items` + CRUD REST endpoints (`/api/v1/lists`).
  - `TASK-049`: Frontend lead list manager (`app/(dashboard)/lists`) with member counts and batch actions.
  - `TASK-050`: Multi-channel AI outreach synthesizer (`GenerateOutreachDraftAction`) generating Email, WhatsApp, and LinkedIn copy.
  - `TASK-051`: Asynchronous `GenerateOutreachJob` and endpoints (`POST /api/v1/leads/{id}/outreach`).
  - `TASK-052`: Frontend slide-over `OutreachDrawer.tsx` with 1-click tab switching and copy-to-clipboard.
  - `TASK-053`: Asynchronous RFC 4180 CSV export engine (`ExportLeadsJob`) with S3 upload and signed download links.
  - `TASK-054`: Frontend `ExportModal.tsx` with field selection and download progress indicator.
  - `TASK-055`: Feature tests in `OutreachAndExportTest.php` passing 100% green.

* [x] **Phase 8: Usage Credit Engine & Razorpay Billing (TASK-056 to TASK-063):**
  - `TASK-056`: Migrations for `credit_balances`, `credit_reservations`, and `credit_transactions` (append-only ledger).
  - `TASK-057`: Atomic two-phase credit engine (`CreditEngineService`) with row-level locks preventing overdrafts.
  - `TASK-058`: Plans and subscriptions schema seeded with tier entitlements (Free, Starter, Growth, Pro, Agency).
  - `TASK-059`: `PaymentProviderInterface` and `RazorpayProvider` implementation.
  - `TASK-060`: `RazorpayWebhookController` with HMAC-SHA256 verification and idempotent processing.
  - `TASK-061`: Frontend billing hub (`app/(dashboard)/billing`), usage progress bar, plan cards, and checkout.
  - `TASK-062`: `EnsureSufficientCreditsMiddleware` guarding against zero-credit requests.
  - `TASK-063`: Concurrency and billing test suite `CreditEngineConcurrencyTest.php` passing 100% green.

* [x] **Phase 9: CRM Integrations & RiffCRM Direct Sync (TASK-064 to TASK-070):**
  - `TASK-064`: `CRMProviderInterface` abstraction and migrations for `integrations` and `integration_logs`.
  - `TASK-065`: `RiffCRMProvider` REST adapter with lead payload mapping and opportunity sync.
  - `TASK-066`: Asynchronous `SyncCRMLeadJob` with exponential retry backoff.
  - `TASK-067`: Integrations REST API (`/api/v1/integrations`) with AES-256 encrypted credentials at rest.
  - `TASK-068`: Frontend CRM integration hub (`app/(dashboard)/integrations`) and connection cards.
  - `TASK-069`: Single-click sync button with live status badges (`SYNCED`, `SYNCING`, `FAILED`).
  - `TASK-070`: Feature tests in `RiffCRMSyncTest.php` passing 100% green.

* [x] **Phase 10: Security Hardening, Observability & Production Deployment (TASK-071 to TASK-077):**
  - `TASK-071`: OWASP Top 10 security audit and penetration test suite (`SecurityAndPenetrationTest.php`, `docs/SECURITY_AUDIT.md`) asserting SSRF, IDOR, SQLi, and XSS mitigations.
  - `TASK-072`: Custom Monolog `JsonFormatter` with zero-secret leakage and `RequestCorrelationMiddleware` injecting `X-Request-ID`.
  - `TASK-073`: Sentry performance monitoring and distributed tracing configuration on Next.js and Laravel (`config/sentry.php`, `sentry.*.config.ts`, `HealthController.php`).
  - `TASK-074`: Automated PostgreSQL backup with GPG AES-256 encryption, SHA-256 checksums, and verified restore pipeline (`backup-postgres.sh`, `restore-postgres.sh`, `test-backup-restore.sh`).
  - `TASK-075`: Hardened production reverse proxy configs (`infrastructure/caddy/Caddyfile`, `infrastructure/nginx/nginx.conf`) with HTTP/3, TLS 1.3, CSP, HSTS, and rate limiting.
  - `TASK-076`: GitHub Actions CI/CD workflow pipelines (`frontend-ci.yml`, `backend-ci.yml`, `ci.yml`).
  - `TASK-077`: Production launch checklist (`docs/PRODUCTION_CHECKLIST.md`) and automated end-to-end smoke test suite (`infrastructure/scripts/smoke-test.sh` passing 13/13).

---

## 3. Current Task

**Status:** All 10 Phases (TASK-001 to TASK-077) Complete and Production Ready!
* **Platform Health:** 100% Test Pass Rate across 13 test suites.
* **Build State:** Next.js 15+ production bundle (15/15 pre-rendered routes), 0 type errors.
* **Security & Observability:** Hardened against OWASP Top 10, structured JSON logging, Sentry error tracking, GPG encrypted backups.

---

## 4. Known Constraints & Non-Negotiables

* **No Web Scraping:** All Google Maps discovery must strictly use official Google Places APIs.
* **No Direct LLM Scoring:** The LLM infers structured opportunities; a deterministic mathematical service calculates the 0–100 lead score.
* **Mandatory SSRF Defense:** Website crawler must execute DNS checks and reject loopback, RFC 1918, link-local, and cloud metadata IPs (`169.254.169.254`).
* **Database / Cache Isolation:** Ports 5432 (Postgres) and 6379 (Redis) must never be exposed publicly.
* **State Discipline:** Server state in TanStack Query; UI state in Zustand; zero cloning of server state into Zustand.
* **Design Compliance:** Dark cockpit theme, Signal Emerald accent, Geist typography; no Inter font or neon gradients.

---

## 5. Next Steps

1. **Deploy to Production Ubuntu Host:** Provision VPS, clone repo, configure `.env` secrets.
2. **Execute Database Migrations & Seeding:** Run `php artisan migrate --force && php artisan db:seed --class=PlanSeeder --force`.
3. **Start Reverse Proxy & Background Workers:** Launch Caddy and Supervisor/Horizon workers.
4. **Execute Go-Live Smoke Test:** Run `bash infrastructure/scripts/smoke-test.sh` against the live domain.

