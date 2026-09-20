# LeadMap AI — Master Engineering Task Roadmap

**Status:** Ready for Execution  
**Project:** LeadMap AI  
**Document:** `TASKS.md`  
**Execution Protocol:**
```text
TASK-XXX
   ↓
Implement (Code strictly following PRD, DESIGN, ARCHITECTURE, and RULES)
   ↓
Test (Unit / Integration / UI verification)
   ↓
Review (Pre-flight checklist & constraints audit)
   ↓
Mark Complete [x]
   ↓
Proceed to next sequential TASK
```

---

## Progress Overview

- [x] **Phase 1: Project Foundation & Monorepo Scaffold** (TASK-001 to TASK-007)
- [x] **Phase 2: Authentication & Workspace Multi-Tenancy** (TASK-008 to TASK-015)
- [ ] **Phase 3: Google Places Discovery & Map Experience** (TASK-016 to TASK-023)
- [ ] **Phase 4: Lead Database & Core Management Pipeline** (TASK-024 to TASK-031)
- [ ] **Phase 5: Website Analyzer & SSRF-Safe Crawler** (TASK-032 to TASK-039)
- [ ] **Phase 6: AI Opportunity Engine & Deterministic Lead Scoring** (TASK-040 to TASK-047)
- [ ] **Phase 7: Custom Lists, AI Outreach Drafting & CSV Export** (TASK-048 to TASK-055)
- [ ] **Phase 8: Usage Credit Engine & Razorpay Billing** (TASK-056 to TASK-063)
- [ ] **Phase 9: CRM Integrations & RiffCRM Direct Sync** (TASK-064 to TASK-070)
- [ ] **Phase 10: Security Hardening, Observability & Production Deployment** (TASK-071 to TASK-077)

---

## Phase 1: Project Foundation & Monorepo Scaffold

- [x] **TASK-001: Monorepo & Directory Blueprint Initialization**
  - **Description:** Set up project structure matching `docs/ARCHITECTURE.md` (`apps/web`, `apps/api`, `infrastructure`, `docs`).
  - **Deliverables:** Directory tree initialized, root `.gitignore`, and `docker-compose.yml` baseline.
  - **Verification:** Directory structure verified, root configs present.

- [x] **TASK-002: Docker Compose Environment Setup**
  - **Description:** Configure multi-container local stack for PostgreSQL 16, Redis 7, Next.js web app, and Laravel API.
  - **Deliverables:** `docker-compose.yml`, health checks, volume mounts, `.env.example`.
  - **Verification:** `docker compose up -d` boots PostgreSQL and Redis with successful health checks.

- [x] **TASK-003: Next.js Frontend Scaffold (`apps/web`)**
  - **Description:** Initialize Next.js 15+ App Router application with strict TypeScript.
  - **Deliverables:** `package.json`, `tsconfig.json`, `app/layout.tsx`, `app/page.tsx`.
  - **Verification:** `npm run dev` starts on port 3000; TypeScript compiles with zero errors.

- [x] **TASK-004: Design System & Styling Setup (`apps/web`)**
  - **Description:** Configure Tailwind CSS v4, inject `Geist Sans` and `Geist Mono` fonts, and set up the semantic palette defined in `docs/DESIGN.md` (Void Obsidian `#090A0D`, Slate Surface `#111318`, Signal Emerald `#10B981`).
  - **Deliverables:** `tailwind.config.ts`, `globals.css`, font declarations, base tokens.
  - **Verification:** Render sample test page; inspect CSS custom properties and font rendering.

- [x] **TASK-005: Base UI Primitives & Double-Bezel Component**
  - **Description:** Create foundational shadcn/ui primitives and the custom **Double-Bezel (Doppelrand)** card component + **Button-in-Button** CTA component.
  - **Deliverables:** `components/ui/button.tsx`, `components/ui/double-bezel-card.tsx`, `components/ui/badge.tsx`.
  - **Verification:** Component story/preview renders concentric nested borders and tactile click haptics.

- [x] **TASK-006: Laravel 11 API Backend Scaffold (`apps/api`)**
  - **Description:** Initialize Laravel 11 API with PHP 8.3+, strict typing, and PostgreSQL database configuration.
  - **Deliverables:** `composer.json`, `config/database.php`, `routes/api.php`, standardized JSON response macro.
  - **Verification:** `php artisan migrate:status` connects to PostgreSQL; `GET /api/v1/health` returns HTTP 200 JSON.

- [x] **TASK-007: Redis & Laravel Horizon Queue Configuration**
  - **Description:** Install and configure Laravel Horizon for managing Redis job queues.
  - **Deliverables:** `config/horizon.php`, queue definitions (`default`, `search`, `website-analysis`, `ai`, `integrations`).
  - **Verification:** `php artisan horizon` boots worker supervisors cleanly.

---

## Phase 2: Authentication & Workspace Multi-Tenancy

- [x] **TASK-008: User & Workspace Database Schema Migrations**
  - **Description:** Create PostgreSQL migrations for `users`, `workspaces`, and `workspace_members` with roles (`OWNER`, `ADMIN`, `MEMBER`, `VIEWER`).
  - **Deliverables:** Migration files, foreign key constraints, composite unique indexes (`workspace_id, user_id`).
  - **Verification:** `php artisan migrate` executes cleanly and rollback tested.

- [x] **TASK-009: Laravel Sanctum Authentication Setup**
  - **Description:** Configure Laravel Sanctum for stateful SPA session cookie authentication and Bearer API tokens.
  - **Deliverables:** Auth domain models, controllers, and FormRequest validators.
  - **Verification:** Pest tests assert registration, password hashing (Argon2id), login, and logout.

- [x] **TASK-010: Multi-Tenant Scope & Context Middleware**
  - **Description:** Implement `TenantIsolationMiddleware` to extract `X-Workspace-ID`, assert membership, and bind active workspace context to Eloquent queries.
  - **Deliverables:** `app/Http/Middleware/TenantIsolationMiddleware.php`, global tenant scope.
  - **Verification:** Test asserts cross-tenant read/write attempts are rejected with HTTP 403 Forbidden.

- [x] **TASK-011: Workspace RBAC Policies**
  - **Description:** Implement Laravel Authorization Policies (`WorkspacePolicy`) covering all roles.
  - **Deliverables:** `app/Policies/WorkspacePolicy.php`, policy registrations.
  - **Verification:** Unit tests confirm `VIEWER` cannot invite users or modify billing.

- [x] **TASK-012: Frontend Centralized API Client & Auth Provider**
  - **Description:** Build `apps/web/lib/api/client.ts` with CSRF handling, auth token interceptors, and `X-Workspace-ID` injection.
  - **Deliverables:** API client, React Auth context provider, session state hooks.
  - **Verification:** Client successfully attaches correlation IDs and handles 401 unauthenticated redirects.

- [x] **TASK-013: Frontend Authentication Pages**
  - **Description:** Build Login, Registration, and Forgot Password views conforming strictly to `docs/DESIGN.md`.
  - **Deliverables:** `app/(auth)/login/page.tsx`, `app/(auth)/register/page.tsx`, form validation with Zod.
  - **Verification:** User can register, log in, and be redirected to the dashboard shell.

- [x] **TASK-014: Dashboard App Shell & Floating Island Navigation**
  - **Description:** Build `app/(dashboard)/layout.tsx` featuring the detached floating glass pill navigation, workspace switcher, and live credit ticker.
  - **Deliverables:** Floating navigation component, workspace switcher dropdown, user avatar menu.
  - **Verification:** Layout displays seamlessly across desktop and mobile (< 768px).

- [x] **TASK-015: End-to-End Authentication & Tenancy Tests**
  - **Description:** Comprehensive integration tests validating user registration, workspace provisioning, and member switching.
  - **Deliverables:** Pest integration tests and Vitest UI test suite.
  - **Verification:** All tests pass green.

---

## Phase 3: Google Places Discovery & Map Experience

- [ ] **TASK-016: Google Places Domain Contract & Provider Implementation**
  - **Description:** Create `BusinessDiscoveryProvider` contract and `GooglePlacesProvider` calling official Google Places API (New).
  - **Deliverables:** `app/Domain/Business/Contracts/BusinessDiscoveryProvider.php`, provider implementation, error handling.
  - **Verification:** Mocked provider tests verify API query formatting and payload handling without web scraping.

- [ ] **TASK-017: Business Normalization & Deduplication Service**
  - **Description:** Normalize external Google Places payloads to canonical `BusinessDTO` and deduplicate against existing workspace records using `google_place_id`.
  - **Deliverables:** `BusinessNormalizerService.php`, `businesses` and `searches` database tables.
  - **Verification:** Assert duplicate places are flagged with `is_saved` badge.

- [ ] **TASK-018: Asynchronous Search Queue Job (`DiscoverBusinessesJob`)**
  - **Description:** Implement background job to execute discovery queries, enforce rate limits, and deduct search credits.
  - **Deliverables:** `app/Jobs/DiscoverBusinessesJob.php`, Horizon queue routing.
  - **Verification:** Job dispatches, executes, persists results, and updates search status.

- [ ] **TASK-019: Search API Endpoints (`/api/v1/searches`)**
  - **Description:** Create REST endpoints to initiate a discovery search and poll/stream paginated results.
  - **Deliverables:** `SearchController.php`, FormRequest validation (category, city, radius 1–50km), API Resource.
  - **Verification:** Endpoint returns HTTP 201 with search ID and paginated results on completion.

- [ ] **TASK-020: Frontend Mapbox / Map Canvas Component**
  - **Description:** Implement interactive dark-mode map container with custom Signal Emerald pins and clustering.
  - **Deliverables:** `features/finder/MapCanvas.tsx`, cluster marker logic, viewport sync hooks.
  - **Verification:** Map renders dark vector tiles, clusters pins at low zoom, and expands on click.

- [ ] **TASK-021: Split-Cockpit Search Interface (`app/(dashboard)/finder`)**
  - **Description:** Implement the 50/50 desktop split layout: scrollable results feed on the left, full-bleed map on the right.
  - **Deliverables:** `app/(dashboard)/finder/page.tsx`, search filter bar (radius slider, rating thresholds).
  - **Verification:** Responsive collapse to single column below 768px with map toggle tab.

- [ ] **TASK-022: Synchronized Map/List Selection & Result Card**
  - **Description:** Implement Double-Bezel result card displaying 4-tier data provenance badges, ratings, and click-to-center map synchronization.
  - **Deliverables:** `features/finder/BusinessResultCard.tsx`, popover summary card.
  - **Verification:** Clicking a card scrolls and highlights the map marker; clicking a map marker highlights the card.

- [ ] **TASK-023: Search & Places Integration Tests**
  - **Description:** Comprehensive tests asserting search validation, deduplication logic, and provider failure handling.
  - **Deliverables:** Pest integration tests with mocked Google responses.
  - **Verification:** All tests pass green.

---

## Phase 4: Lead Database & Core Management Pipeline

- [ ] **TASK-024: Lead & Pipeline Database Schema Migrations**
  - **Description:** Create PostgreSQL tables for `leads`, `lead_scores`, `lead_notes`, `tags`, and `lead_tags`.
  - **Deliverables:** Migration files, indexes on `(workspace_id, status)`, `(workspace_id, lead_score)`.
  - **Verification:** Migrations run and rollback cleanly.

- [ ] **TASK-025: Lead State Machine & Lifecycle Actions**
  - **Description:** Implement lead status state machine (`NEW`, `RESEARCHED`, `CONTACTED`, `REPLIED`, `QUALIFIED`, `MEETING`, `WON`, `LOST`) with valid transition rules.
  - **Deliverables:** `LeadStatusEnum.php`, `SaveBusinessAsLeadAction.php`, `UpdateLeadStatusAction.php`.
  - **Verification:** Unit tests assert invalid transitions (e.g., `NEW` -> `WON` direct jump) are rejected.

- [ ] **TASK-026: Lead Notes & Tagging Service**
  - **Description:** Provide domain actions for appending timestamped notes and custom color tags to leads.
  - **Deliverables:** `AddLeadNoteAction.php`, `TagLeadAction.php`, API endpoints.
  - **Verification:** Assert user notes and tags persist and return in chronological order.

- [ ] **TASK-027: Lead Management REST API (`/api/v1/leads`)**
  - **Description:** Implement CRUD endpoints for listing leads with filters, viewing lead dossiers, updating statuses, and archiving leads.
  - **Deliverables:** `LeadController.php`, pagination support (`page`, `per_page`), sorting by score/date.
  - **Verification:** Querying `/api/v1/leads` filters accurately by score, status, and tag.

- [ ] **TASK-028: Frontend Leads Management Table View (`app/(dashboard)/leads`)**
  - **Description:** Build the leads management table with quick status dropdowns, score indicators, tag chips, and search input.
  - **Deliverables:** `features/leads/LeadsTable.tsx`, filter controls, bulk selection checkboxes.
  - **Verification:** Table renders empty state when zero leads exist; shows skeletal loader while fetching.

- [ ] **TASK-029: Frontend Lead Profile & Diagnostic Dossier (`app/(dashboard)/leads/[id]`)**
  - **Description:** Build the comprehensive lead profile view displaying business header, quick-dial contact pills, and pipeline progression.
  - **Deliverables:** `app/(dashboard)/leads/[id]/page.tsx`, `LeadHeader.tsx`, `StatusTimeline.tsx`.
  - **Verification:** Lead profile accurately loads and displays all saved business attributes.

- [ ] **TASK-030: Lead Assignment & Collaboration (V2/V3 Prep)**
  - **Description:** Add ability to assign leads to specific workspace members.
  - **Deliverables:** `assigned_to_user_id` assignment action and UI selector.
  - **Verification:** User assignment updates and permissions are enforced.

- [ ] **TASK-031: Lead Pipeline & State Machine Tests**
  - **Description:** Automated Pest test suite for lead creation, status lifecycle transitions, and multi-tenant scoping.
  - **Deliverables:** `tests/Feature/LeadPipelineTest.php`.
  - **Verification:** 100% of pipeline tests pass.

---

## Phase 5: Website Analyzer & SSRF-Safe Crawler

- [ ] **TASK-032: Database Schema for Website Analyses**
  - **Description:** Create PostgreSQL migration for `website_analyses` storing HTTP status, load latency, SSL status, and raw JSONB DOM signals.
  - **Deliverables:** Migration file, foreign keys to `leads`.
  - **Verification:** Migration executed and verified.

- [ ] **TASK-033: Multi-Layer SSRF Defense Validator**
  - **Description:** Implement strict pre-flight security validator blocking loopback (`127.0.0.1`), RFC 1918 private IPs, AWS/cloud metadata (`169.254.169.254`), and non-HTTP protocols.
  - **Deliverables:** `app/Domain/WebsiteAnalysis/Services/SsrfProtectionService.php`.
  - **Verification:** Unit tests confirm private, loopback, and metadata IPs are aggressively blocked.

- [ ] **TASK-034: Safe HTTP Fetcher & DOM Harvester**
  - **Description:** Implement resilient HTTP client enforcing 10s timeouts, max 5MB payload, max 3 redirects, and custom User-Agent.
  - **Deliverables:** `SafeWebsiteFetcher.php`, DOM parsing pipeline.
  - **Verification:** Fetcher aborts oversized pages and handles 4xx/5xx responses gracefully.

- [ ] **TASK-035: Technical & SEO Signal Extraction Harvester**
  - **Description:** Parse HTML DOM for SSL, mobile viewport `<meta>`, title tag, meta description, heading hierarchy (H1/H2), and JSON-LD schema.
  - **Deliverables:** `TechnicalSignalExtractor.php`, `SeoSignalExtractor.php`.
  - **Verification:** Test against realistic HTML fixtures; assert signals are extracted with 100% accuracy.

- [ ] **TASK-036: Conversion Deficit & Technology Detector**
  - **Description:** Inspect DOM for primary CTA buttons, contact forms, click-to-call links, WhatsApp chat widgets, booking embeds (Calendly, etc.), and CMS signatures.
  - **Deliverables:** `ConversionSignalExtractor.php`, heuristic CMS detector.
  - **Verification:** Test fixtures with and without booking widgets verify correct signal detection.

- [ ] **TASK-037: Asynchronous Crawler Queue Job (`AnalyzeWebsiteJob`)**
  - **Description:** Encapsulate website crawling inside a Redis-backed queue worker with credit refund on permanent failure.
  - **Deliverables:** `app/Jobs/AnalyzeWebsiteJob.php`, Horizon queue configuration.
  - **Verification:** Job runs asynchronously, updates analysis record, and notifies client.

- [ ] **TASK-038: Frontend Website Diagnostic Audit Panel**
  - **Description:** Build the 4-panel diagnostic grid in `app/(dashboard)/leads/[id]` displaying Technical, SEO, Conversion, and Technology findings with provenance badges.
  - **Deliverables:** `features/analysis/TechnicalAuditGrid.tsx`, `SignalIndicatorRow.tsx`.
  - **Verification:** Audit grid renders findings with color-coded badges (Green = Verified, Amber = Warning, Rose = Deficit).

- [ ] **TASK-039: Website Analyzer & SSRF Security Tests**
  - **Description:** Comprehensive Pest security test suite testing DNS rebinding, redirect loops, and malformed HTML handling.
  - **Deliverables:** `tests/Feature/WebsiteAnalyzerSecurityTest.php`.
  - **Verification:** All security and crawler tests pass green.

---

## Phase 6: AI Opportunity Engine & Deterministic Lead Scoring

- [ ] **TASK-040: Database Schema for AI Opportunities & Scores**
  - **Description:** Create PostgreSQL migrations for `ai_analyses`, `ai_opportunities`, and `lead_scores`.
  - **Deliverables:** Migration files, foreign keys, index on `(lead_id, category)`.
  - **Verification:** Schema migrated and verified.

- [ ] **TASK-041: AI Provider Abstraction & Prompt Orchestrator**
  - **Description:** Implement `AIProviderInterface` and `OpenAIProvider` with prompt versioning and token/cost tracking.
  - **Deliverables:** `AIProviderInterface.php`, `OpenAIProvider.php`, versioned prompt templates.
  - **Verification:** Mock tests verify structured JSON prompt creation without leaking credentials.

- [ ] **TASK-042: Strict JSON Schema Output Validation**
  - **Description:** Enforce strict schema validation on LLM output to guarantee valid opportunity categories, evidence quotes, and confidence levels.
  - **Deliverables:** `AIOpportunitySchemaValidator.php`, schema retry logic.
  - **Verification:** Tests assert malformed JSON is rejected or retried automatically.

- [ ] **TASK-043: Deterministic Mathematical Lead Scoring Engine**
  - **Description:** Implement deterministic scoring engine calculating the 0–100 score across 7 dimensions (Service Fit, Website, Conversion, SEO, Contactability, Activity, Other).
  - **Deliverables:** `app/Domain/Lead/Services/DeterministicLeadScoringService.php`.
  - **Verification:** Unit tests assert identical input signals always produce identical scores and exact waterfall line-items.

- [ ] **TASK-044: Asynchronous AI Opportunity Job (`AnalyzeLeadJob`)**
  - **Description:** Worker job ingesting structured crawler signals, calling LLM, validating schema, invoking the deterministic scorer, and updating lead status to `RESEARCHED`.
  - **Deliverables:** `app/Jobs/AnalyzeLeadJob.php`.
  - **Verification:** End-to-end execution from raw signals to persisted opportunities and calculated score.

- [ ] **TASK-045: Frontend Radial Lead Score Meter & Waterfall Breakdown**
  - **Description:** Build circular SVG radial score gauge (0–100) rendered in `Geist Mono` with collapsible mathematical point contribution waterfall.
  - **Deliverables:** `features/leads/LeadScoreGauge.tsx`, `ScoreWaterfallBreakdown.tsx`.
  - **Verification:** Gauge animates smoothly and displays each dimension's awarded points.

- [ ] **TASK-046: Frontend Structured AI Opportunity Cards**
  - **Description:** Build opportunity cards displaying Category Pill, Title, Evidence Quote, Suggested Service, and Confidence badge.
  - **Deliverables:** `features/leads/OpportunityCard.tsx`.
  - **Verification:** UI renders opportunities with clear distinction between observed evidence and AI inference.

- [ ] **TASK-047: AI Engine & Scoring Verification Tests**
  - **Description:** Full test suite verifying deterministic scoring consistency, prompt versioning, and opportunity model associations.
  - **Deliverables:** `tests/Unit/DeterministicLeadScoringTest.php`.
  - **Verification:** 100% test pass rate.

---

## Phase 7: Custom Lists, AI Outreach Drafting & CSV Export

- [ ] **TASK-048: Custom Lead Lists Database Schema & API**
  - **Description:** Create migrations for `lead_lists` and `lead_list_items` + CRUD REST endpoints (`/api/v1/lists`).
  - **Deliverables:** Migration files, `LeadListController.php`, add/remove lead actions.
  - **Verification:** Users can create custom collections and assign leads in bulk.

- [ ] **TASK-049: Frontend Lead Lists Management (`app/(dashboard)/lists`)**
  - **Description:** Build list management interface with list cards, lead counts, and batch actions (export list, delete list).
  - **Deliverables:** `app/(dashboard)/lists/page.tsx`, `features/lists/ListDrawer.tsx`.
  - **Verification:** Lists display real-time member counts and responsive organization.

- [ ] **TASK-050: Multi-Channel AI Outreach Synthesizer Service**
  - **Description:** Implement domain service drafting contextualized outreach across Email (Subject + 3-paragraph value prop), WhatsApp (max 400 chars), and LinkedIn InMail based on observed opportunities.
  - **Deliverables:** `GenerateOutreachDraftAction.php`, channel prompt templates.
  - **Verification:** Generated drafts accurately cite verified business ratings and detected deficits without hallucinations.

- [ ] **TASK-051: Asynchronous Outreach Job (`GenerateOutreachJob`)**
  - **Description:** Background queue job to generate multi-channel message drafts and store in `ai_outreach_drafts`.
  - **Deliverables:** `app/Jobs/GenerateOutreachJob.php`, API endpoints (`POST /api/v1/leads/{id}/outreach`).
  - **Verification:** Job runs, deducts 1 credit, and returns draft models.

- [ ] **TASK-052: Frontend AI Outreach Drawer Component**
  - **Description:** Slide-over drawer offering 1-click tab switching between Email, WhatsApp, and LinkedIn drafts with "Copy to Clipboard" and "Edit" capabilities.
  - **Deliverables:** `features/outreach/OutreachDrawer.tsx`, `ChannelDraftTab.tsx`.
  - **Verification:** Copy button copies formatted message and displays tactile checkmark toast.

- [ ] **TASK-053: Asynchronous CSV Export Engine (`ExportLeadsJob`)**
  - **Description:** Background job compiling filtered leads, calculated scores, contact details, and opportunity summaries into CSV, uploading to S3, and issuing signed download links.
  - **Deliverables:** `app/Jobs/ExportLeadsJob.php`, S3 upload integration.
  - **Verification:** Generates compliant RFC 4180 CSV with correct column headers and verified encoding.

- [ ] **TASK-054: Frontend Export Modal & Download Triggers**
  - **Description:** Build CSV export confirmation modal with field selector and asynchronous download progress indicator.
  - **Deliverables:** `features/leads/ExportModal.tsx`.
  - **Verification:** Initiating export triggers background job and delivers download link upon completion.

- [ ] **TASK-055: Lists, Outreach & Export Integration Tests**
  - **Description:** Test suite validating list operations, outreach draft generation, and CSV formatting.
  - **Deliverables:** `tests/Feature/OutreachAndExportTest.php`.
  - **Verification:** All tests pass green.

---

## Phase 8: Usage Credit Engine & Razorpay Billing

- [ ] **TASK-056: Credit Ledger & Balances Database Schema**
  - **Description:** Create PostgreSQL tables for `credit_balances`, `credit_reservations`, and `credit_transactions` (append-only ledger).
  - **Deliverables:** Migration files, database constraints ensuring balances never drop below zero.
  - **Verification:** Schema migrated and verified.

- [ ] **TASK-057: Atomic Two-Phase Credit Engine Service**
  - **Description:** Implement atomic credit reservation (`reserve`), consumption (`commit`), and refund (`release`) pattern with row-level locks (`SELECT FOR UPDATE`).
  - **Deliverables:** `app/Domain/Usage/Services/CreditEngineService.php`.
  - **Verification:** Concurrency tests assert race conditions cannot overdraft workspace credits.

- [ ] **TASK-058: Plans & Subscriptions Database Schema**
  - **Description:** Create migrations for `plans` (Free, Starter, Growth, Pro, Agency) and `subscriptions`.
  - **Deliverables:** Migration files, seeders for tier entitlements.
  - **Verification:** Plans table seeded with credit quotas and feature entitlements.

- [ ] **TASK-059: Razorpay Subscription Provider Implementation**
  - **Description:** Implement `PaymentProviderInterface` and `RazorpayProvider` integrating subscription checkout and plan switching.
  - **Deliverables:** `PaymentProviderInterface.php`, `RazorpayProvider.php`.
  - **Verification:** Mocked provider tests verify payload creation and customer subscription links.

- [ ] **TASK-060: Razorpay Webhook Controller & HMAC Verification**
  - **Description:** Build webhook handler verifying HMAC-SHA256 signatures, checking idempotency, and processing subscription lifecycle events (`subscription.activated`, `charged`, `halted`).
  - **Deliverables:** `RazorpayWebhookController.php`, `ProcessSubscriptionWebhookJob.php`.
  - **Verification:** Signature verification rejects forged requests; valid events allocate monthly credits.

- [ ] **TASK-061: Frontend Billing & Subscription Management (`app/(dashboard)/billing`)**
  - **Description:** Build billing hub displaying live credit balance, monthly usage progress bar, plan cards, and Razorpay checkout button.
  - **Deliverables:** `app/(dashboard)/billing/page.tsx`, `CreditUsageBar.tsx`, `PlanCard.tsx`.
  - **Verification:** Page accurately renders credit ledger history and plan upgrade triggers.

- [ ] **TASK-062: Credit Guard Middleware & UI Blocking**
  - **Description:** Middleware enforcing positive credit balance before executing searches or analysis jobs, presenting upgrade modal when balance is 0.
  - **Deliverables:** `EnsureSufficientCreditsMiddleware.php`, UI credit top-up modal.
  - **Verification:** Zero-credit workspaces are cleanly blocked with actionable top-up prompts.

- [ ] **TASK-063: Billing & Credit Concurrency Tests**
  - **Description:** Comprehensive Pest test suite testing multi-threaded credit reservations, webhook idempotency, and subscription renewals.
  - **Deliverables:** `tests/Feature/CreditEngineConcurrencyTest.php`.
  - **Verification:** All tests pass cleanly.

---

## Phase 9: CRM Integrations & RiffCRM Direct Sync

- [ ] **TASK-064: CRM Provider Interface & Integration Registry**
  - **Description:** Define `CRMProviderInterface` and database schema for `integrations` and `integration_logs`.
  - **Deliverables:** `CRMProviderInterface.php`, migration files.
  - **Verification:** Domain models compile with zero hard dependencies on specific CRM vendors.

- [ ] **TASK-065: RiffCRM REST Adapter Implementation**
  - **Description:** Build `RiffCRMProvider` implementing company/contact creation, lead score syncing, and opportunity tag synchronization via RiffCRM REST API.
  - **Deliverables:** `app/Domain/Integration/Providers/RiffCRMProvider.php`.
  - **Verification:** Mocked HTTP tests confirm correct payload mapping (LeadMap Name -> RiffCRM Company, Score -> Custom Field).

- [ ] **TASK-066: Asynchronous CRM Lead Synchronization Job (`SyncCRMLeadJob`)**
  - **Description:** Implement background worker with exponential backoff (15s, 60s, 300s) to transmit leads to RiffCRM and record external IDs.
  - **Deliverables:** `app/Jobs/SyncCRMLeadJob.php`.
  - **Verification:** Job retries on 429/500 errors and updates sync badge to `SYNCED` or `SYNC_FAILED`.

- [ ] **TASK-067: CRM Integration REST API (`/api/v1/integrations`)**
  - **Description:** Endpoints to connect RiffCRM credentials, test connectivity, trigger manual lead sync, and review sync audit logs.
  - **Deliverables:** `IntegrationController.php`, credential encryption at rest.
  - **Verification:** Credentials store AES-256 encrypted; test connection endpoint returns status.

- [ ] **TASK-068: Frontend CRM Integration Settings & RiffCRM Card**
  - **Description:** Build integrations hub in `app/(dashboard)/integrations` with RiffCRM connection card, status indicator, and API key input.
  - **Deliverables:** `app/(dashboard)/integrations/page.tsx`, `RiffCRMCard.tsx`.
  - **Verification:** User can enter RiffCRM credentials and view live connection health badge.

- [ ] **TASK-069: Frontend Single-Click Sync Trigger & Status Badges**
  - **Description:** Add "Sync to RiffCRM" button on Lead Dossier and table rows with live sync state badges (`NOT_SYNCED`, `SYNCING`, `SYNCED`, `FAILED`).
  - **Deliverables:** `SyncToCRMButton.tsx`, `SyncStatusBadge.tsx`.
  - **Verification:** Clicking sync shows loading state and transitions to green `SYNCED` badge with external CRM link.

- [ ] **TASK-070: RiffCRM Integration Test Suite**
  - **Description:** Integration tests verifying sync payloads, credential encryption, failure retries, and decoupled isolation.
  - **Deliverables:** `tests/Feature/RiffCRMSyncTest.php`.
  - **Verification:** All tests pass green.

---

## Phase 10: Security Hardening, Observability & Production Deployment

- [ ] **TASK-071: Comprehensive Security Audit & Penetration Testing**
  - **Description:** Audit application against OWASP Top 10: SSRF crawler penetration test, IDOR/BOLA multi-tenant assertions, SQL injection, and XSS sanitization.
  - **Deliverables:** Security audit log, patched findings.
  - **Verification:** Automated security test suite runs with zero vulnerabilities.

- [ ] **TASK-072: Structured JSON Logging & Request Correlation**
  - **Description:** Implement structured JSON logging injecting `X-Request-ID`, `workspace_id`, and `user_id` across all HTTP requests and Horizon queue jobs.
  - **Deliverables:** Custom Monolog JSON formatter, request correlation middleware.
  - **Verification:** Logs output structured JSON with zero secret leakage.

- [ ] **TASK-073: Sentry Performance & Error Tracking Integration**
  - **Description:** Connect Sentry SDK on Next.js frontend and Laravel backend with error grouping and performance tracing.
  - **Deliverables:** `sentry.client.config.ts`, `config/sentry.php`.
  - **Verification:** Trigger test exceptions; assert captured in Sentry dashboard with full stack context.

- [ ] **TASK-074: Database Automated Backup & Verified Restore Scripts**
  - **Description:** Write automated bash scripts for nightly `pg_dump`, GPG encryption, offsite S3 push, and automated verification restore testing.
  - **Deliverables:** `infrastructure/scripts/backup-postgres.sh`, `restore-postgres.sh`.
  - **Verification:** Script runs, creates encrypted backup, and restores into clean container successfully.

- [ ] **TASK-075: Production Reverse Proxy & Caddy / Nginx Configuration**
  - **Description:** Configure Caddy / Nginx reverse proxy with HTTP/3, TLS termination, HSTS headers, and rate limiting behind Cloudflare.
  - **Deliverables:** `infrastructure/caddy/Caddyfile` or `nginx.conf`.
  - **Verification:** Reverse proxy correctly routes traffic to Next.js and Laravel while blocking public access to DB/Redis ports.

- [ ] **TASK-076: CI/CD GitHub Actions Workflow Pipelines**
  - **Description:** Configure GitHub Actions running linting (Pint, ESLint), typechecking (TypeScript, PHPStan), Pest test suites, and Docker image builds.
  - **Deliverables:** `.github/workflows/frontend-ci.yml`, `.github/workflows/backend-ci.yml`.
  - **Verification:** Push to repository triggers CI; all test stages pass green.

- [ ] **TASK-077: Production Go-Live & Verification Smoke Tests**
  - **Description:** Deploy complete stack to Ubuntu production VPS, run database migrations, start Horizon supervisors, and execute end-to-end smoke tests.
  - **Deliverables:** Deployment checklist sign-off, live URL health verification.
  - **Verification:** Successful execution of the full user journey (Search -> Discover -> Analyze -> Score -> Outreach -> CRM Sync) on production.
