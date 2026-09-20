# Backend Engineering Rules (`apps/api`)

## Domain & Code Structure
1. **Modular Monolith Organization:**
   - Domain code resides strictly in `app/Domain/<DomainName>/`.
   - Domain directories encapsulate `Models/`, `Services/`, `Actions/`, `DTOs/`, `Contracts/`, `Events/`.
2. **Thin Controllers:**
   - Controllers must only: validate input via `FormRequest`, authorize via `Policy`, dispatch a Domain `Action`, and return an `ApiResource`.
   - Never write business logic, external API calls, or raw database queries inside controllers.
3. **Strict Multi-Tenancy & Authorization:**
   - Every workspace resource query must enforce `workspace_id`.
   - Authorize actions using Laravel Policies (`$this->authorize(...)`).
   - Prevent IDOR/BOLA by asserting the authenticated user belongs to the target workspace.

## Queue & Job Discipline
1. **Heavy Operations Run Asynchronously:**
   - Web crawling, LLM prompts, and CRM synchronization **must never execute inside synchronous HTTP requests**.
   - Dispatch to Redis queues: `DiscoverBusinessesJob`, `AnalyzeWebsiteJob`, `AnalyzeLeadJob`, `SyncCRMLeadJob`.
2. **Job Resiliency:**
   - Implement exponential backoff retries (max 2–3).
   - Enforce strict timeouts (`AnalyzeWebsiteJob` max 20s, `AnalyzeLeadJob` max 30s).
   - Ensure job handlers are idempotent.

## Deterministic AI & Scoring
1. **No Direct LLM Scoring:** The LLM must NEVER output the final lead score directly.
2. **Structured Opportunities:** The LLM produces validated JSON opportunities with evidence.
3. **Deterministic Math:** A dedicated scoring service calculates the 0–100 score and explainable waterfall.

## Security & Compliance
1. **SSRF Protection:** Validate target URLs before fetching. Abort if IP resolves to `127.0.0.1`, RFC 1918 private subnets, link-local, or cloud metadata endpoints (`169.254.169.254`).
2. **No Scraping:** Use official Google Places API endpoints only. Adhere to caching rules.
3. **No Unsafe Transactions:** Never hold database transactions open during external API requests.
