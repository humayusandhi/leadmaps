# Frontend Engineering Rules (`apps/web`)

## Aesthetic & Design Rules (Strict Compliance with `docs/DESIGN.md`)
1. **Palette Calibration:**
   - Background: Void Obsidian (`#090A0D`).
   - Cards/Surfaces: Slate Surface (`#111318`).
   - Primary Accent: Signal Emerald (`#10B981`).
   - **Banned Colors:** Pure black (`#000000`), AI-purple/neon button glows, multi-color gradient headlines.
2. **Typography:**
   - Headings & Interface: `Geist Sans`. (`Inter` is strictly BANNED).
   - Numbers, Metrics, Lead Scores, Code: `Geist Mono`.
3. **Component Architecture:**
   - Major cards must use the **Double-Bezel (Doppelrand)** nested structure (`bg-white/[0.03]` outer shell + `bg-[#111318]` inner core).
   - Primary CTAs must use the **Button-in-Button** pattern with a nested trailing icon island (`↗`).
4. **Mandatory UI States for Every View:**
   - **Loading:** Layout-matching skeletal pulse (`animate-pulse`). Circular spinners are banned.
   - **Empty:** Helpful guidance explaining how to discover data with an explicit action button.
   - **Error:** User-friendly alert banner with retry capability.
5. **Mobile Responsiveness:**
   - Full-height views must use `min-h-[100dvh]` (never `h-screen`).
   - Multi-column grids must collapse to single-column on mobile (< 768px).
   - Enforce zero horizontal overflow (`overflow-x: hidden`). Minimum 44px tap targets.

## State & API Management
1. **Server State:** Handled exclusively via **TanStack Query**. Never clone server response data into Zustand.
2. **Client State:** Ephemeral UI state (active map markers, search radius slider, drawer open/close) goes in **Zustand**.
3. **API Client:** Never write raw `fetch()` in components. Use feature hooks consuming `lib/api/client.ts`.
4. **Forms:** Use React Hook Form with Zod schemas matching backend FormRequests.
