# LeadMap AI

> **Turn local businesses into qualified opportunities.**

LeadMap AI is a multi-tenant B2B SaaS platform for local business discovery, website intelligence, AI opportunity detection, deterministic lead scoring, outreach drafting, and CRM synchronization.

---

## Architecture Blueprint

```
Next.js Frontend (apps/web)
       ↓ HTTPS / REST
Laravel 11 API (apps/api)
   ├── PostgreSQL 16 (Relational Store + JSONB Signals)
   ├── Redis 7 (Cache, Sessions, Rate-Limits)
   └── Laravel Horizon (Redis Job Queues)
       ├── DiscoverBusinessesJob (Google Places API New)
       ├── AnalyzeWebsiteJob (SSRF-Sandboxed DOM Harvester)
       ├── AnalyzeLeadJob (AI Structured Opportunities + Deterministic Scorer)
       ├── GenerateOutreachJob (Email / WhatsApp / LinkedIn)
       ├── ExportLeadsJob (S3-Compatible CSV Generation)
       └── SyncCRMLeadJob (RiffCRM Provider Sync)
```

---

## Monorepo Layout

```text
leadmap-ai/
├── apps/
│   ├── web/                          # Next.js 15+ App Router, TypeScript, Tailwind v4
│   └── api/                          # Laravel 11 Modular Monolith, PHP 8.3+
│
├── packages/
│   └── shared-types/                 # Canonical TypeScript DTOs and Data Contracts
│
├── infrastructure/
│   ├── docker/                       # Dockerfiles for web, api, and horizon worker
│   ├── caddy/                        # Production Caddyfile reverse proxy
│   └── scripts/                      # Automated backup and restore utilities
│
├── docs/
│   ├── PRD.md                        # Product Requirements Document
│   ├── ARCHITECTURE.md               # Technical Architecture Specification
│   ├── DESIGN.md                     # Semantic Design System Specification
│   ├── TEST_PLAN.md                  # Verification & QA Strategy
│   ├── SECURITY.md                   # Security Policies & SSRF Defense
│   ├── DECISIONS.md                  # Permanent ADR Log (ADR-001 to ADR-012)
│   └── MEMORY.md                     # Active Project State & Tracker
│
├── .cursor/rules/                    # AI Coding Agent & Cursor Rules
├── .github/workflows/                # GitHub Actions CI/CD Pipelines
├── docker-compose.yml                # Local multi-container development stack
├── .env.example                      # Environment variables template
├── Makefile                          # Developer automation commands
├── RULES.md                          # Master AI and Engineering Rulebook
└── TASKS.md                          # 77-Step Master Engineering Task Roadmap
```

---

## Developer Quickstart

### Prerequisites
* Node.js `>= 20.0.0`
* PHP `>= 8.3`
* Docker & Docker Compose (optional for containerized setup)

### Setup & Local Development
```bash
# 1. Initialize environment files
make setup

# 2. Boot background infrastructure (PostgreSQL & Redis via Docker)
make up

# 3. Start Next.js development server
make dev
```

---

## Design System & Anti-Patterns
* **Palette:** Void Obsidian (`#090A0D`), Slate Surface (`#111318`), Signal Emerald (`#10B981`).
* **Typography:** `Geist Sans` for headings/UI; `Geist Mono` for all numbers, metrics, and lead scores.
* **Component Architecture:** Double-Bezel (Doppelrand) cards + Button-in-Button CTAs.
* **Banned:** `Inter` font, pure black `#000000`, and AI-purple neon gradients. See [docs/DESIGN.md](docs/DESIGN.md).

---

## Testing & Quality Control
```bash
# Run tests
make test

# Run linters
make lint

# Run typecheck
make typecheck
```

See [docs/TEST_PLAN.md](docs/TEST_PLAN.md) for verification criteria.
