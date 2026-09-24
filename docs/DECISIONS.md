# LeadMap AI — Architectural Decision Records (ADRs)

**Document:** `docs/DECISIONS.md`  
**Status:** Active & Enforced  
**Purpose:** Permanent record of architectural, technical, and engineering decisions. These decisions are binding for all developers, pair programmers, and AI coding agents to prevent accidental refactoring or drift from core principles.

---

## ADR Index

* [ADR-001: Modular Monolith + Asynchronous Workers over Microservices](#adr-001-modular-monolith--asynchronous-workers-over-microservices)
* [ADR-002: Next.js (App Router) + Laravel 11 REST API Decoupled Architecture](#adr-002-nextjs-app-router--laravel-11-rest-api-decoupled-architecture)
* [ADR-003: PostgreSQL 16 with Native JSONB as the Unified Relational Store](#adr-003-postgresql-16-with-native-jsonb-as-the-unified-relational-store)
* [ADR-004: Redis 7 + Laravel Horizon for Dedicated Queue Isolation](#adr-004-redis-7--laravel-horizon-for-dedicated-queue-isolation)
* [ADR-005: Deterministic Mathematical Lead Scoring over Direct LLM Authorship](#adr-005-deterministic-mathematical-lead-scoring-over-direct-llm-authorship)
* [ADR-006: Strict Vendor-Agnostic Provider Abstraction Layer](#adr-006-strict-vendor-agnostic-provider-abstraction-layer)
* [ADR-007: Official Google Places API (New) with Absolute Ban on Web Scraping](#adr-007-official-google-places-api-new-with-absolute-ban-on-web-scraping)
* [ADR-008: Multi-Layer SSRF Defense Pipeline for Website Crawler](#adr-008-multi-layer-ssrf-defense-pipeline-for-website-crawler)
* [ADR-009: Strict Separation of Server State (TanStack Query) and Client UI State (Zustand)](#adr-009-strict-separation-of-server-state-tanstack-query-and-client-ui-state-zustand)
* [ADR-010: Atomic Two-Phase Credit Engine (`Reserve` / `Commit` / `Release`)](#adr-010-atomic-two-phase-credit-engine-reserve--commit--release)
* [ADR-011: Complete Asynchronous Decoupling for RiffCRM and Third-Party CRMs](#adr-011-complete-asynchronous-decoupling-for-riffcrm-and-third-party-crms)
* [ADR-012: Strict Design System Compliance with DESIGN.md Standards](#adr-012-strict-design-system-compliance-with-designmd-standards)

---

## ADR-001: Modular Monolith + Asynchronous Workers over Microservices

### Status
Accepted & Enforced

### Decision
Structure the LeadMap AI backend as a **Domain-Driven Modular Monolith** (`apps/api`) supported by **Redis-backed Asynchronous Queue Workers** (`Laravel Horizon`). Do not use microservices.

### Context
Distributed microservice architectures introduce premature network serialization, distributed transaction complexity (Saga / 2PC), multi-repo synchronization friction, and complex Kubernetes operations that slow initial velocity.

### Consequences
* **Positive:** High developer velocity, single database transaction boundaries, simple local Docker setup, zero distributed tracing overhead.
* **Discipline Required:** Domain boundaries within `app/Domain/` must be strictly respected (no cross-domain spaghetti calls; communicate via DTOs and Actions).
* **Future Evolution:** If a domain (e.g., website crawling) outgrows the monolith, its clean boundary permits extracting it into a separate worker container without changing domain logic.

---

## ADR-002: Next.js (App Router) + Laravel 11 REST API Decoupled Architecture

### Status
Accepted & Enforced

### Decision
Deploy Next.js 15+ (`apps/web`) as a dedicated frontend application and Laravel 11 (`apps/api`) as a standalone REST API server (`/api/v1/`), communicating over HTTP/JSON.

### Context
LeadMap AI requires:
1. Fast SSR landing pages and SEO-friendly marketing views.
2. An interactive, client-side split cockpit (Mapbox canvas + live result streams).
3. A future public developer API and external webhook consumers.

### Consequences
* **Positive:** Clear separation of concerns; frontend engineers focus on React 19/Tailwind/TypeScript, backend engineers focus on PHP 8.3/Eloquent/Horizon. Independent deployment pipelines.
* **Trade-off:** Requires explicit CORS configuration and CSRF cookie negotiation via Laravel Sanctum for the SPA.

---

## ADR-003: PostgreSQL 16 with Native JSONB as the Unified Relational Store

### Status
Accepted & Enforced

### Decision
Use PostgreSQL 16 as the single source of truth for both relational entity relationships and semi-structured technical audit payloads (via `JSONB` fields).

### Context
LeadMap AI stores rigid relational data (Users, Workspaces, Members, Leads, Credit Transactions) alongside dynamic, semi-structured inspection data (DOM signals, schema tags, AI opportunity metadata).

### Consequences
* **Positive:** Eliminates the operational complexity and synchronization overhead of running a secondary NoSQL database (e.g., MongoDB). PostgreSQL handles GIN-indexed JSONB queries with sub-millisecond latency.
* **Constraint:** Developers must define clear TypeScript and PHP DTO schemas for JSONB structures to avoid data drift.

---

## ADR-004: Redis 7 + Laravel Horizon for Dedicated Queue Isolation

### Status
Accepted & Enforced

### Decision
Deploy Redis 7 managed by Laravel Horizon with logically segregated worker queues: `search`, `website-analysis`, `ai`, `integrations`, and `exports`.

### Context
Long-running operations (crawling websites, calling LLMs, compiling 10,000-row CSVs) take 5–120 seconds. If run in the default HTTP queue, they choke rapid operations (like sending password reset emails).

### Consequences
* **Positive:** Dedicated concurrency allocations per queue. Slow crawling jobs never block transactional notifications or search queries.
* **Monitoring:** Real-time visibility into throughput, latency, and failed jobs via the Horizon dashboard.

---

## ADR-005: Deterministic Mathematical Lead Scoring over Direct LLM Authorship

### Status
Accepted & Enforced

### Decision
The Large Language Model (LLM) must **NEVER** directly output the final Lead Score. The LLM's role is strictly confined to inferring structured opportunity categories with evidence. The final Lead Score (0–100) is computed by a **deterministic mathematical scoring service**.

### Context
LLMs hallucinate, produce inconsistent numeric scores across runs for identical inputs, and cannot provide an auditable mathematical breakdown to sales users.

### Consequences
* **Positive:** 100% explainable scoring waterfall (e.g., `+18 Mobile, +15 Booking, +10 Fit = 86/100`). Algorithmic weights can be tuned instantly without costly prompt re-evaluations.
* **Integrity:** Sales users can trust the score because every point maps to verified evidence.

---

## ADR-006: Strict Vendor-Agnostic Provider Abstraction Layer

### Status
Accepted & Enforced

### Decision
All third-party services must be accessed through domain contracts/interfaces:
* `BusinessDiscoveryProvider` (Google Places API)
* `AIProviderInterface` (OpenAI / Anthropic)
* `PaymentProviderInterface` (Razorpay)
* `CRMProviderInterface` (RiffCRM)

### Context
Third-party vendor APIs undergo breaking schema changes, pricing shifts, and outages. Direct coupling inside domain controllers creates vendor lock-in.

### Consequences
* **Positive:** Providers can be mocked instantly during unit tests with zero network calls. We can swap or add providers (e.g., Anthropic Claude, Stripe, HubSpot) without touching business logic.
* **Requirement:** Concrete provider adapters must normalize third-party payloads into canonical internal DTOs.

---

## ADR-007: Official Google Places API (New) with Absolute Ban on Web Scraping

### Status
Accepted & Enforced

### Decision
All geographic business discovery must use official Google Maps Platform APIs (Places API New). HTML scraping, headless browser automation to bypass bot protections, CAPTCHA solvers, and undocumented endpoints are **strictly prohibited**.

### Context
Scraping Google Maps violates Google Terms of Service, introduces extreme legal liability, breaks unpredictably upon DOM changes, and risks IP blacklisting.

### Consequences
* **Positive:** Guaranteed uptime, clean structured data, legal and enterprise compliance, predictable quota scaling.
* **Requirement:** Must adhere to Google Places caching terms (e.g., caching Place IDs indefinitely; refreshing temporary attributes within 30 days).

---

## ADR-008: Multi-Layer SSRF Defense Pipeline for Website Crawler

### Status
Accepted & Enforced

### Decision
The Website Analyzer crawler must enforce a mandatory pre-flight security check on every target URL before opening any network socket:
1. Resolve hostname via DNS.
2. Reject loopback (`127.0.0.1`, `::1`).
3. Reject RFC 1918 private IP subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`).
4. Reject link-local and cloud metadata endpoints (`169.254.169.254`, `metadata.google.internal`).
5. Restrict protocols to `http://` and `https://` only.
6. Re-evaluate SSRF rules on every HTTP redirect (max 3 redirects).

### Context
Crawling arbitrary user-submitted URLs exposes backend workers to Server-Side Request Forgery (SSRF), potentially allowing attackers to read cloud metadata or query internal Redis/PostgreSQL instances.

### Consequences
* **Positive:** Hardened, enterprise-grade crawler security.
* **Performance:** Minor DNS resolution latency overhead, easily mitigated by short-term DNS caching.

---

## ADR-009: Strict Separation of Server State (TanStack Query) and Client UI State (Zustand)

### Status
Accepted & Enforced

### Decision
All data originating from `/api/v1/` must be managed exclusively by **TanStack Query**. **Zustand** is strictly reserved for ephemeral client-side UI states (map pan coordinates, active filter sliders, drawer toggles). Server state must **never** be cloned into Zustand.

### Context
Cloning server response data into global client stores creates cache invalidation bugs, stale UI synchronization issues, and redundant memory consumption.

### Consequences
* **Positive:** Automatic background refetching, declarative loading/error states, optimistic UI mutations, and zero cache desynchronization.
* **Clarity:** Developers always know where a piece of state belongs: if it came from the API, it's TanStack Query; if it's UI state, it's Zustand.

---

## ADR-010: Atomic Two-Phase Credit Engine (`Reserve` / `Commit` / `Release`)

### Status
Accepted & Enforced

### Decision
Credit operations must use an atomic two-phase hold pattern backed by database row-level locking (`SELECT FOR UPDATE`):
1. **Reserve:** Place hold on required credits and issue a reservation token before dispatching queue jobs.
2. **Commit:** Deduct reserved credits upon successful job completion.
3. **Release:** Refund unconsumed credits to the workspace balance if a job fails permanently.

### Context
Concurrent bulk requests from multiple workspace users can cause race conditions, resulting in negative credit balances and service abuse.

### Consequences
* **Positive:** Mathematically impossible to overspend credits or lose credits on system crashes.
* **Auditability:** Complete append-only transaction ledger in `credit_transactions`.

---

## ADR-011: Complete Asynchronous Decoupling for RiffCRM and Third-Party CRMs

### Status
Accepted & Enforced

### Decision
RiffCRM is integrated strictly as an asynchronous optional provider via `SyncCRMLeadJob`. LeadMap AI core discovery, analysis, scoring, and pipeline features must have zero runtime dependency on RiffCRM availability.

### Context
External CRM APIs can suffer latency spikes, maintenance windows, or rate limit throttling. Direct synchronous calls would degrade user experience and cause API timeouts.

### Consequences
* **Positive:** LeadMap AI remains 100% operational even if RiffCRM is offline. Sync failures are cleanly logged with automatic exponential retries.
* **Decoupled Architecture:** RiffCRM credentials and settings are isolated in the `integrations` domain.

---

## ADR-012: Strict Design System Compliance with DESIGN.md Standards

### Status
Accepted & Enforced

### Decision
All frontend interfaces must adhere strictly to the design directives in `docs/DESIGN.md`:
* **Palette:** Void Obsidian (`#090A0D`), Slate Surface (`#111318`), Signal Emerald (`#10B981`).
* **Typography:** `Geist Sans` for headings/UI; `Geist Mono` for numbers, scores, and metrics.
* **Component Haptics:** Double-Bezel (Doppelrand) cards and Button-in-Button CTAs.
* **Anti-Patterns Banned:** Inter font, pure black `#000000`, AI-purple neon glows, centered hero layouts, generic 3-column equal cards, and circular spinners.

### Context
Prevents AI coding agents and developers from producing generic, uncalibrated UI templates ("AI slop") and ensures a cohesive, high-end visual product.

### Consequences
* **Positive:** An authoritative, differentiated product experience that looks like a $150k custom agency build.
* **Consistency:** Clear pre-flight design checklist for all pull requests and UI component reviews.
