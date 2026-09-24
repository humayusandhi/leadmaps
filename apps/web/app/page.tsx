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
  MapPin,
  Globe,
  Phone,
  Star,
  ShieldCheck,
  Sparkles,
  Layers,
  Search,
  Zap,
  CreditCard,
  BookOpen,
  ArrowRight,
  Check,
  Cpu,
  Lock,
  Compass,
  Code2,
  Terminal,
  Activity,
  Calendar,
  MessageSquare,
  FileCode2,
} from 'lucide-react';

export default function HomePage() {
  const [billingCycle, setBillingCycle] = React.useState<'monthly' | 'annual'>('annual');
  const [activeCodeTab, setActiveCodeTab] = React.useState<'curl' | 'typescript' | 'python'>('curl');

  const isAnnual = billingCycle === 'annual';
  const discountMultiplier = isAnnual ? 0.8 : 1.0;

  return (
    <div className="min-h-[100dvh] bg-[#090A0D] text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Sticky Floating Island Navigation */}
      <PublicNavbar />

      {/* Hero Section: Asymmetric Split Architecture */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: 7 Cols Typography & Value Proposition */}
          <div className="lg:col-span-7 flex flex-col items-start gap-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-medium tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Observable Sales Intelligence Engine
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.08]">
              Turn local businesses into{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
                qualified opportunities
              </span>{' '}
              with observable proof.
            </h1>

            <p className="text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed">
              Stop pitching generic digital services. LeadMap AI combines official Google Places discovery,
              deterministic website inspection, and structured opportunity detection to find high-yield prospects who genuinely need what you sell.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link href="/finder">
                <Button size="lg" withTrailingIcon className="font-semibold shadow-[0_0_25px_rgba(16,185,129,0.3)]">
                  Start Free Discovery Search
                </Button>
              </Link>
              <Link href="/intelligence">
                <Button variant="outline" size="lg">
                  Inspect Sample Audit
                </Button>
              </Link>
            </div>

            {/* Metrics Ticker */}
            <div className="pt-8 grid grid-cols-3 gap-6 border-t border-white/[0.08] w-full max-w-lg">
              <div>
                <p className="text-2xl font-mono font-bold text-white">0–100</p>
                <p className="text-xs font-mono text-slate-400 uppercase tracking-wide">Deterministic Score</p>
              </div>
              <div>
                <p className="text-2xl font-mono font-bold text-emerald-400">100%</p>
                <p className="text-xs font-mono text-slate-400 uppercase tracking-wide">Official Places API</p>
              </div>
              <div>
                <p className="text-2xl font-mono font-bold text-white">&lt; 15s</p>
                <p className="text-xs font-mono text-slate-400 uppercase tracking-wide">Full Audit Speed</p>
              </div>
            </div>
          </div>

          {/* Right Column: 5 Cols Interactive Cockpit Lead Card Preview */}
          <div className="lg:col-span-5">
            <DoubleBezelCard outerClassName="shadow-2xl">
              <div className="flex items-start justify-between pb-4 border-b border-white/[0.08]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge provenance="PROVIDER">Google Places</Badge>
                    <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> 4.6 (312 reviews)
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">Apex Dental Clinic</h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5 font-mono">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" /> Austin, TX &bull; 12.4 km away
                  </p>
                </div>
                <ScoreGauge score={86} size="md" />
              </div>

              {/* Diagnostic Signals Grid */}
              <div className="py-4 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-emerald-400" /> Website Status
                  </span>
                  <Badge variant="emerald">200 OK (640ms)</Badge>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> HTTPS Security
                  </span>
                  <Badge variant="emerald">Valid TLS 1.3</Badge>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-rose-400" /> Online Scheduling
                  </span>
                  <Badge variant="rose">Not Detected</Badge>
                </div>
              </div>

              {/* Detected Opportunity Highlight */}
              <div className="p-3.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-xs mt-1">
                <div className="flex items-center gap-2 text-emerald-400 font-mono font-medium mb-1">
                  <Badge provenance="AI_INFERENCE">High Opportunity</Badge>
                </div>
                <p className="text-slate-300 font-sans leading-relaxed">
                  High patient volume (312 reviews) with active mobile traffic, but lacking instant online appointment booking flow.
                </p>
              </div>

              {/* Card Actions */}
              <div className="pt-4 mt-4 border-t border-white/[0.08] flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-500">Workspace: Austin Dental Q3</span>
                <Link href="/finder">
                  <Button variant="primary" size="sm" withTrailingIcon>
                    Draft Outreach
                  </Button>
                </Link>
              </div>
            </DoubleBezelCard>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* SECTION 1: INTELLIGENCE ENGINE (#features) */}
      {/* ===================================================================== */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-24 scroll-mt-24 border-t border-white/[0.08]">
        <div className="space-y-16">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> Observable Intelligence
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                Inspect every digital flaw. Every conversion leak. Zero guesswork.
              </h2>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed font-sans">
                Our crawler analyzes real website DOMs in under 15 seconds, discovering high-margin technical deficits you can pitch with undeniable proof.
              </p>
            </div>

            <Link href="/intelligence">
              <Button variant="outline" size="sm" withTrailingIcon className="font-mono text-xs">
                Explore Full Intelligence Page
              </Button>
            </Link>
          </div>

          {/* 4-Pillar Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Bento Card 1 */}
            <DoubleBezelCard>
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                  <Globe className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <Badge provenance="PROVIDER">Google Places (New)</Badge>
                  <h3 className="text-base font-bold text-white pt-1">Official Places Radar</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  Official Google Maps Platform API with zero web scraping. Exact phone, address, coordinates, review counts, and verified URLs.
                </p>
                <div className="pt-2 border-t border-white/[0.06] font-mono text-[11px] text-sky-400 flex items-center gap-1">
                  <span>100% TOS-Compliant</span>
                </div>
              </div>
            </DoubleBezelCard>

            {/* Bento Card 2 */}
            <DoubleBezelCard>
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <Badge provenance="OBSERVED">DOM Harvester</Badge>
                  <h3 className="text-base font-bold text-white pt-1">SSRF-Sandboxed Harvester</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  Multi-tier SSRF protection blocking RFC 1918 and metadata endpoints. Gathers TTFB latency, TLS handshake, and mobile viewport.
                </p>
                <div className="pt-2 border-t border-white/[0.06] font-mono text-[11px] text-emerald-400 flex items-center gap-1">
                  <span>&lt; 680ms TTFB Detection</span>
                </div>
              </div>
            </DoubleBezelCard>

            {/* Bento Card 3 */}
            <DoubleBezelCard>
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                  <Zap className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <Badge provenance="OBSERVED">Deficit Scanner</Badge>
                  <h3 className="text-base font-bold text-white pt-1">Conversion & SEO Leaks</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  Scans for missing booking flows, absent WhatsApp chat widgets, non-existent OpenGraph tags, and missing JSON-LD schema markup.
                </p>
                <div className="pt-2 border-t border-white/[0.06] font-mono text-[11px] text-rose-400 flex items-center gap-1">
                  <span>Pinpoints Agency Upsells</span>
                </div>
              </div>
            </DoubleBezelCard>

            {/* Bento Card 4 */}
            <DoubleBezelCard>
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <Badge provenance="AI_INFERENCE">LLM Reasoning</Badge>
                  <h3 className="text-base font-bold text-white pt-1">AI Opportunity Quotes</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  Quotes verbatim text from the prospect&apos;s website as verifiable evidence to generate cold pitches that convert 3x higher.
                </p>
                <div className="pt-2 border-t border-white/[0.06] font-mono text-[11px] text-purple-400 flex items-center gap-1">
                  <span>Zero Hallucination Guarantee</span>
                </div>
              </div>
            </DoubleBezelCard>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* SECTION 2: PROSPECTING COCKPIT (#cockpit) */}
      {/* ===================================================================== */}
      <section id="cockpit" className="max-w-7xl mx-auto px-6 py-24 scroll-mt-24 border-t border-white/[0.08]">
        <div className="space-y-16">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono uppercase tracking-wider">
                <Layers className="w-3.5 h-3.5" /> High-Velocity Interface
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                The 50/50 Dual-Pane Prospecting Cockpit
              </h2>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed font-sans">
                A purpose-built workstation for outbound closers. Seamlessly navigate metropolitan territories, inspect live technical diagnostics, and save leads into your CRM pipeline.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/cockpit">
                <Button variant="outline" size="sm" className="font-mono text-xs">
                  Inspect Architecture
                </Button>
              </Link>
              <Link href="/finder">
                <Button variant="primary" size="sm" withTrailingIcon className="font-mono text-xs">
                  Launch Live Cockpit
                </Button>
              </Link>
            </div>
          </div>

          {/* Split Cockpit Preview Frame */}
          <div className="rounded-3xl p-4 sm:p-6 bg-[#111318] border border-white/[0.08] shadow-[0_0_50px_rgba(0,0,0,0.8)] space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 px-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 font-mono text-xs text-slate-400">
                  LeadMap AI Cockpit &bull; Denver, CO (15km radius)
                </span>
              </div>
              <span className="font-mono text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                142 Verified Opportunities Discovered
              </span>
            </div>

            {/* Split Mockup */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[380px]">
              {/* Left 6 Cols: Lead Table Snippet */}
              <div className="lg:col-span-6 space-y-2.5">
                {[
                  { name: 'Apex Commercial Roofing', category: 'Roofing Contractor', score: 86, tag: 'Non-responsive mobile viewport', rating: 4.9 },
                  { name: 'Front Range Dental Studio', category: 'Dental Clinic', score: 82, tag: 'Missing online booking engine', rating: 4.8 },
                  { name: 'Mile High Legal Partners', category: 'Law Firm', score: 79, tag: 'Insecure HTTP port 80 detected', rating: 4.7 },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border transition-all ${
                      idx === 0
                        ? 'bg-[#181B22] border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
                        : 'bg-[#0E1015] border-white/[0.06]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 uppercase">{item.category}</span>
                        <h4 className="text-sm font-bold text-white">{item.name}</h4>
                        <div className="flex items-center gap-2 mt-1 font-mono text-xs">
                          <span className="text-amber-400 flex items-center gap-1">
                            <Star className="w-3 h-3 fill-amber-400" /> {item.rating}
                          </span>
                          <span className="text-slate-600">&bull;</span>
                          <span className="text-rose-400">{item.tag}</span>
                        </div>
                      </div>
                      <ScoreGauge score={item.score} size="sm" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Right 6 Cols: Dark Vector Radar Map Simulation */}
              <div className="lg:col-span-6 rounded-2xl bg-[#090A0D] border border-white/[0.08] relative overflow-hidden flex flex-col items-center justify-center p-6">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/15 via-transparent to-transparent pointer-events-none" />
                <div className="w-56 h-56 rounded-full border border-emerald-500/20 animate-pulse flex items-center justify-center">
                  <div className="w-36 h-36 rounded-full border border-emerald-500/30 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.6)]">
                      <MapPin className="w-5 h-5 text-emerald-400" />
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-center z-10 space-y-1">
                  <p className="font-mono text-xs font-bold text-white">CartoDB Dark Matter Radar Sync</p>
                  <p className="text-[11px] font-mono text-slate-500">
                    Bidirectional Click-to-Center &bull; Leaflet Dynamic Clustering
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* SECTION 3: PRICING (#pricing) */}
      {/* ===================================================================== */}
      <section id="pricing" className="max-w-7xl mx-auto px-6 py-24 scroll-mt-24 border-t border-white/[0.08]">
        <div className="space-y-16">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono uppercase tracking-wider">
              <CreditCard className="w-3.5 h-3.5" /> Predictable Unit Economics
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              One closed client covers your entire year
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed font-sans">
              Simple plans with generous monthly search credits, full technical signals, and zero seat tax.
            </p>

            {/* Billing toggle */}
            <div className="flex items-center justify-center pt-2">
              <div className="flex items-center p-1 rounded-full bg-[#111318] border border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-4 py-1.5 rounded-full text-xs font-mono font-medium transition-all ${
                    !isAnnual ? 'bg-white/[0.1] text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Monthly Billing
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle('annual')}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-mono font-medium transition-all ${
                    isAnnual ? 'bg-emerald-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>Annual Billing</span>
                  <span className="px-1.5 py-0.2 rounded bg-black/30 text-[10px]">SAVE 20%</span>
                </button>
              </div>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {/* Free */}
            <div className="p-6 rounded-2xl bg-[#111318] border border-white/[0.08] flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Free Explorer</h3>
                  <p className="text-xs text-slate-400 mt-1 font-sans">Test discovery in your home city.</p>
                  <div className="pt-3 flex items-baseline gap-1">
                    <span className="text-3xl font-bold font-mono text-white">$0</span>
                    <span className="text-xs font-mono text-slate-400">/ mo</span>
                  </div>
                  <span className="text-xs font-mono text-emerald-400 font-semibold block mt-1">
                    50 credits / month
                  </span>
                </div>
                <div className="space-y-2 pt-4 border-t border-white/[0.06] text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Google Places discovery</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Basic website status check</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Standard CSV export</span>
                  </div>
                </div>
              </div>
              <Link href="/register" className="pt-6">
                <Button variant="outline" size="sm" className="w-full text-xs font-mono">
                  Get Started Free
                </Button>
              </Link>
            </div>

            {/* Starter */}
            <div className="p-6 rounded-2xl bg-[#111318] border border-white/[0.08] flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Starter Prospector</h3>
                  <p className="text-xs text-slate-400 mt-1 font-sans">For independent growth consultants.</p>
                  <div className="pt-3 flex items-baseline gap-1">
                    <span className="text-3xl font-bold font-mono text-white">
                      ${Math.round(29 * discountMultiplier)}
                    </span>
                    <span className="text-xs font-mono text-slate-400">/ mo</span>
                  </div>
                  <span className="text-xs font-mono text-emerald-400 font-semibold block mt-1">
                    500 credits &bull; 3 seats
                  </span>
                </div>
                <div className="space-y-2 pt-4 border-t border-white/[0.06] text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Full DOM harvester (SSL, TTFB)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>AI cold email & WhatsApp pitch</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>RFC 4180 CSV export</span>
                  </div>
                </div>
              </div>
              <Link href="/register?plan=starter" className="pt-6">
                <Button variant="outline" size="sm" className="w-full text-xs font-mono">
                  Choose Starter
                </Button>
              </Link>
            </div>

            {/* Growth (Most Popular) */}
            <div className="relative p-6 rounded-2xl bg-[#141820] border-2 border-emerald-500/60 shadow-[0_0_35px_rgba(16,185,129,0.15)] flex flex-col justify-between scale-[1.03] z-10">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-mono text-[10px] font-bold tracking-wider uppercase shadow flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Most Popular
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Growth Agency</h3>
                  <p className="text-xs text-slate-400 mt-1 font-sans">High-velocity outbound machine.</p>
                  <div className="pt-3 flex items-baseline gap-1">
                    <span className="text-3xl font-bold font-mono text-white">
                      ${Math.round(69 * discountMultiplier)}
                    </span>
                    <span className="text-xs font-mono text-slate-400">/ mo</span>
                  </div>
                  <span className="text-xs font-mono text-emerald-400 font-semibold block mt-1">
                    2,000 credits &bull; 10 seats
                  </span>
                </div>
                <div className="space-y-2 pt-4 border-t border-white/[0.06] text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Deterministic 0–100 score waterfall</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>AI opportunities with quoted proof</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>RiffCRM & Webhook direct sync</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Custom lead lists & filters</span>
                  </div>
                </div>
              </div>
              <Link href="/register?plan=growth" className="pt-6">
                <Button variant="primary" size="sm" withTrailingIcon className="w-full text-xs font-mono">
                  Choose Growth
                </Button>
              </Link>
            </div>

            {/* Scale */}
            <div className="p-6 rounded-2xl bg-[#111318] border border-white/[0.08] flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Scale Enterprise</h3>
                  <p className="text-xs text-slate-400 mt-1 font-sans">For SDR pods and large agencies.</p>
                  <div className="pt-3 flex items-baseline gap-1">
                    <span className="text-3xl font-bold font-mono text-white">
                      ${Math.round(149 * discountMultiplier)}
                    </span>
                    <span className="text-xs font-mono text-slate-400">/ mo</span>
                  </div>
                  <span className="text-xs font-mono text-emerald-400 font-semibold block mt-1">
                    6,000 credits &bull; Unlimited
                  </span>
                </div>
                <div className="space-y-2 pt-4 border-t border-white/[0.06] text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Dedicated crawler IP rotation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Automated S3 daily export feed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Dedicated Slack support SLA</span>
                  </div>
                </div>
              </div>
              <Link href="/register?plan=scale" className="pt-6">
                <Button variant="outline" size="sm" className="w-full text-xs font-mono">
                  Choose Scale
                </Button>
              </Link>
            </div>
          </div>

          <div className="text-center pt-2">
            <Link href="/pricing" className="inline-flex items-center gap-2 text-xs font-mono text-emerald-400 hover:text-emerald-300 transition-colors">
              <span>View full feature comparison matrix & ROI calculator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* SECTION 4: DOCUMENTATION (#docs) */}
      {/* ===================================================================== */}
      <section id="docs" className="max-w-7xl mx-auto px-6 py-24 scroll-mt-24 border-t border-white/[0.08]">
        <div className="space-y-16">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono uppercase tracking-wider">
                <BookOpen className="w-3.5 h-3.5" /> Developer-First Architecture
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                RESTful Endpoints & Cryptographically Signed Webhooks
              </h2>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed font-sans">
                Integrate LeadMap AI discovery and intelligence straight into your custom CRM, enrichment pipelines, or outbound automations.
              </p>
            </div>

            <Link href="/docs">
              <Button variant="outline" size="sm" withTrailingIcon className="font-mono text-xs">
                Browse Full Documentation
              </Button>
            </Link>
          </div>

          {/* Interactive Code Preview Block */}
          <div className="p-6 rounded-3xl bg-[#111318] border border-white/[0.08] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2 font-mono text-xs">
                {(['curl', 'typescript', 'python'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveCodeTab(tab)}
                    className={`px-3 py-1.5 rounded-lg uppercase tracking-wider transition-all ${
                      activeCodeTab === tab
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <span className="font-mono text-xs text-slate-500">Endpoint: POST /api/v1/searches</span>
            </div>

            <div className="p-4 rounded-xl bg-[#090A0D] border border-white/[0.06] font-mono text-xs text-slate-300 overflow-x-auto">
              {activeCodeTab === 'curl' && (
                <pre>{`curl -X POST "https://api.leadmap.ai/api/v1/searches" \\
  -H "Authorization: Bearer \${LEADMAP_API_KEY}" \\
  -H "X-Workspace-ID: ws-0191b8a2-f81d-7212-9844-cb801b7a7051" \\
  -H "Content-Type: application/json" \\
  -d '{
    "category": "Roofing Contractors",
    "location": "Denver, CO",
    "latitude": 39.7392,
    "longitude": -104.9903,
    "radius_km": 15
  }'`}</pre>
              )}

              {activeCodeTab === 'typescript' && (
                <pre>{`import { LeadMapClient } from '@leadmap/sdk';

const client = new LeadMapClient({
  apiKey: process.env.LEADMAP_API_KEY!,
  workspaceId: 'ws-0191b8a2-f81d-7212-9844-cb801b7a7051',
});

// Discover local businesses and harvest DOM signals
const search = await client.searches.create({
  category: 'Roofing Contractors',
  location: 'Denver, CO',
  radiusKm: 15,
});

console.log(\`Discovered \${search.businesses.length} verified opportunities!\`);`}</pre>
              )}

              {activeCodeTab === 'python' && (
                <pre>{`import os
import requests

url = "https://api.leadmap.ai/api/v1/searches"
headers = {
    "Authorization": f"Bearer {os.environ['LEADMAP_API_KEY']}",
    "X-Workspace-ID": "ws-0191b8a2-f81d-7212-9844-cb801b7a7051",
    "Content-Type": "application/json",
}
payload = {
    "category": "Roofing Contractors",
    "location": "Denver, CO",
    "radius_km": 15,
}

response = requests.post(url, json=payload, headers=headers)
print("Discovery Results:", response.json())`}</pre>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Final Conversion Strip */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="p-8 sm:p-14 rounded-3xl bg-gradient-to-b from-[#111318] to-[#0D0F14] border border-white/[0.08] text-center space-y-6">
          <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight">
            Turn your local territory into qualified pipeline today.
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            Discover local businesses, analyze websites, and identify high-value service opportunities backed by observable proof.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link href="/finder">
              <Button size="lg" withTrailingIcon className="font-semibold shadow-[0_0_25px_rgba(16,185,129,0.3)]">
                Start Free Discovery Search
              </Button>
            </Link>
            <Link href="/docs">
              <Button variant="outline" size="lg">
                View API Documentation
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <PublicFooter />
    </div>
  );
}
