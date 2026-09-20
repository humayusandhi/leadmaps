# LeadMap AI — Development Rules & AI Rulebook

**Version:** 1.0.0  
**Target:** Engineers, Pair Programmers & AI Coding Agents  
**Scope:** LeadMap AI Monorepo  

This document defines the strict engineering standards, behavioral constraints, design principles, and quality guardrails for developing **LeadMap AI**. Every contributor and AI agent must adhere to these rules without exception.

---

## 1. General Principles

* **TypeScript Everywhere on Frontend:** All code in `apps/web/` must be strict TypeScript. `any` is strictly prohibited. Define explicit interfaces or Zod schemas.
* **Modern PHP 8.3+ on Backend:** Strict types (`declare(strict_types=1);`) in all PHP files. Use typed properties, return types, enums, and readonly classes.
* **Reuse Over Reinvention:** Always check existing components in `components/ui/`, `components/shared/`, or domain actions in `app/Domain/` before writing new code.
* **Do Not Duplicate Logic:** Domain logic belongs in Domain Services/Actions, never repeated across controllers, jobs, or frontend components.
* **Single Responsibility & Small Functions:** Functions and methods should focus on one task. Break functions exceeding 30–40 lines into focused helper methods.
* **Scope Discipline:** Modify only files directly related to the user request. Do not refactor unrelated modules or reformat untouched files.
* **Preserve Documentation Integrity:** Maintain existing comments, docstrings, and architectural markdown documentation.

---

## 2. Before Coding (Pre-Flight Protocol)

1. **Read Project Documentation First:**
   * Review `docs/PRD.md` for functional requirements and user story acceptance criteria.
   * Review `docs/DESIGN.md` for layout, colors, typography, and component styling.
   * Review `docs/ARCHITECTURE.md` for domain boundaries, DTO schemas, and queuing rules.
2. **Inspect Existing Implementations:** Verify if a similar pattern, service contract, or query hook already exists.
3. **Draft a Plan for Large Changes:** If a change impacts multiple domains, database schemas, or queue jobs, outline the execution plan before modifying code.
4. **Never Guess Requirements:** If an architectural or business decision is ambiguous, clarify before assuming.

---

## 3. Frontend & UI Engineering (`apps/web`)

* **Strict Design System Adherence:** Follow `docs/DESIGN.md` precisely.
  * Canvas background: Void Obsidian (`#090A0D`).
  * Surface color: Slate Surface (`#111318`).
  * Single accent: Signal Emerald (`#10B981`).
  * **Strictly Banned:** Inter font, AI-purple/neon gradients, pure black (`#000000`), generic 3-column equal cards, and centered hero layouts.
* **Typography:** Use `Geist Sans` for headings/body and `Geist Mono` for all tabular numbers, ratings, scores, and metrics.
* **Component Architecture:**
  * Use the **Double-Bezel (Doppelrand)** pattern for major cards: Outer shell (`bg-white/[0.03] p-1.5 rounded-2xl border border-white/[0.08]`) + Inner core (`bg-[#111318] p-5 rounded-xl`).
  * Primary buttons must use the **Button-in-Button** trailing icon architecture.
* **Every Viewport Must Support:**
  * **Loading States:** Use layout-matching skeletal shimmers (`animate-pulse`). Circular spinners are banned.
  * **Empty States:** Meaningful guidance explaining how to discover or populate data with a clear action CTA.
  * **Error States:** Graceful, user-friendly error banners with retry buttons. Never display raw network or server error traces.
* **Responsive Discipline:**
  * Full-height layouts must use `min-h-[100dvh]`—never `h-screen`.
  * Multi-column views must collapse to single-column on mobile (< 768px).
  * Absolutely zero horizontal scrolling (`overflow-x: hidden`). Tap targets minimum 44px.
* **State Management:**
  * Server state (API data) belongs exclusively in **TanStack Query**.
  * Client UI state (map coordinates, filter toggles, drawer states) belongs in **Zustand**.
  * Never duplicate server state inside Zustand.
* **Centralized API Client:** Never write raw `fetch()` or Axios calls inside components. Route all requests through `lib/api/` and custom feature hooks.

---

## 4. Backend & Domain Architecture (`apps/api`)

* **Modular Monolith Boundaries:** Organize logic by domain in `app/Domain/<DomainName>/`.
* **Thin Controllers:** Controllers only validate requests via FormRequests, invoke Domain Actions/Services, and return API Resources.
* **Strict Multi-Tenancy & Authorization:**
  * Every tenant resource query must scope by `workspace_id`.
  * Every request must pass server-side authorization via Laravel Policies.
  * Never trust client-supplied workspace IDs without server-side membership verification (prevent IDOR/BOLA).
* **Asynchronous Execution for Heavy Work:**
  * Website crawling, AI prompt evaluation, and CRM synchronization **must never run in synchronous HTTP requests**.
  * Dispatch jobs to Redis-backed queues supervised by Laravel Horizon (`DiscoverBusinessesJob`, `AnalyzeWebsiteJob`, `AnalyzeLeadJob`, `SyncCRMLeadJob`).
* **Deterministic Lead Scoring:**
  * The Large Language Model (LLM) must **never** author the final lead score.
  * The LLM extracts structured opportunity signals. A deterministic scoring service calculates the 0–100 score and explainable waterfall.
* **Database Transactions:**
  * Wrap multi-step state mutations (credit hold/commit, lead saving) in DB transactions.
  * **Never hold open database transactions across slow external API calls.**
* **Idempotency & Deduplication:**
  * Webhook receivers, credit transactions, and job executions must be idempotent.
  * Deduplicate discovered businesses using Google Place IDs.

---

## 5. Security & Safety Mandates

* **SSRF Defense (Critical):**
  * The Website Analyzer must validate target hostnames before connecting.
  * Immediately abort and reject connection if the resolved IP belongs to loopback (`127.0.0.1`), private RFC 1918 ranges (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), link-local, or cloud metadata endpoints (`169.254.169.254`).
  * Whitelist only `http://` and `https://` schemes. Validate all redirect URLs.
* **Zero Scraping:** Do not implement HTML scraping, CAPTCHA bypasses, or undocumented endpoints for Google Maps. Use only official supported APIs.
* **Secret Hygiene:**
  * Never commit API keys, database credentials, or private tokens to Git.
  * Server-side secrets must never be exposed to browser JavaScript.
  * Sanitize logs to ensure secrets and auth tokens are never recorded.
* **Network Isolation:** PostgreSQL (5432) and Redis (6379) must never be bound to public network interfaces.
* **Input Validation & Mass-Assignment Protection:** Validate all client inputs via FormRequests. Use explicit DTO mapping; never pass `$request->all()` into models.

---

## 6. Testing & Quality Assurance

* **Unit & Integration Tests:** Write tests for all core domain logic, deterministic scoring calculations, credit reservations, and SSRF validators.
* **Test Tooling:**
  * Frontend: Vitest / React Testing Library.
  * Backend: Pest PHP / PHPUnit.
* **Test Isolation:** Tests must not depend on live external APIs; mock all external provider interfaces (`GooglePlacesProvider`, `AIProviderInterface`, `RazorpayProvider`, `RiffCRMProvider`).
* **Green Test Requirement:** Run relevant test suites after completing changes. Fix any failing tests before considering a task complete.

---

## 7. Git & Version Control Conventions

* **Focused Commits:** Keep commits atomic and focused on a single logical change.
* **Conventional Commit Messages:**
  * `feat(leads): implement deterministic scoring waterfall engine`
  * `fix(crawler): block link-local addresses in SSRF validator`
  * `style(finder): update double-bezel card radius to match DESIGN.md`
  * `test(billing): add atomic credit reservation concurrency tests`
  * `docs(prd): update RiffCRM field mapping table`
* **Never Commit Secrets or Local Environment Artifacts:** Verify `.gitignore` before committing (`.env`, `node_modules`, `vendor`, `.cursor/rules/*.local`).
