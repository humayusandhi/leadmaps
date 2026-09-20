# Testing & Quality Assurance Rules

## Core Testing Directives
1. **Mandatory Coverage Areas:**
   - Deterministic Lead Scoring calculations and waterfall outputs.
   - SSRF protection and DNS IP resolution filters.
   - Atomic credit reservation, commit, and refund workflows.
   - Multi-tenant boundary checks (assert User A cannot read User B's workspace leads).
   - Form request validation and error responses.
2. **Frameworks & Tooling:**
   - **Backend:** Pest PHP / PHPUnit.
   - **Frontend:** Vitest / React Testing Library.
3. **Mocking External Providers:**
   - Never make live network requests to Google Maps, OpenAI/Anthropic, Razorpay, or RiffCRM during tests.
   - Always mock the domain contracts: `BusinessDiscoveryProvider`, `AIProviderInterface`, `PaymentProviderInterface`, `CRMProviderInterface`.
4. **Pre-Completion Protocol:**
   - Run tests for any modified domains or components.
   - All tests must pass cleanly before marking a task as done.
