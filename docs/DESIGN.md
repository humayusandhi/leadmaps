# LeadMap AI — Design System & UI/UX Specification

**Version:** 1.0.0  
**Status:** Approved Engineering Baseline  
**Target Product:** LeadMap AI (B2B SaaS Sales Intelligence & Prospecting)  
**Document:** `docs/DESIGN.md`  
**Last Updated:** 2026-09-21  

---

## 0. Design Brief & Philosophical Inference

### 0.1 Design Read
> **"Reading this as:** A high-precision B2B SaaS sales intelligence and geographic discovery platform for elite digital agency owners, growth consultants, and outbound SDR teams. The visual language combines **Linear-tier functional minimalism** with **tactile hardware structuralism** (machined double-bezel cards, crisp contrast, data density without clutter) and **restrained kinetic motion**. It rejects the generic 'AI-purple marketing slop' in favor of an **editorial, dark-slate cockpit** punctuated by an **electric signal emerald** accent."

### 0.2 Core Dials Configuration
All interface, layout, and animation decisions are governed by three explicit master dials:

* **`DESIGN_VARIANCE: 7`** (Asymmetric, intentional tension; avoids generic centered templates while maintaining high utility for data-heavy views).
* **`MOTION_INTENSITY: 6`** (Weighty spring physics, tactile button depressions, staggered cascade reveals; no floaty linear easing).
* **`VISUAL_DENSITY: 6`** (Cockpit efficiency for lead tables and map splits; generous macro-whitespace for marketing and lead profiles).

---

## 1. Visual Theme & Atmosphere

LeadMap AI presents a calm, commanding, and authoritative workspace. It is built to feel like an expensive, custom-engineered workstation—machined, rapid, and transparent.

* **Spatial Vibe:** A dark, high-contrast, atmospheric canvas (`#090A0D`) paired with frosted obsidian cards (`#111318`), hairline zinc borders (`rgba(255,255,255,0.08)`), and sharp typography.
* **Surface Depth:** Interfaces are built using **Nested Bezel Architecture (Doppelrand)**—a machined outer tray framing a floating inner core with subtle inset specular highlights.
* **Emotional Signal:** Rigorous transparency. Every score, signal, and AI-inferred opportunity displays its exact provenance (Provider Data, Observed Fact, Derived Metric, or AI Inference).

---

## 2. Calibrated Color Palette & Semantic Tokens

### 2.1 The Master Palette
Only **one primary accent** is permitted across the platform: **Signal Emerald** (`#10B981` / `#059669`). The AI purple/neon gradient aesthetic is strictly banned.

```
┌─────────────────────────┬──────────────┬────────────────────────────────────────────────────────┐
│ Token Name              │ Hex / Value  │ Semantic Role & Usage                                  │
├─────────────────────────┼──────────────┼────────────────────────────────────────────────────────┤
│ Void Obsidian           │ #090A0D      │ Primary background canvas; deep, non-pure-black floor  │
├─────────────────────────┼──────────────┼────────────────────────────────────────────────────────┤
│ Slate Surface           │ #111318      │ Secondary surface; card containers, panels, sidebars   │
├─────────────────────────┼──────────────┼────────────────────────────────────────────────────────┤
│ Elevated Core           │ #181B22      │ Inner card cores, dropdown menus, table row hover      │
├─────────────────────────┼──────────────┼────────────────────────────────────────────────────────┤
│ Frosted Bezel           │ rgba(255,    │ Outer tray fill for double-bezel cards and containers  │
│                         │ 255,255,0.03)│                                                        │
├─────────────────────────┼──────────────┼────────────────────────────────────────────────────────┤
│ Hairline Border         │ rgba(255,    │ Structural 1px division lines and card perimeters      │
│                         │ 255,255,0.08)│                                                        │
├─────────────────────────┼──────────────┼────────────────────────────────────────────────────────┤
│ High-Contrast Border    │ rgba(255,    │ Active card outlines, focused states, modal borders    │
│                         │ 255,255,0.18)│                                                        │
├─────────────────────────┼──────────────┼────────────────────────────────────────────────────────┤
│ Crisp Titanium          │ #F8FAFC      │ Primary text, active icons, prominent titles           │
├─────────────────────────┼──────────────┼────────────────────────────────────────────────────────┤
│ Muted Vapor             │ #94A3B8      │ Secondary text, descriptive labels, inactive tabs      │
├─────────────────────────┼──────────────┼────────────────────────────────────────────────────────┤
│ Dark Steel              │ #475569      │ Tertiary text, disabled states, structural grid lines  │
├─────────────────────────┼──────────────┼────────────────────────────────────────────────────────┤
│ Signal Emerald (Accent) │ #10B981      │ Primary CTA, lead score badges (80+), verified status  │
├─────────────────────────┼──────────────┼────────────────────────────────────────────────────────┤
│ Deep Emerald Fill       │ #064E3B      │ Background tint for active badges and emerald buttons  │
├─────────────────────────┼──────────────┼────────────────────────────────────────────────────────┤
│ Amber Warning           │ #F59E0B      │ Medium lead scores (50–79), missing meta signals       │
├─────────────────────────┼──────────────┼────────────────────────────────────────────────────────┤
│ Rose Deficit            │ #F43F5E      │ High-opportunity deficits (No HTTPS, No Booking, 0-49) │
├─────────────────────────┼──────────────┼────────────────────────────────────────────────────────┤
│ Cobalt Informational    │ #38BDF8      │ Provider data badges (Google Places indicators)        │
└─────────────────────────┴──────────────┴────────────────────────────────────────────────────────┘
```

### 2.2 Four-Tier Data Provenance Badges
Every piece of intelligence in the UI must display a calibrated provenance badge:

* **Provider Data:** Border `rgba(56, 189, 248, 0.2)` | Text `#38BDF8` | Background `rgba(56, 189, 248, 0.08)` (Google Places source)
* **Observed Data:** Border `rgba(16, 185, 129, 0.2)` | Text `#10B981` | Background `rgba(16, 185, 129, 0.08)` (Direct website crawler finding)
* **Derived Data:** Border `rgba(245, 158, 11, 0.2)` | Text `#F59E0B` | Background `rgba(245, 158, 11, 0.08)` (Mathematical Lead Score calculation)
* **AI Inference:** Border `rgba(168, 85, 247, 0.25)` | Text `#C084FC` | Background `rgba(168, 85, 247, 0.08)` (LLM opportunity synthesis)

---

## 3. Typographic Architecture

### 3.1 Font Stack
* **Display & Primary UI:** `Geist Sans` (Fallback: `Cabinet Grotesk`, `Outfit`, `-apple-system`).  
  *Rule:* `Inter` is **STRICTLY BANNED**. Generic serif fonts (`Times New Roman`, `Georgia`, `Garamond`) are **BANNED**.
* **Code, Metadata, Numeric Scores & Tables:** `Geist Mono` (Fallback: `JetBrains Mono`). All metrics, ratings, lead scores, and financial figures must render in monospace for tabular alignment.

### 3.2 Type Scale Hierarchy

| Element | Font & Weight | Size | Tracking | Leading | Color Role |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Hero Title (H1)** | `Geist Sans` Bold (700) | `clamp(2.5rem, 5vw, 4.5rem)` | `-0.04em` | `1.05` | Crisp Titanium (`#F8FAFC`) |
| **Section Header (H2)** | `Geist Sans` SemiBold (600) | `clamp(1.75rem, 3vw, 2.5rem)` | `-0.03em` | `1.15` | Crisp Titanium (`#F8FAFC`) |
| **Card / Panel Title (H3)** | `Geist Sans` Medium (500) | `1.25rem` (20px) | `-0.02em` | `1.3` | Crisp Titanium (`#F8FAFC`) |
| **Eyebrow Micro-Badge** | `Geist Mono` SemiBold (600) | `0.6875rem` (11px) | `+0.15em` | `1` | Signal Emerald / Muted Vapor |
| **Body Primary** | `Geist Sans` Regular (400) | `0.9375rem` (15px) | `-0.01em` | `1.6` | Muted Vapor (`#94A3B8`) |
| **Body Monospace** | `Geist Mono` Regular (400) | `0.8125rem` (13px) | `0em` | `1.5` | Crisp Titanium / Muted Vapor |
| **Metrics / Lead Score** | `Geist Mono` Bold (700) | `2.25rem` (36px) | `-0.03em` | `1` | Signal Emerald / High White |

---

## 4. Component Anatomy & Tactile Haptics

### 4.1 The Double-Bezel (Doppelrand) Card Architecture
Never place a flat card directly onto the void canvas. All primary cards (Lead Cards, Analysis Panels, Opportunity Summaries) use a nested double-bezel:

```
┌── Outer Shell: bg-white/[0.03] p-1.5 rounded-[1.5rem] border border-white/[0.08] ───┐
│                                                                                      │
│   ┌── Inner Core: bg-[#111318] p-5 rounded-[1.25rem] shadow-inner-highlight ────┐    │
│   │                                                                             │    │
│   │   [Card Header: Business Name + Rating Badge + Monospace Score Meter]        │    │
│   │   [Card Content: Verified Address, Observed Domain, Opportunity Tags]       │    │
│   │   [Card Actions: Double-Bezel 'Inspect' Button + Sync Trigger]              │    │
│   │                                                                             │    │
│   └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                      │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

* **Tailwind Token Formulation:**  
  *Outer Wrapper:* `bg-white/[0.03] p-1.5 rounded-2xl border border-white/[0.08]`  
  *Inner Container:* `bg-[#111318] p-5 rounded-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]`

### 4.2 Buttons & Interactive Touchpoints

#### Primary CTA: The Button-in-Button "Island" Architecture
* **Exterior:** Pill geometry (`rounded-full`), generous padding (`px-6 py-3`), solid Signal Emerald (`bg-emerald-500 hover:bg-emerald-400 text-black font-medium`).
* **Trailing Icon Island:** If an arrow or action icon (`↗`) is present, it sits inside a dedicated nested circular bezel (`w-7 h-7 rounded-full bg-black/15 flex items-center justify-center ml-3`).
* **Tactile Depression:** On active click, the button scales down slightly: `active:scale-[0.98]` with a `-1px` vertical translation.

#### Secondary & Ghost Buttons
* **Secondary:** `bg-[#181B22] border border-white/[0.1] text-white hover:bg-white/[0.06] rounded-full px-5 py-2.5 active:scale-[0.98]`.
* **Ghost:** `text-slate-400 hover:text-white hover:bg-white/[0.04] rounded-lg px-3 py-2 transition-colors`.

### 4.3 Form Inputs & Search Controls
* **Structure:** Label positioned rigidly above the input field. Helper/error text sits below.
* **Styling:** `bg-[#111318] border border-white/[0.1] rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/50 transition-all outline-none font-sans text-sm`.
* **No Floating Labels:** Floating labels create cognitive load and layout jumps during browser auto-fill.

### 4.4 Skeletal Loaders vs. Spinners
* **Spinners are BANNED:** Generic circular SVG spinners are strictly prohibited for content cards, data tables, and search result feeds.
* **Skeletal Dimensions:** Loaders must mirror the exact bounding-box dimensions of the resolving card using an ambient pulse (`bg-white/[0.04] animate-pulse rounded-xl`).

---

## 5. Screen Layouts & Functional Viewports

### 5.1 Marketing Landing Page (The Conversion Engine)
* **Hero Architecture (Split Asymmetric):**
  * Left Column (55% width): Eyebrow pill tag (`[●] SALES INTELLIGENCE ENGINE`) → Tight Display Headline with **Inline Visual Micro-Images** embedded at font-height between words → Monospace value hook → Single Primary CTA button ("Launch Discovery Console ↗") with trailing icon island.
  * Right Column (45% width): Live interactive mockup of the **LeadMap AI Cockpit** showing an active discovery radius in Austin, TX with real-time signal detections.
* **No Centered Hero:** Centered hero layouts are banned under `DESIGN_VARIANCE: 7`.
* **No 3-Column Equal Grids:** Feature showcases use an **Asymmetric Bento Grid** (e.g., 8-column deep card displaying the Website Analyzer alongside two stacked 4-column cards for Lead Scoring and RiffCRM sync).

### 5.2 The Application Shell & Floating Island Navigation
```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                        │
│   ┌── Floating Island Nav (mt-4 mx-auto max-w-5xl rounded-full bg-[#111318]/80 ────┐   │
│   │  [LeadMap AI Logo]  |  [Workspace: Apex Media ▾]  |  [Finder] [Leads] [Lists]  │   │
│   │                                       | [Credits: 4,180 Monospace] [Profile ▾]  │   │
│   └─────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                        │
```
* **Navigation:** Detached floating glass pill (`mt-4 mx-auto max-w-6xl rounded-full bg-[#111318]/80 backdrop-blur-xl border border-white/[0.08] px-6 py-2.5 shadow-2xl z-40`).
* **Credit Ticker:** Monospace badge with perpetual subtle green breathing dot (`w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block mr-2`).

### 5.3 AI Lead Finder: The Split-Cockpit View
The core search surface uses a 50/50 desktop split view with responsive single-column mobile collapse:

```
┌──────────────────────────────────────────────────┬─────────────────────────────────────┐
│ Left Panel: 480px–560px Scrollable Stream        │ Right Panel: Full-Bleed Map View    │
├──────────────────────────────────────────────────┼─────────────────────────────────────┤
│ • Search Filter Bar (Radius, Category, Min-Stars)│ • Custom Styled Dark Mapbox Canvas  │
│ • Total Discovered Counter ("48 Clinics Found")  │ • Signal Emerald Cluster Pins       │
│ • Scrollable Feed of Double-Bezel Lead Cards     │ • Selected Pin Popover with Score   │
│ • Real-Time Synchronized Selection Highlighting  │ • "Search Area as I Pan" Toggle     │
└──────────────────────────────────────────────────┴─────────────────────────────────────┘
```

### 5.4 Lead Profile & Diagnostic Intelligence View
A comprehensive dossier layout displaying structured evidence before inference:
1. **Header Zone:** Business Name, Category, Verified Physical Coordinates, Phone Number (Click-to-Call pill), Website link, Pipeline Status dropdown (`NEW`, `QUALIFIED`, etc.).
2. **Deterministic Score Gauge:** A circular SVG radial progress gauge (0–100) rendered in `Geist Mono`, followed by the **Point Contribution Waterfall** explaining every earned point.
3. **Four-Panel Technical Audit Grid:**
   * *Technical Health:* HTTPS, SSL expiration, HTTP status, load time in ms.
   * *SEO Visibility:* Title tag length meter, Meta description presence, Heading hierarchy count, LocalBusiness schema detection.
   * *Conversion Deficits:* Hero CTA detection, Contact form detector, Booking widget presence, WhatsApp click-to-chat detection.
   * *Observed Technology:* Heuristic CMS detection (e.g., "WordPress 6.4 (Heuristic)"), Google Analytics 4, Meta Pixel.
4. **AI Opportunity Cards:** Structured cards displaying Category, Opportunity Title, Direct Evidence quote, Suggested Agency Service, and Confidence Level.
5. **Outreach Drawer:** Slide-over panel offering 1-click tab switching between Email, WhatsApp, and LinkedIn drafts with "Copy to Clipboard" and "Sync to RiffCRM" triggers.

---

## 6. Motion Choreography & Fluid Physics

### 6.1 Master Spring Physics Formula
Default transitions must simulate real physical mass. All CSS transitions use a custom spring cubic-bezier:

```css
/* Master Interaction Cubic Bezier */
--ease-spring-snappy: cubic-bezier(0.32, 0.72, 0, 1);
--transition-snappy: all 400ms var(--ease-spring-snappy);
```

### 6.2 Motion Directives
1. **GPU-Safe Animations Only:** Animate exclusively via `transform` and `opacity`. Animating layout properties (`top`, `left`, `width`, `height`, `margin`) is **strictly prohibited**.
2. **Staggered Waterfall Revealing:** Search result feeds and table rows do not mount instantly. They cascade into view with an incremental 40ms stagger (`animation-delay: calc(var(--index) * 40ms)`), fading up from `translate-y-3` to `translate-y-0`.
3. **Modal & Drawer Physics:** Overlays expand with `backdrop-blur-xl bg-black/70` over 300ms. Modals scale up from `scale-95` to `scale-100` using `--ease-spring-snappy`.
4. **No Blur on Scrolling Containers:** `backdrop-filter: blur()` is restricted strictly to fixed navigation bars, sticky headers, and modal overlays. It is **banned on scrolling cards or feed containers** to prevent frame-rate drops on mobile GPUs.

---

## 7. Responsive Breakpoint Rules

```
┌─────────────────┬─────────────────┬────────────────────────────────────────────────────────┐
│ Viewport        │ Width Threshold │ Structural Layout Behavior                             │
├─────────────────┼─────────────────┼────────────────────────────────────────────────────────┤
│ Mobile          │ < 768px (sm)    │ Strict single-column stack. Map tabs behind toggle.    │
│                 │                 │ Section padding py-12 px-4. Tap targets min 44px.      │
├─────────────────┼─────────────────┼────────────────────────────────────────────────────────┤
│ Tablet          │ 768px–1024px    │ 2-column bento grids. Sidebar collapses to icon strip. │
│                 │ (md)            │ Map/List converts to stacked 50vh panels.              │
├─────────────────┼─────────────────┼────────────────────────────────────────────────────────┤
│ Desktop / Ultra │ > 1024px (lg+)  │ Full split cockpit. Max-width container at 1440px.     │
│                 │                 │ Permanent persistent sidebar and full-bleed map.       │
└─────────────────┴─────────────────┴────────────────────────────────────────────────────────┘
```

* **The Universal Mobile Rule:** Full-height sections must use `min-h-[100dvh]`—never `h-screen` (which triggers catastrophic layout jumping on iOS Safari when browser address bars collapse).
* **Zero Horizontal Overflow:** Page bodies enforce `overflow-x: hidden`. Any component producing horizontal scroll on mobile constitutes a build failure.

---

## 8. Anti-Patterns & Absolute Banned List

The following patterns are **permanently banned** across all LeadMap AI codebases, designs, and templates:

* ❌ **NO Emojis as UI Icons:** Never use unicode emojis (🚀, 🔥, 💡, ⚡) in place of professional icons. Use ultra-thin SVG vectors (e.g., Lucide / Phosphor Light).
* ❌ **NO Inter Font:** `Inter` is banned. Use `Geist Sans` or `Cabinet Grotesk`.
* ❌ **NO AI Purple / Neon Mesh Slop:** No purple button glows, violet ambient meshes, or multi-color gradients on headers.
* ❌ **NO Pure Black (`#000000`):** Use Void Obsidian (`#090A0D`) or Charcoal Zinc (`#111318`).
* ❌ **NO Centered Hero Sections:** Split-screen or left-aligned typography only.
* ❌ **NO 3-Column Equal Cards:** Use asymmetric bento grids or 2-column staggered structures.
* ❌ **NO Generic Circular Spinners:** Use layout-matching skeletal shimmer bars.
* ❌ **NO Floating Form Labels:** Form labels must sit firmly above inputs.
* ❌ **NO Marketing Clichés:** Banned copywriting: *"Elevate your sales"*, *"Seamless integration"*, *"Unleash the power"*, *"Next-gen platform"*. Use evidence-backed statements: *"Turn local businesses into qualified opportunities with observable technical proof."*
* ❌ **NO Fake Placeholder Names:** Never use *"John Doe"*, *"Acme Corp"*, or *"Nexus Inc."* Use realistic vertical examples (e.g., *"Apex Dental Care"*, *"Austin Precision HVAC"*).
* ❌ **NO Fake Rounded Numbers:** Avoid *"99.99%"* or *"10,000,000 leads"*. Use realistic operational metrics (*"48 businesses analyzed"*, *"86/100 Lead Score"*).

---

## 9. Developer Hand-off & Design Checklist

Before delivering or approving any frontend component or page for LeadMap AI, verify compliance with this matrix:

- [ ] **Design Read Compliance:** Matches the dark-cockpit, Linear-tier aesthetic.
- [ ] **Color Token Adherence:** Only Signal Emerald (`#10B981`) used for primary accents; no purple/violet glows.
- [ ] **Typography Integrity:** `Geist Sans` for headings/UI, `Geist Mono` for scores, numbers, tables, and code. `Inter` is absent.
- [ ] **Double-Bezel Construction:** Major cards and panels use the outer shell (`bg-white/[0.03]`) + inner core (`bg-[#111318]`) architecture.
- [ ] **Button-in-Button Pattern:** Primary CTAs feature the nested trailing icon circle.
- [ ] **Data Provenance Labels:** Every data point is tagged as *Provider*, *Observed*, *Derived*, or *AI Inference*.
- [ ] **Deterministic Score Display:** Lead Scores feature radial meters with explicit point waterfall breakdowns.
- [ ] **Mobile Viewport Stability:** Tested at 375px width; uses `min-h-[100dvh]`; no horizontal scroll; collapses to single column.
- [ ] **GPU-Safe Motion:** All transitions use `transform`/`opacity` with spring physics cubic-bezier.
- [ ] **Zero Banned Elements:** Checked against the Section 8 anti-pattern blacklist.
