'use client';

import * as React from 'react';
import Link from 'next/link';
import { PublicNavbar } from '@/components/shared/PublicNavbar';
import { PublicFooter } from '@/components/shared/PublicFooter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  Code2,
  Terminal,
  ShieldCheck,
  Zap,
  Copy,
  Check,
  Search,
  ExternalLink,
  ChevronRight,
  Layers,
  Sparkles,
  Lock,
  Globe,
  Share2,
} from 'lucide-react';

interface DocSection {
  id: string;
  title: string;
  category: 'START' | 'API' | 'SECURITY' | 'WEBHOOKS';
}

const DOC_SECTIONS: DocSection[] = [
  { id: 'overview', title: 'Platform Overview', category: 'START' },
  { id: 'authentication', title: 'Authentication & Headers', category: 'START' },
  { id: 'provenance', title: '4-Tier Data Provenance', category: 'START' },
  { id: 'searches-api', title: 'Discovery: POST /searches', category: 'API' },
  { id: 'leads-api', title: 'Leads: GET & POST /leads', category: 'API' },
  { id: 'crawler-api', title: 'Website Harvester: POST /analyze', category: 'API' },
  { id: 'scoring-api', title: '0–100 Scoring Mathematical Math', category: 'API' },
  { id: 'outreach-api', title: 'Outreach: POST /outreach', category: 'API' },
  { id: 'ssrf-defense', title: 'SSRF Sandboxing Architecture', category: 'SECURITY' },
  { id: 'webhooks', title: 'Signed Webhook Event Payloads', category: 'WEBHOOKS' },
];

export default function DocsPage() {
  const [activeSection, setActiveSection] = React.useState<string>('overview');
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState<string>('');

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const filteredSections = DOC_SECTIONS.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-[100dvh] bg-[#090A0D] text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-300">
      <PublicNavbar />

      <main className="max-w-7xl mx-auto px-6 pt-10 pb-24">
        {/* Docs Header */}
        <div className="pb-8 border-b border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5" /> Developer Specification
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">LeadMap AI Documentation</h1>
            <p className="text-xs text-slate-400 font-sans">
              REST endpoints, data contracts, SSRF security guarantees, and deterministic scoring formulas.
            </p>
          </div>

          {/* Quick Search */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#111318] border border-white/[0.08] text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* 2-Column Docs Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8">
          {/* Left Column: Sidebar Nav (3 Cols) */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="sticky top-24 space-y-4">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                Index of Topics
              </span>
              <nav className="space-y-1">
                {filteredSections.map((sec) => (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => setActiveSection(sec.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-all flex items-center justify-between ${
                      activeSection === sec.id
                        ? 'bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/25'
                        : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <span>{sec.title}</span>
                    {activeSection === sec.id && <ChevronRight className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </nav>

              <div className="p-3.5 rounded-xl bg-[#111318] border border-white/[0.06] space-y-2">
                <span className="text-[11px] font-mono text-emerald-400 font-bold flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5" /> API Base URL
                </span>
                <code className="text-[10px] font-mono text-slate-300 block bg-[#090A0D] p-2 rounded border border-white/[0.06] select-all">
                  https://api.leadmap.ai/api/v1
                </code>
              </div>
            </div>
          </aside>

          {/* Right Column: Active Content Article (9 Cols) */}
          <article className="lg:col-span-9 space-y-10 min-h-[600px]">
            {/* Overview */}
            {activeSection === 'overview' && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-white tracking-tight">Platform Overview</h2>
                  <p className="text-sm text-slate-300 leading-relaxed font-sans">
                    LeadMap AI is a multi-tenant B2B sales intelligence engine. It combines official Google Places discovery, SSRF-sandboxed DOM crawling, deterministic 0–100 opportunity scoring, and AI outreach generation into a unified API and web dashboard.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
                  <div className="p-4 rounded-xl bg-[#111318] border border-white/[0.08] space-y-1">
                    <span className="text-slate-500 uppercase text-[10px]">Zero Scraping</span>
                    <p className="text-white font-bold">100% Places API (New)</p>
                    <span className="text-slate-400 text-[11px]">TOS-Compliant, No IP Bans</span>
                  </div>
                  <div className="p-4 rounded-xl bg-[#111318] border border-white/[0.08] space-y-1">
                    <span className="text-slate-500 uppercase text-[10px]">Security</span>
                    <p className="text-emerald-400 font-bold">Multi-Tier SSRF Defense</p>
                    <span className="text-slate-400 text-[11px]">Private IP & AWS Metadata Block</span>
                  </div>
                  <div className="p-4 rounded-xl bg-[#111318] border border-white/[0.08] space-y-1">
                    <span className="text-slate-500 uppercase text-[10px]">Mathematical</span>
                    <p className="text-white font-bold">0–100 Explainable Score</p>
                    <span className="text-slate-400 text-[11px]">4 Balanced 25pt Dimensions</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#111318] border border-white/[0.08] space-y-3">
                  <h3 className="text-base font-bold text-white">Architecture Flow</h3>
                  <div className="font-mono text-xs bg-[#090A0D] p-4 rounded-xl border border-white/[0.06] text-slate-300 overflow-x-auto">
                    {`Next.js 15+ Client (apps/web)
       ↓ HTTPS / REST (X-Workspace-ID, Bearer Sanctum)
Laravel 11 Modular Monolith (apps/api)
  ├── PostgreSQL 16 (Relational Store + JSONB Signals)
  ├── Redis 7 (Cache, Sessions, Rate-Limits)
  └── Laravel Horizon (Redis Job Queues)
      ├── DiscoverBusinessesJob (Google Places API New)
      ├── AnalyzeWebsiteJob (SSRF-Sandboxed DOM Harvester)
      ├── AnalyzeLeadJob (Deterministic Scorer + AI Inference)
      ├── GenerateOutreachJob (Email / WhatsApp / LinkedIn)
      └── SyncCRMLeadJob (RiffCRM Provider Sync)`}
                  </div>
                </div>
              </div>
            )}

            {/* Authentication & Headers */}
            {activeSection === 'authentication' && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-white tracking-tight">Authentication & Required Headers</h2>
                  <p className="text-sm text-slate-300 leading-relaxed font-sans">
                    All authenticated API requests require an Authorization Bearer token obtained via <code>POST /api/v1/auth/login</code> and the explicit tenant isolation header <code>X-Workspace-ID</code>.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#111318] border border-white/[0.08] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-emerald-400">cURL Request Example</span>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(
                          `curl -X GET "https://api.leadmap.ai/api/v1/leads" \\\n  -H "Authorization: Bearer YOUR_API_TOKEN" \\\n  -H "X-Workspace-ID: ws-0191b8a2-..." \\\n  -H "Accept: application/json"`,
                          'curl-auth'
                        )
                      }
                      className="p-1 rounded text-slate-400 hover:text-white"
                    >
                      {copiedKey === 'curl-auth' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <pre className="p-3 bg-[#090A0D] rounded-xl text-xs font-mono text-slate-300 overflow-x-auto border border-white/[0.06]">
{`curl -X GET "https://api.leadmap.ai/api/v1/leads" \\
  -H "Authorization: Bearer YOUR_API_TOKEN" \\
  -H "X-Workspace-ID: ws-0191b8a2-..." \\
  -H "Accept: application/json"`}
                  </pre>
                </div>
              </div>
            )}

            {/* 4-Tier Data Provenance */}
            {activeSection === 'provenance' && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-white tracking-tight">4-Tier Data Provenance Standard</h2>
                  <p className="text-sm text-slate-300 leading-relaxed font-sans">
                    In outbound sales, hallucinated technical claims ruin your agency reputation. LeadMap enforces strict data provenance at the schema level:
                  </p>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="p-4 rounded-xl bg-[#111318] border border-sky-500/20 space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge provenance="PROVIDER">PROVIDER DATA</Badge>
                      <span className="text-sky-400 font-bold">Direct from Google Places API</span>
                    </div>
                    <p className="text-slate-300 font-sans text-xs">
                      Coordinates, formatted address, primary phone number, operating hours, and Google review sentiment.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#111318] border border-emerald-500/20 space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge provenance="OBSERVED">OBSERVED FACTS</Badge>
                      <span className="text-emerald-400 font-bold">Harvester Crawler Execution</span>
                    </div>
                    <p className="text-slate-300 font-sans text-xs">
                      Observed HTTP status codes, TLS certificate validation, TTFB millisecond speed, responsive viewport tags, CMS fingerprints, and DOM element existence.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#111318] border border-amber-500/20 space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge provenance="DERIVED">DERIVED METRICS</Badge>
                      <span className="text-amber-400 font-bold">Deterministic Mathematical Formula</span>
                    </div>
                    <p className="text-slate-300 font-sans text-xs">
                      The 0–100 lead score and its exact point deduction waterfall. Computed identically every time with zero LLM variance.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#111318] border border-purple-500/20 space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge provenance="AI_INFERENCE">AI INFERENCES</Badge>
                      <span className="text-purple-400 font-bold">Structured LLM Synthesis</span>
                    </div>
                    <p className="text-slate-300 font-sans text-xs">
                      Synthesized sales angles and opportunity proposals backed by verbatim quoted excerpts from the target website.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Searches API */}
            {activeSection === 'searches-api' && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-white tracking-tight">Discovery: POST /api/v1/searches</h2>
                  <p className="text-sm text-slate-300 leading-relaxed font-sans">
                    Executes an asynchronous Google Places (New) radar query. Deduplicates discovered businesses against your workspace history and stores them in your database.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#111318] border border-white/[0.08] space-y-3">
                  <span className="text-xs font-mono text-emerald-400">Request Body (JSON)</span>
                  <pre className="p-3 bg-[#090A0D] rounded-xl text-xs font-mono text-slate-300 overflow-x-auto border border-white/[0.06]">
{`{
  "category": "Roofing Contractors",
  "location": "Denver, CO",
  "latitude": 39.7392,
  "longitude": -104.9903,
  "radius_km": 15
}`}
                  </pre>
                </div>
              </div>
            )}

            {/* Leads API */}
            {activeSection === 'leads-api' && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-white tracking-tight">Leads: GET /api/v1/leads</h2>
                  <p className="text-sm text-slate-300 leading-relaxed font-sans">
                    Retrieve paginated leads in your workspace. Supports filtering by status (NEW, RESEARCHED, CONTACTED, QUALIFIED, WON, LOST), minimum score, and custom tag.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#111318] border border-white/[0.08] space-y-3">
                  <span className="text-xs font-mono text-emerald-400">Response Sample (200 OK)</span>
                  <pre className="p-3 bg-[#090A0D] rounded-xl text-xs font-mono text-slate-300 overflow-x-auto border border-white/[0.06]">
{`{
  "success": true,
  "data": [
    {
      "id": "lead-01",
      "status": "QUALIFIED",
      "score_value": 86,
      "business": {
        "name": "Mile High Commercial Roofing",
        "phone_number": "+1 303-555-0142",
        "website_url": "https://milehighroofco.com",
        "rating": 4.9,
        "review_count": 142
      }
    }
  ]
}`}
                  </pre>
                </div>
              </div>
            )}

            {/* Website Crawler API */}
            {activeSection === 'crawler-api' && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-white tracking-tight">Website Harvester: POST /api/v1/leads/{`{id}`}/analyze</h2>
                  <p className="text-sm text-slate-300 leading-relaxed font-sans">
                    Triggers the SSRF-sandboxed crawler. Checks SSL handshake, TTFB speed, mobile viewport, OpenGraph tags, JSON-LD Schema markup, online booking flows, and WhatsApp widgets.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#111318] border border-white/[0.08] space-y-3">
                  <span className="text-xs font-mono text-emerald-400">Extracted Observed Signals Object</span>
                  <pre className="p-3 bg-[#090A0D] rounded-xl text-xs font-mono text-slate-300 overflow-x-auto border border-white/[0.06]">
{`{
  "technical": {
    "is_ssl_valid": true,
    "ttfb_ms": 680,
    "is_responsive": true,
    "detected_cms": "WordPress"
  },
  "seo": {
    "has_opengraph": false,
    "has_schema_markup": false,
    "heading_hierarchy_ok": true
  },
  "conversion": {
    "has_booking_widget": false,
    "has_whatsapp_chat": false,
    "has_sticky_cta": false
  }
}`}
                  </pre>
                </div>
              </div>
            )}

            {/* 0-100 Scoring Math */}
            {activeSection === 'scoring-api' && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-white tracking-tight">0–100 Scoring Mathematical Model</h2>
                  <p className="text-sm text-slate-300 leading-relaxed font-sans">
                    The Deterministic Lead Score is computed across 4 dimensions, each contributing up to 25 points:
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#111318] border border-white/[0.08] font-mono text-xs space-y-3">
                  <div className="p-3 rounded-lg bg-[#090A0D] text-emerald-400 font-bold border border-white/[0.06]">
                    Total Score = Technical (25) + SEO (25) + Conversion Deficits (25) + Local Reputation (25)
                  </div>
                  <ul className="space-y-2 text-slate-300 pt-2">
                    <li>&bull; <strong>Technical Health (25):</strong> Fast TTFB (+10), Valid TLS (+10), Responsive Viewport (+5).</li>
                    <li>&bull; <strong>SEO Visibility (25):</strong> Title/Meta (+10), OpenGraph (+8), Schema.org (+7).</li>
                    <li>&bull; <strong>Conversion Deficits (25):</strong> Missing Booking Flow (+10), Missing WhatsApp (+8), Absent Sticky CTA (+7).</li>
                    <li>&bull; <strong>Local Reputation (25):</strong> Review volume and high rating stability (4.5+).</li>
                  </ul>
                </div>
              </div>
            )}

            {/* SSRF Security */}
            {activeSection === 'ssrf-defense' && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-white tracking-tight">SSRF Sandboxing Architecture</h2>
                  <p className="text-sm text-slate-300 leading-relaxed font-sans">
                    Allowing users to crawl external URLs creates Server-Side Request Forgery (SSRF) attack vectors. LeadMap AI deploys a multi-layer defense pipeline:
                  </p>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="p-4 rounded-xl bg-[#111318] border border-white/[0.08] space-y-1">
                    <span className="text-emerald-400 font-bold">1. DNS Resolution & IP Range Blacklist</span>
                    <p className="text-slate-400 font-sans text-xs">
                      Target hostnames are resolved to IP before fetching. IPs in loopback (127.0.0.0/8), RFC 1918 private subnets (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16), and cloud metadata endpoints (169.254.169.254) are rejected immediately.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#111318] border border-white/[0.08] space-y-1">
                    <span className="text-emerald-400 font-bold">2. Redirect Target Re-Inspection</span>
                    <p className="text-slate-400 font-sans text-xs">
                      HTTP 301/302 redirects are limited to a maximum of 3 hops. Each redirect target undergoes full DNS resolution and IP blacklist verification before being contacted.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#111318] border border-white/[0.08] space-y-1">
                    <span className="text-emerald-400 font-bold">3. Strict Payload & Timeout Limits</span>
                    <p className="text-slate-400 font-sans text-xs">
                      Crawler requests enforce a hard 10-second timeout and 5MB payload truncation to eliminate denial-of-service memory exhaustion.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Webhooks */}
            {activeSection === 'webhooks' && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-white tracking-tight">Signed Webhook Events</h2>
                  <p className="text-sm text-slate-300 leading-relaxed font-sans">
                    Receive real-time alerts when leads are discovered, website audits conclude, or outreach drafts are synthesized. Webhooks include a cryptographic HMAC-SHA256 signature header: <code>X-LeadMap-Signature-256</code>.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#111318] border border-white/[0.08] space-y-3">
                  <span className="text-xs font-mono text-emerald-400">Webhook Event: lead.analyzed</span>
                  <pre className="p-3 bg-[#090A0D] rounded-xl text-xs font-mono text-slate-300 overflow-x-auto border border-white/[0.06]">
{`{
  "event": "lead.analyzed",
  "timestamp": "2026-09-21T14:30:00Z",
  "workspace_id": "ws-0191b8a2-...",
  "lead_id": "lead-01",
  "data": {
    "score": 86,
    "highest_opportunity": "Non-responsive viewport & slow TTFB",
    "suggested_service": "Mobile-first speed optimization"
  }
}`}
                  </pre>
                </div>
              </div>
            )}

            {/* Other sections fallback */}
            {activeSection === 'outreach-api' && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-white tracking-tight">Outreach: POST /api/v1/leads/{`{id}`}/outreach</h2>
                  <p className="text-sm text-slate-300 leading-relaxed font-sans">
                    Generates tailored cold emails, WhatsApp opening notes, and LinkedIn connection requests referencing exact website quotes with zero hallucination.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#111318] border border-white/[0.08] space-y-3">
                  <span className="text-xs font-mono text-emerald-400">Channels Supported</span>
                  <pre className="p-3 bg-[#090A0D] rounded-xl text-xs font-mono text-slate-300 overflow-x-auto border border-white/[0.06]">
{`{
  "channels": ["EMAIL", "WHATSAPP", "LINKEDIN"],
  "custom_prompt_angle": "Offer free website speed benchmark audit"
}`}
                  </pre>
                </div>
              </div>
            )}
          </article>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
