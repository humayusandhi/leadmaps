# General Development Rules

These rules apply across the entire LeadMap AI codebase for all engineers and AI agents.

## Core Directives
1. **Architecture Model:** LeadMap AI is a **Modular Monolith + Asynchronous Workers**. Never introduce microservices without explicit architectural approval.
2. **Read First:** Always consult `docs/PRD.md`, `docs/DESIGN.md`, and `docs/ARCHITECTURE.md` before initiating non-trivial changes.
3. **No Unrelated Edits:** Never modify files or format lines unrelated to the active task.
4. **Scope & Reusability:** Reuse existing components, hooks, actions, and DTOs. Never duplicate business logic.
5. **Clear Naming & Strict Types:**
   - Frontend: Strict TypeScript (no `any`).
   - Backend: Strict PHP 8.3+ types (`declare(strict_types=1);`).
6. **Error Transparency:** Never silence exceptions or display raw system stack traces to users.
7. **Git Discipline:** Write clear, conventional commits (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`).
