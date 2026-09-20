# LeadMap AI — Project Memory & Active State

**Document:** `MEMORY.md` & `docs/MEMORY.md`  
**Status:** Baseline Specifications Finalized — Ready for Phase 1 Scaffold  
**Last Updated:** 2026-09-21  

---

## 1. Current Status

Phase 1 (Project Foundation & Monorepo Scaffold) and Phase 2 (Authentication & Workspace Multi-Tenancy) are fully implemented and verified.
Both the frontend Next.js 15+ application and the Laravel 11 API backend compile and pass all tests and lint/type checks without error.

The project is currently at the transition point to **Phase 3: Google Places Discovery & Map Experience (TASK-016 to TASK-023)**.

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
* [x] **Architectural Decision Records ([DECISIONS.md](file:///home/humayu/Downloads/ProjectsRiffas/LeadMaps/DECISIONS.md)):**
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

---

## 3. Current Task

**Upcoming Task:** `TASK-016: Google Places Domain Contract & Provider Implementation`  
* **Phase:** Phase 3 (Google Places Discovery & Map Experience)  
* **Objective:** Define `BusinessDiscoveryProvider` interface and implement `GooglePlacesProvider` calling the official Google Places API (New) with zero web scraping.

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

1. **Start TASK-016:** Implement `BusinessDiscoveryProvider` contract and Google Places API adapter in `apps/api/app/Domain/Business/Contracts/`.
2. **Execute TASK-017:** Business normalization and deduplication service against existing workspace leads.
3. **Execute TASK-018:** Asynchronous `DiscoverBusinessesJob` on Horizon queue.
