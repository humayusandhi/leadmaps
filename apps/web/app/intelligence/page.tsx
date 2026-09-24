'use client';

import * as React from 'react';
import Link from 'next/link';
import { PublicNavbar } from '@/components/shared/PublicNavbar';
import { PublicFooter } from '@/components/shared/PublicFooter';
import { Button } from '@/components/ui/button';
import { DoubleBezelCard } from '@/components/ui/double-bezel-card';
import { Badge } from '@/components/ui/badge';
import { ScoreGauge } from '@/components/ui/score-gauge';
import {
  Sparkles,
  Globe,
  ShieldCheck,
  Zap,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Code2,
  Layers,
  ArrowRight,
  Search,
  ExternalLink,
  Cpu,
  Lock,
  Smartphone,
  Gauge,
  FileCode2,
  Calendar,
  MessageSquare,
  Activity,
  Check,
} from 'lucide-react';

interface AuditPreset {
  id: string;
  name: string;
  category: string;
  domain: string;
  city: string;
  score: number;
  cms: string;
  ttfb: string;
  ssl: boolean;
  mobileReady: boolean;
  openGraph: boolean;
  schemaMarkup: boolean;
  bookingWidget: boolean;
  whatsappChat: boolean;
  stickyCta: boolean;
  opportunityHeadline: string;
  opportunityQuote: string;
  suggestedService: string;
  confidence: 'HIGH' | 'MEDIUM';
}

const AUDIT_PRESETS: AuditPreset[] = [
  {
    id: 'preset-1',
    name: 'Apex Dental Care',
    category: 'Dental Clinic',
    domain: 'apexdentalofaustin.com',
    city: 'Austin, TX',
    score: 84,
    cms: 'WordPress (v6.4)',
    ttfb: '680ms',
    ssl: true,
    mobileReady: true,
    openGraph: false,
    schemaMarkup: false,
    bookingWidget: false,
    whatsappChat: false,
    stickyCta: false,
    opportunityHeadline: 'High Patient Footfall with Severe Booking Funnel Drop-off',
    opportunityQuote: '"Call our front desk during normal business hours 9am-4pm to check availability."',
    suggestedService: 'Online Patient Scheduling System + OpenGraph Re-architecture',
    confidence: 'HIGH',
  },
  {
    id: 'preset-2',
    name: 'Mile High Commercial Roofing',
    category: 'Roofing Contractor',
    domain: 'milehighroofco.com',
    city: 'Denver, CO',
    score: 91,
    cms: 'Custom PHP / Apache',
    ttfb: '1,840ms',
    ssl: true,
    mobileReady: false,
    openGraph: false,
    schemaMarkup: false,
    bookingWidget: false,
    whatsappChat: true,
    stickyCta: false,
    opportunityHeadline: 'Slow TTFB & Non-Responsive Viewport Costing Commercial Bids',
    opportunityQuote: '<meta name="viewport" content="width=1024"> (Rigid desktop viewport detected)',
    suggestedService: 'Mobile-Responsive Rebuild & Speed Optimization Retainer',
    confidence: 'HIGH',
  },
  {
    id: 'preset-3',
    name: 'Vanguard Family Law',
    category: 'Legal Practice',
    domain: 'vanguardlawchicago.com',
    city: 'Chicago, IL',
    score: 72,
    cms: 'Squarespace',
    ttfb: '420ms',
    ssl: true,
    mobileReady: true,
    openGraph: true,
    schemaMarkup: false,
    bookingWidget: false,
    whatsappChat: false,
    stickyCta: true,
    opportunityHeadline: 'Missing LocalBusiness Schema & Absent Automated Case Intake',
    opportunityQuote: 'Zero JSON-LD structured data detected in DOM head hierarchy.',
    suggestedService: 'Local SEO Schema Injection & 24/7 Automated Consultation Intake',
    confidence: 'HIGH',
  },
  {
    id: 'preset-4',
    name: 'Desert Oasis HVAC Specialists',
    category: 'HVAC Services',
    domain: 'desertoasishvac.net',
    city: 'Phoenix, AZ',
    score: 88,
    cms: 'Wix Website Builder',
    ttfb: '950ms',
    ssl: false,
    mobileReady: true,
    openGraph: false,
    schemaMarkup: false,
    bookingWidget: false,
    whatsappChat: false,
    stickyCta: false,
    opportunityHeadline: 'Critical Insecure HTTP Protocol & Missing Emergency Dispatch',
    opportunityQuote: 'Website serves unencrypted HTTP; browser flags "Not Secure" warning.',
    suggestedService: 'SSL/TLS Certificate Migration & Emergency 24/7 Dispatch Portal',
    confidence: 'HIGH',
  },
];

export default function IntelligencePage() {
  const [selectedPreset, setSelectedPreset] = React.useState<AuditPreset>(AUDIT_PRESETS[0]);
  const [customInput, setCustomInput] = React.useState('');
  const [activeTab, setActiveTab] = React.useState<'overview' | 'technical' | 'seo' | 'conversion' | 'ai'>('overview');

  return (
    <div className="min-h-[100dvh] bg-[#090A0D] text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-300">
      <PublicNavbar />

      <main className="max-w-7xl mx-auto px-6 pt-12 pb-24 space-y-24">
        {/* Hero Section */}
        <section className="text-center max-w-4xl mx-auto space-y-6 pt-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-medium tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            4-Tier Observable Intelligence
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white leading-[1.08]">
            Inspect the digital infrastructure of{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
              any local business
            </span>{' '}
            in 15 seconds.
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Never pitch cold with generic agency claims again. LeadMap AI extracts verified technical facts, SEO gaps, conversion leaks, and quote-backed opportunities straight from live business signals.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link href="/finder">
              <Button size="lg" withTrailingIcon className="font-semibold shadow-[0_0_25px_rgba(16,185,129,0.3)]">
                Launch Live Audit Engine
              </Button>
            </Link>
            <a href="#interactive-inspector">
              <Button variant="outline" size="lg">
                Explore Signal Inspector
              </Button>
            </a>
          </div>
        </section>

        {/* Interactive Live Signal Inspector */}
        <section id="interactive-inspector" className="space-y-8 scroll-mt-24">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-white/[0.08] pb-6">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-wider mb-2">
                <Activity className="w-3.5 h-3.5" /> Interactive Sandbox
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Live Observable Audit Dossier
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Select a live prospect example below to see how our crawlers parse and score real-world deficits.
              </p>
            </div>

            {/* Preset Selector Chips */}
            <div className="flex flex-wrap items-center gap-2">
              {AUDIT_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setSelectedPreset(preset)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                    selectedPreset.id === preset.id
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                      : 'bg-[#111318] text-slate-400 hover:text-white border border-white/[0.08]'
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Active Preset Card Dossier */}
          <DoubleBezelCard outerClassName="shadow-2xl">
            {/* Header / Meta Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge provenance="PROVIDER">Google Places</Badge>
                  <span className="text-xs font-mono text-slate-400">&bull; {selectedPreset.category}</span>
                  <span className="text-xs font-mono text-slate-400">&bull; {selectedPreset.city}</span>
                </div>
                <h3 className="text-2xl font-bold text-white tracking-tight">{selectedPreset.name}</h3>
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                  <Globe className="w-3.5 h-3.5" />
                  <span>https://{selectedPreset.domain}</span>
                </div>
              </div>

              <div className="flex items-center gap-5">
                <div className="text-right hidden sm:block">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Opportunity Yield</span>
                  <p className="text-xs font-mono text-emerald-400 font-semibold">High Priority Lead</p>
                </div>
                <ScoreGauge score={selectedPreset.score} size="lg" />
              </div>
            </div>

            {/* Tab Controls */}
            <div className="flex items-center gap-2 border-b border-white/[0.06] pt-4 pb-2 overflow-x-auto">
              {(
                [
                  { id: 'overview', label: 'Dossier Overview', icon: Layers },
                  { id: 'technical', label: 'Technical Health (25pts)', icon: Cpu },
                  { id: 'seo', label: 'SEO Visibility (25pts)', icon: Search },
                  { id: 'conversion', label: 'Conversion Gaps (25pts)', icon: Zap },
                  { id: 'ai', label: 'AI Opportunities', icon: Sparkles },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium font-mono whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'bg-white/[0.1] text-white border border-white/[0.12]'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content Panes */}
            <div className="pt-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* High Opportunity Callout */}
                  <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge provenance="AI_INFERENCE">High-Yield Opportunity</Badge>
                        <span className="text-xs font-mono text-emerald-400 font-medium">Confidence: {selectedPreset.confidence}</span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-500">Model: GPT-4o Structured Mode</span>
                    </div>

                    <h4 className="text-base font-semibold text-white">
                      {selectedPreset.opportunityHeadline}
                    </h4>

                    <div className="p-3 rounded-lg bg-[#090A0D]/80 border border-white/[0.06] font-mono text-xs text-slate-300">
                      <span className="text-emerald-400 font-bold block mb-1 uppercase text-[10px] tracking-wider">Verifiable Evidence from Website:</span>
                      {selectedPreset.opportunityQuote}
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-slate-400">
                        Suggested Agency Service:{' '}
                        <strong className="text-slate-200">{selectedPreset.suggestedService}</strong>
                      </span>
                      <Link href="/finder">
                        <Button variant="primary" size="sm" withTrailingIcon className="text-xs font-mono">
                          Draft Pitch
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* 4 Dimension Summary Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-[#0E1015] border border-white/[0.06] space-y-1.5">
                      <span className="text-xs font-mono text-slate-400">Technical Health</span>
                      <div className="text-xl font-bold font-mono text-white">
                        {selectedPreset.ssl ? '22' : '8'}/25
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {selectedPreset.ssl ? 'SSL Valid • ' + selectedPreset.ttfb : 'Insecure HTTP Protocol'}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-[#0E1015] border border-white/[0.06] space-y-1.5">
                      <span className="text-xs font-mono text-slate-400">SEO Visibility</span>
                      <div className="text-xl font-bold font-mono text-white">
                        {selectedPreset.openGraph ? '20' : '10'}/25
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {selectedPreset.openGraph ? 'Basic tags present' : 'Missing OpenGraph & Schema'}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-[#0E1015] border border-white/[0.06] space-y-1.5">
                      <span className="text-xs font-mono text-slate-400">Conversion Gaps</span>
                      <div className="text-xl font-bold font-mono text-rose-400">
                        {selectedPreset.bookingWidget ? '20' : '24'}/25 Deficit
                      </div>
                      <p className="text-[11px] text-slate-400">No instant booking flow detected</p>
                    </div>

                    <div className="p-4 rounded-xl bg-[#0E1015] border border-white/[0.06] space-y-1.5">
                      <span className="text-xs font-mono text-slate-400">Local Reputation</span>
                      <div className="text-xl font-bold font-mono text-white">20/25</div>
                      <p className="text-[11px] text-slate-400">Strong Google Places reviews</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'technical' && (
                <div className="space-y-4 font-mono text-xs">
                  <div className="p-4 rounded-xl bg-[#0E1015] border border-white/[0.06] space-y-3">
                    <div className="flex items-center justify-between py-1.5 border-b border-white/[0.06]">
                      <span className="text-slate-400 flex items-center gap-2">
                        <Lock className="w-4 h-4 text-emerald-400" /> SSL / TLS Encryption
                      </span>
                      {selectedPreset.ssl ? (
                        <Badge variant="emerald">Valid TLS 1.3 Handshake</Badge>
                      ) : (
                        <Badge variant="rose">Unencrypted HTTP Port 80</Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between py-1.5 border-b border-white/[0.06]">
                      <span className="text-slate-400 flex items-center gap-2">
                        <Gauge className="w-4 h-4 text-emerald-400" /> Time to First Byte (TTFB)
                      </span>
                      <span className="text-white font-bold">{selectedPreset.ttfb}</span>
                    </div>
                    <div className="flex items-center justify-between py-1.5 border-b border-white/[0.06]">
                      <span className="text-slate-400 flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-emerald-400" /> Responsive Viewport
                      </span>
                      {selectedPreset.mobileReady ? (
                        <Badge variant="emerald">Meta Viewport Configured</Badge>
                      ) : (
                        <Badge variant="rose">Desktop-Only Rigid Meta</Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between py-1.5">
                      <span className="text-slate-400 flex items-center gap-2">
                        <FileCode2 className="w-4 h-4 text-emerald-400" /> CMS & Framework Fingerprint
                      </span>
                      <span className="text-slate-200">{selectedPreset.cms}</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'seo' && (
                <div className="space-y-4 font-mono text-xs">
                  <div className="p-4 rounded-xl bg-[#0E1015] border border-white/[0.06] space-y-3">
                    <div className="flex items-center justify-between py-1.5 border-b border-white/[0.06]">
                      <span className="text-slate-400">OpenGraph Social Meta (og:title, og:image)</span>
                      {selectedPreset.openGraph ? (
                        <Badge variant="emerald">Detected</Badge>
                      ) : (
                        <Badge variant="rose">Missing OpenGraph Tags</Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between py-1.5 border-b border-white/[0.06]">
                      <span className="text-slate-400">JSON-LD LocalBusiness Structured Data</span>
                      {selectedPreset.schemaMarkup ? (
                        <Badge variant="emerald">Schema Valid</Badge>
                      ) : (
                        <Badge variant="rose">No Schema Markup Detected</Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between py-1.5">
                      <span className="text-slate-400">Heading Hierarchy (H1 / H2 Discipline)</span>
                      <Badge variant="amber">2 H1 Elements Found</Badge>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'conversion' && (
                <div className="space-y-4 font-mono text-xs">
                  <div className="p-4 rounded-xl bg-[#0E1015] border border-white/[0.06] space-y-3">
                    <div className="flex items-center justify-between py-1.5 border-b border-white/[0.06]">
                      <span className="text-slate-400 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-rose-400" /> Online Booking / Calendar Flow
                      </span>
                      {selectedPreset.bookingWidget ? (
                        <Badge variant="emerald">Scheduling Engine Found</Badge>
                      ) : (
                        <Badge variant="rose">Deficit: No Booking System</Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between py-1.5 border-b border-white/[0.06]">
                      <span className="text-slate-400 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-emerald-400" /> WhatsApp Direct Click-to-Chat
                      </span>
                      {selectedPreset.whatsappChat ? (
                        <Badge variant="emerald">WhatsApp Widget Found</Badge>
                      ) : (
                        <Badge variant="amber">Missing Instant Chat</Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between py-1.5">
                      <span className="text-slate-400 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-emerald-400" /> Above-The-Fold Sticky Lead CTA
                      </span>
                      {selectedPreset.stickyCta ? (
                        <Badge variant="emerald">Prominent CTA Present</Badge>
                      ) : (
                        <Badge variant="rose">Missing Sticky Call-to-Action</Badge>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'ai' && (
                <div className="p-4 rounded-xl bg-[#0E1015] border border-white/[0.06] space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge provenance="AI_INFERENCE">Structured Opportunity Synthesis</Badge>
                  </div>
                  <p className="text-sm font-sans text-slate-300 leading-relaxed">
                    LeadMap AI executes multi-phase prompt chaining with schema constraints. It analyzes all harvested observed facts to formulate a targeted, consultative offer that directly speaks to the business owner’s revenue bottlenecks.
                  </p>
                  <div className="p-3.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20 font-mono text-xs space-y-2">
                    <span className="text-emerald-400 font-bold block">Proposed Cold Outreach Angle:</span>
                    <p className="text-slate-300 font-sans italic">
                      &quot;Hi {selectedPreset.name} team, noticed your Google rating is an impressive 4.8+, but patients attempting to book after-hours encounter your manual &apos;call during 9am-4pm&apos; prompt. We built an automated booking pipeline that converts 30% more weekend traffic...&quot;
                    </p>
                  </div>
                </div>
              )}
            </div>
          </DoubleBezelCard>
        </section>

        {/* 4 Pillars Grid */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl font-bold text-white tracking-tight">
              The 4 Pillars of Observable Intelligence
            </h2>
            <p className="text-sm text-slate-400">
              Every lead card separates hard technical observations from AI inferences, giving you an unshakeable edge during outbound calls.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DoubleBezelCard>
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                  <Globe className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-2">
                  <Badge provenance="PROVIDER">Places API New</Badge>
                  <h3 className="text-lg font-bold text-white">Google Places Integration</h3>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed font-sans">
                  Official Google Maps Platform Places API (New) with FieldMask optimization. Provides accurate business coordinates, phone numbers, localized addresses, Google review sentiment, and operational hours without web scraping risks.
                </p>
              </div>
            </DoubleBezelCard>

            <DoubleBezelCard>
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-2">
                  <Badge provenance="OBSERVED">DOM Harvester</Badge>
                  <h3 className="text-lg font-bold text-white">SSRF-Sandboxed Web Crawler</h3>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed font-sans">
                  Private multi-tier crawler defense pipeline. Validates target IP addresses against RFC 1918, loopback, and cloud metadata (169.254.169.254). Gathers TTFB latency, TLS cipher validation, and HTML structure in under 10 seconds.
                </p>
              </div>
            </DoubleBezelCard>

            <DoubleBezelCard>
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Activity className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-2">
                  <Badge provenance="DERIVED">Deterministic Formula</Badge>
                  <h3 className="text-lg font-bold text-white">0–100 Explainable Score</h3>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed font-sans">
                  Zero black-box AI guessing. Mathematical 0–100 scoring based on 4 balanced 25-point dimensions (Technical Health, SEO Visibility, Conversion Deficits, Local Reputation). Every point is documented in a transparent waterfall.
                </p>
              </div>
            </DoubleBezelCard>

            <DoubleBezelCard>
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-2">
                  <Badge provenance="AI_INFERENCE">Structured Reasoning</Badge>
                  <h3 className="text-lg font-bold text-white">Opportunity Synthesis Engine</h3>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed font-sans">
                  Deep LLM synthesis with strict schema validation. Formulates high-ticket service angles (e.g. Website Redesign, Local SEO, WhatsApp CRM, Speed Optimization) backed by exact quoted excerpts from the prospect&apos;s site.
                </p>
              </div>
            </DoubleBezelCard>
          </div>
        </section>

        {/* CTA Strip */}
        <section className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-[#111318] to-[#0D0F14] border border-white/[0.08] text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Ready to inspect your local market?
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            Run a search in your city. See verified business leads, their technical deficiencies, and AI-inferred pitch angles in seconds.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/finder">
              <Button size="lg" withTrailingIcon className="font-semibold shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                Launch Prospecting Console
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" size="lg">
                View Agency Plans
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
