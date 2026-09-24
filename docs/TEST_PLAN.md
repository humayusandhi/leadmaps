# LeadMap AI — Master Verification & Test Plan

**Document:** `docs/TEST_PLAN.md`  
**Status:** Active Quality Baseline  
**Purpose:** Defines the concrete, testable criteria for what "working" actually means across every layer of LeadMap AI. This document serves as the mandatory checklist for automated test suites (Pest, Vitest) and manual QA before completing any feature.

---

## 1. Authentication & Multi-Tenant Workspaces

### 1.1 User Registration & Login
- [ ] **Valid Registration:** User can sign up with email, name, and strong password (min 8 chars, 1 number, 1 uppercase, 1 special char).
- [ ] **Email Verification:** A signed verification token is dispatched; unverified users are prompted to verify before credit consumption.
- [ ] **Valid Login:** User can log in with valid credentials and receive an authenticated session / token.
- [ ] **Invalid Credentials:** Submitting incorrect passwords returns a clear, user-friendly error ("Invalid credentials") without revealing if the email exists.
- [ ] **Rate Limiting & Brute Force Protection:** 5 consecutive failed login attempts lock the account for 15 minutes.
- [ ] **Password Reset:** Expiring single-use reset links sent via email allow users to securely set a new password.
- [ ] **Logout:** User can log out; server revokes session/token; browser redirects to `/login`.

### 1.2 Route & Middleware Protection
- [ ] **Guest Access Blocked:** Unauthenticated users attempting to access `/dashboard`, `/finder`, `/leads`, `/lists`, or `/billing` are redirected to `/login`.
- [ ] **Token Expiry:** Expired tokens gracefully redirect to `/login` with an informative toast ("Session expired. Please log in again.").

### 1.3 Multi-Tenant Workspace Isolation (Critical)
- [ ] **Workspace Creation:** New registrations automatically provision a default personal workspace with initial free credits.
- [ ] **Tenant Isolation (BOLA / IDOR):** User in Workspace A **cannot** access, edit, or delete leads, searches, lists, or notes belonging to Workspace B (assert `HTTP 403 Forbidden`).
- [ ] **Workspace Switching:** Switching the active workspace in the navigation immediately updates the context, loading only the selected workspace's leads and credit balance.
- [ ] **Role-Based Access Control (RBAC):**
  - `OWNER`: Full access (billing, member management, workspace deletion).
  - `ADMIN`: Manage members and integrations; cannot delete workspace.
  - `MEMBER`: Execute searches, manage leads, generate outreach, export CSVs.
  - `VIEWER`: Read-only access; cannot spend credits or edit leads.

---

## 2. Business Discovery & Google Places Search

- [ ] **Search Validation:** Validates required fields (`category`, `location`, `radius_km` between 1 and 50).
- [ ] **Provider Execution:** Official Google Places API (New) returns normalized place results (`name`, `address`, `phone`, `website`, `rating`, `review_count`, `coordinates`).
- [ ] **No HTML Scraping:** Discovery exclusively consumes supported Google Places API endpoints; zero headless browser scraping.
- [ ] **Deduplication Check:** Discovered places already saved in the active workspace display an active `[Saved]` badge.
- [ ] **Map & List Synchronization:**
  - Clicking a business card in the results list centers and highlights the corresponding pin on the map.
  - Clicking a map marker opens the summary popover and scrolls to the card in the list feed.
- [ ] **Filter Controls:** Filtering by "Has Website", minimum star rating (e.g. 4.0+), or review count updates the list instantly.
- [ ] **Empty Search State:** If 0 businesses are found, UI displays an actionable message advising to expand the radius or broaden keywords.
- [ ] **Quota & API Failure Gracefulness:** If the Google API quota is exhausted or errors, UI displays an informative alert and **no credits are deducted**.

---

## 3. Website Analyzer & SSRF Crawler Safety

### 3.1 SSRF Defense Gate (High Risk)
- [ ] **Loopback Block:** Reject requests resolving to `127.0.0.1`, `localhost`, or `::1` (assert `SecurityViolationException`).
- [ ] **Private IP Block:** Reject requests resolving to RFC 1918 subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`).
- [ ] **Cloud Metadata Block:** Reject requests targeting `169.254.169.254` or `metadata.google.internal`.
- [ ] **Protocol Whitelist:** Abort non-HTTP schemes (`file://`, `ftp://`, `gopher://`).
- [ ] **Redirect Re-Validation:** If a public URL redirects to an internal IP, crawler immediately terminates the connection.

### 3.2 Signal Extraction
- [ ] **Technical Signals:** Accurately extracts HTTP status (200 vs 4xx/5xx), SSL validity, load latency in milliseconds, and mobile `<meta name="viewport">`.
- [ ] **SEO Signals:** Extracts title tag, meta description, heading hierarchy (`h1` count), and JSON-LD structured data.
- [ ] **Conversion Signals:** Accurately detects primary CTA buttons, contact forms, click-to-call (`tel:`) links, WhatsApp chat links, and booking widget embeds.
- [ ] **Heuristic CMS Detection:** Identifies WordPress, Shopify, Wix, Webflow signatures and clearly tags them as *Heuristic Observation*.
- [ ] **Timeout Handling:** Requests taking longer than 10 seconds automatically abort, mark status as `FAILED_TIMEOUT`, and **refund reserved credits**.
- [ ] **Blocked Crawl Handling:** Sites returning 403 Forbidden display a clear notice ("Protected by site firewall; manual review available").

---

## 4. AI Opportunity Engine & Deterministic Lead Scoring

- [ ] **Structured Output Only:** LLM returns strict JSON matching the defined schema (Category, Opportunity Title, Evidence, Suggested Service, Confidence).
- [ ] **No Hallucinated Contacts:** AI never invents phone numbers, emails, or physical addresses.
- [ ] **Deterministic Scoring Consistency:**
  - The LLM **never** authoritatively outputs the final lead score.
  - Submitting identical technical and business signals to the scoring engine produces the **exact same 0–100 score** every time.
- [ ] **Mathematical Waterfall Breakdown:** Every awarded point sums up precisely to the final score:
  - `Service Fit` (max 20) + `Website Deficits` (max 20) + `Conversion Gaps` (max 15) + `SEO Gaps` (max 15) + `Contactability` (max 10) + `Business Activity` (max 10) + `Other` (max 10) = `Total Score (0–100)`.
- [ ] **Visual Gauge & Breakdown UI:**
  - Radial score meter renders in `Geist Mono` with color tiering: Green (80–100), Amber (50–79), Rose (0–49).
  - Clicking the gauge expands the full explainable point waterfall.

---

## 5. Lead Pipeline, Management & Notes

- [ ] **Save Discovered Lead:** Discovered business can be saved into the workspace lead repository with status `NEW`.
- [ ] **Valid Status Progression:**
  - Allowed transitions: `NEW` -> `RESEARCHED` -> `CONTACTED` -> `REPLIED` -> `QUALIFIED` -> `MEETING` -> `WON` / `LOST`.
  - Direct illegal jumps (e.g., `NEW` -> `WON`) are rejected by the domain validator.
- [ ] **Notes CRUD:**
  - User can add a note to a lead; persists with author name and timestamp.
  - User can edit their own note.
  - User can delete their own note.
- [ ] **Notes Tenant Isolation:** User in Workspace A cannot view, edit, or delete notes attached to Workspace B's leads.
- [ ] **Tagging:** User can create and assign color-coded tags; filtering by tags updates the leads table in real time.

---

## 6. Custom Lists, AI Outreach & CSV Export

- [ ] **List Management:** User can create a named list, rename it, delete it, and add/remove leads individually or in bulk.
- [ ] **AI Outreach Drafting:**
  - User can trigger outreach generation for Email, WhatsApp, and LinkedIn.
  - Generated messages accurately reference the business name, Google rating, and detected deficits (e.g., missing booking system) without hallucinations.
  - "Copy to Clipboard" button copies formatted text and shows visual feedback.
- [ ] **Asynchronous CSV Export:**
  - Initiating CSV export dispatches `ExportLeadsJob`.
  - Completed export uploads to S3-compatible storage and returns an expiring signed download link.
  - Exported CSV conforms to RFC 4180 with clean headers and UTF-8 encoding.

---

## 7. Credit Engine & Billing (Razorpay)

- [ ] **Atomic Two-Phase Hold:**
  - Batch analysis of 10 leads reserves 20 credits (`SELECT FOR UPDATE`).
  - Available balance drops immediately by 20.
  - Succeeded jobs commit consumption; failed jobs release and refund credits.
- [ ] **Negative Balance Prevention:** User with 2 credits cannot trigger an action requiring 4 credits.
- [ ] **Zero-Credit UI Guard:** Workspace with 0 credits receives a prominent top-up modal; credit-consuming API calls return `HTTP 402 Payment Required`.
- [ ] **Razorpay Webhook Verification:**
  - Webhook controller verifies HMAC-SHA256 signature using `RAZORPAY_WEBHOOK_SECRET`.
  - Forged payloads return `HTTP 400 Bad Request`.
  - Valid `subscription.charged` events allocate monthly credits and record transaction ledger entries.
  - Duplicate webhook events are rejected idempotently.

---

## 8. CRM Integrations (RiffCRM)

- [ ] **Credential Storage:** RiffCRM API keys are stored AES-256 encrypted at rest in the database.
- [ ] **Single-Click Lead Sync:**
  - Clicking "Sync to RiffCRM" dispatches `SyncCRMLeadJob`.
  - Company, phone, website, industry, lead score, and tags map accurately to RiffCRM entities.
  - Lead displays green `[Synced to RiffCRM]` badge with external link to RiffCRM record.
- [ ] **Decoupled Failure Isolation:** If RiffCRM is down or returns 500 errors, the background job retries 3 times and marks status `SYNC_FAILED` without crashing or blocking the user interface.

---

## 9. Responsive & Cross-Device Viewports

All screens must be verified against these three target viewports:

### 9.1 Mobile Viewport (375px — iPhone SE / Standard Mobile)
- [ ] Split-cockpit collapses to a strict single-column stack.
- [ ] Map view is accessible via a toggle tab or sits below the list feed.
- [ ] Full-height screens use `min-h-[100dvh]` (zero layout jumps when mobile address bar hides).
- [ ] Zero horizontal overflow (`overflow-x: hidden`).
- [ ] Interactive touch targets are minimum 44px × 44px.
- [ ] Floating navigation collapses to a responsive mobile drawer/modal.

### 9.2 Tablet Viewport (768px — iPad / Tablet)
- [ ] Asymmetric bento grids adapt to clean 2-column layouts.
- [ ] Floating navigation displays logo, active workspace, and primary links.
- [ ] Table views support horizontal scrolling on data columns while keeping business name sticky.

### 9.3 Desktop Viewport (1440px — High-Resolution Display)
- [ ] Full split-cockpit renders side-by-side (50% scrollable feed, 50% persistent map canvas).
- [ ] Macro-whitespace breathes comfortably (`py-24` to `py-32` on marketing sections).
- [ ] Max-width containment enforced at 1440px.

---

## 10. Visual Design & Anti-Pattern Checklist (`docs/DESIGN.md`)

- [ ] **Palette Fidelity:**
  - Background is Void Obsidian (`#090A0D`).
  - Cards are Slate Surface (`#111318`).
  - Primary accent is Signal Emerald (`#10B981`).
  - **Zero AI-purple/violet neon glows** anywhere in the interface.
  - **Zero pure black (`#000000`)** used for canvas or cards.
- [ ] **Typography:**
  - `Geist Sans` used for headings and UI text.
  - `Geist Mono` used for all ratings, numbers, lead scores, code, and timestamps.
  - **`Inter` font is completely absent** from stylesheets and bundle imports.
- [ ] **Tactile Components:**
  - Primary cards use the **Double-Bezel (Doppelrand)** nested structure (`bg-white/[0.03]` outer shell + `bg-[#111318]` inner core).
  - Primary CTA buttons use the **Button-in-Button** pattern with a nested trailing icon island (`↗`).
- [ ] **Mandatory States on Every View:**
  - **Loading:** Layout-matching skeletal shimmers (`animate-pulse`). Circular spinners are banned.
  - **Empty:** High-agency illustrated/icon empty state with clear action CTA.
  - **Error:** User-friendly alert banner with retry button.
- [ ] **Motion Performance:**
  - All transitions use spring cubic-bezier (`cubic-bezier(0.32, 0.72, 0, 1)`).
  - Animations operate strictly on `transform` and `opacity` (GPU-safe).
  - `backdrop-filter: blur()` is applied only to fixed navigation and overlays, **never to scrolling content containers**.
