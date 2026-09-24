# ==============================================================================
# LeadMap AI — Developer Tooling & Automation Makefile
# ==============================================================================

.PHONY: help setup dev up down logs test lint typecheck clean

help:
	@echo "LeadMap AI Command Suite:"
	@echo "  make setup      - Initialize environment files and workspace dependencies"
	@echo "  make dev        - Start Next.js local development server"
	@echo "  make up         - Start Docker Compose services (PostgreSQL, Redis, API, Worker)"
	@echo "  make down       - Stop Docker Compose services"
	@echo "  make logs       - Tail Docker container logs"
	@echo "  make test       - Run all test suites across web and api"
	@echo "  make lint       - Run linters across monorepo"
	@echo "  make typecheck  - Run TypeScript type checks"
	@echo "  make clean      - Clean node_modules, cache, and build artifacts"

setup:
	@if [ ! -f .env ]; then cp .env.example .env && echo "Created .env from .env.example"; fi
	@if [ ! -f apps/web/.env.local ]; then cp .env.example apps/web/.env.local && echo "Created apps/web/.env.local"; fi
	@npm install

dev:
	npm run dev

up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f

test:
	@echo "Running backend & frontend tests..."
	@for f in apps/api/tests/Feature/*.php; do echo "Running $$f..."; php "$$f" || exit 1; done
	@npm run test:web --if-present

smoke:
	@bash infrastructure/scripts/smoke-test.sh

build:
	@echo "Building shared types and Next.js standalone production bundle..."
	@npm run build:types
	@npm run build:web

deploy-check: typecheck test build smoke
	@echo "=============================================================================="
	@echo " ALL PRE-DEPLOYMENT CHECKS PASSED: READY FOR PRODUCTION GO-LIVE ✓"
	@echo "=============================================================================="

lint:
	@echo "Running linters..."
	@npm run lint:web --if-present

typecheck:
	@echo "Running typecheck..."
	@npm run build:types
	@npm run typecheck:web

clean:
	rm -rf node_modules apps/web/.next apps/web/node_modules packages/*/dist

