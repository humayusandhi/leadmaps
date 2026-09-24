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
  Layers,
  MapPin,
  Search,
  Filter,
  Sliders,
  Sparkles,
  Star,
  Globe,
  Phone,
  ArrowRight,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Maximize2,
  Keyboard,
  ListFilter,
  Check,
  MousePointerClick,
  Compass,
} from 'lucide-react';

interface MockCockpitItem {
  id: string;
  name: string;
  category: string;
  address: string;
  rating: number;
  reviews: number;
  score: number;
  phone: string;
  website: string;
  distance: string;
  lat: number;
  lng: number;
  status: 'NEW' | 'RESEARCHED' | 'QUALIFIED';
  flag: string;
}

const COCKPIT_PROSPECTS: MockCockpitItem[] = [
  {
    id: 'lead-01',
    name: 'Mile High Commercial Roofing',
    category: 'Roofing Contractor',
    address: '1420 Blake St, Denver, CO 80202',
    rating: 4.9,
    reviews: 142,
    score: 86,
    phone: '+1 303-555-0142',
    website: 'https://milehighroofco.com',
    distance: '1.4 km',
    lat: 39.7512,
    lng: -104.9982,
    status: 'QUALIFIED',
    flag: 'Non-responsive viewport & slow TTFB',
  },
  {
    id: 'lead-02',
    name: 'Front Range Dental Studio',
    category: 'Dental Clinic',
    address: '890 17th St, Denver, CO 80202',
    rating: 4.8,
    reviews: 89,
    score: 82,
    phone: '+1 303-555-0189',
    website: 'https://frontrangedental.com',
    distance: '2.1 km',
    lat: 39.7485,
    lng: -104.993,
    status: 'RESEARCHED',
    flag: 'No automated online patient booking',
  },
  {
    id: 'lead-03',
    name: 'Apex Mechanical & HVAC',
    category: 'HVAC Specialists',
    address: '2240 Walnut St, Denver, CO 80205',
    rating: 4.7,
    reviews: 64,
    score: 79,
    phone: '+1 303-555-0224',
    website: 'https://apexmechanicaldenver.com',
    distance: '3.6 km',
    lat: 39.756,
    lng: -104.987,
    status: 'NEW',
    flag: 'Missing OpenGraph & LocalBusiness schema',
  },
  {
    id: 'lead-04',
    name: 'Capitol Hill Family Law',
    category: 'Legal Practice',
    address: '1150 Logan St, Denver, CO 80203',
    rating: 4.6,
    reviews: 51,
    score: 74,
    phone: '+1 303-555-0115',
    website: 'https://caphilllegal.com',
    distance: '4.2 km',
    lat: 39.734,
    lng: -104.982,
    status: 'NEW',
    flag: 'No mobile WhatsApp click-to-chat',
  },
];

export default function CockpitPage() {
  const [selectedId, setSelectedId] = React.useState<string>(COCKPIT_PROSPECTS[0].id);
  const [radiusFilter, setRadiusFilter] = React.useState(15);
  const [minScore, setMinScore] = React.useState(75);
  const [activeCategory, setActiveCategory] = React.useState<string>('ALL');

  const selectedLead = COCKPIT_PROSPECTS.find((p) => p.id === selectedId) || COCKPIT_PROSPECTS[0];

  const filteredLeads = COCKPIT_PROSPECTS.filter((lead) => {
    if (activeCategory !== 'ALL' && lead.category !== activeCategory) return false;
    if (lead.score < minScore) return false;
    return true;
  });

  return (
    <div className="min-h-[100dvh] bg-[#090A0D] text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-300">
      <PublicNavbar />

      <main className="max-w-7xl mx-auto px-6 pt-12 pb-24 space-y-24">
        {/* Hero Header */}
        <section className="text-center max-w-4xl mx-auto space-y-6 pt-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-medium tracking-wider uppercase">
            <Layers className="w-3.5 h-3.5" />
            50/50 Split-Cockpit Architecture
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white leading-[1.08]">
            The high-velocity sales console{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
              built for outbound closers.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Zero clunky modal switching. The LeadMap Cockpit marries interactive CartoDB dark vector geospatial mapping with instantaneous lead diagnostics, scoring waterfalls, and one-click outreach.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link href="/finder">
              <Button size="lg" withTrailingIcon className="font-semibold shadow-[0_0_25px_rgba(16,185,129,0.3)]">
                Open Live Cockpit App
              </Button>
            </Link>
            <Link href="/pipeline">
              <Button variant="outline" size="lg">
                View Lead Pipeline
              </Button>
            </Link>
          </div>
        </section>

        {/* Interactive Split Cockpit Simulator */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-white/[0.08] pb-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-wider mb-1">
                <MousePointerClick className="w-3.5 h-3.5" /> Interactive Sandbox
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Simulated 50/50 Dual-Pane Interface
              </h2>
              <p className="text-xs text-slate-400">
                Click leads on the left to focus inspection; adjust radius and score filters in real-time.
              </p>
            </div>

            {/* Quick stats */}
            <div className="flex items-center gap-4 font-mono text-xs">
              <span className="text-slate-400">
                Found in Denver, CO: <strong className="text-white">{filteredLeads.length} leads</strong>
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Avg Score: 82
              </span>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="p-4 rounded-2xl bg-[#111318] border border-white/[0.08] flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
            {/* Category pills */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-slate-500 uppercase text-[10px] tracking-wider">Sector:</span>
              {['ALL', 'Roofing Contractor', 'Dental Clinic', 'HVAC Specialists', 'Legal Practice'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    activeCategory === cat
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-white/[0.04] text-slate-400 hover:text-white border border-white/[0.06]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Range controls */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Radius:</span>
                <span className="text-white font-bold">{radiusFilter} km</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Min Score:</span>
                <span className="text-emerald-400 font-bold">{minScore}+</span>
              </div>
            </div>
          </div>

          {/* Split 50/50 Simulator Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[540px]">
            {/* Left 6 Columns: Interactive Lead List */}
            <div className="lg:col-span-6 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
                <span>Prospects Matching Criteria ({filteredLeads.length})</span>
                <span>Sorted by Deterministic Score</span>
              </div>

              <div className="space-y-3 max-h-[540px] overflow-y-auto pr-1">
                {filteredLeads.map((lead) => {
                  const isSelected = lead.id === selectedId;

                  return (
                    <div
                      key={lead.id}
                      onClick={() => setSelectedId(lead.id)}
                      className={`cursor-pointer p-4 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-[#181B22] border-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500'
                          : 'bg-[#111318] border-white/[0.08] hover:border-white/[0.16] hover:bg-[#14171E]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge provenance="PROVIDER">Google Places</Badge>
                            <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {lead.rating} ({lead.reviews})
                            </span>
                          </div>
                          <h4 className="text-base font-bold text-white tracking-tight">{lead.name}</h4>
                          <p className="text-xs font-mono text-slate-400 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-500" /> {lead.address} • {lead.distance}
                          </p>
                        </div>
                        <ScoreGauge score={lead.score} size="sm" />
                      </div>

                      {/* Primary Deficit Snippet */}
                      <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono">
                        <span className="text-rose-400 flex items-center gap-1.5 truncate">
                          <Zap className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{lead.flag}</span>
                        </span>
                        <span className="text-[11px] text-slate-400 uppercase">{lead.status}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right 6 Columns: Simulated Cockpit Map & Detail Inspection Drawer */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              {/* Radar Map Canvas Simulation */}
              <div className="relative h-64 rounded-2xl bg-[#090A0D] border border-white/[0.1] overflow-hidden flex items-center justify-center p-4">
                {/* Radial Grid Pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
                <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

                {/* Radar sweep line */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-48 rounded-full border border-emerald-500/20 animate-ping opacity-25" />
                  <div className="w-80 h-80 rounded-full border border-white/[0.08]" />
                </div>

                {/* Center Pulse Pin */}
                <div className="relative z-10 flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                    <MapPin className="w-5 h-5 text-emerald-400" />
                  </div>
                  <span className="font-mono text-[11px] font-bold text-white bg-[#111318]/90 px-2 py-0.5 rounded border border-white/[0.1]">
                    {selectedLead.name}
                  </span>
                </div>

                {/* Top overlay badge */}
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#111318]/80 backdrop-blur-md border border-white/[0.08] font-mono text-[10px] text-slate-300 flex items-center gap-1.5">
                  <Compass className="w-3 h-3 text-emerald-400" />
                  CartoDB Dark Matter &bull; 39.75° N, -104.99° W
                </div>

                <div className="absolute bottom-3 right-3 font-mono text-[10px] text-slate-500">
                  Click-to-Center Enabled
                </div>
              </div>

              {/* Selected Lead Live Inspection Card */}
              <DoubleBezelCard outerClassName="flex-1">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                        Selected Dossier
                      </span>
                      <h3 className="text-lg font-bold text-white">{selectedLead.name}</h3>
                    </div>
                    <Link href={`/leads/${selectedLead.id}`}>
                      <Button variant="outline" size="sm" className="text-xs font-mono">
                        Full Dossier
                      </Button>
                    </Link>
                  </div>

                  {/* Signals List */}
                  <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                    <div className="p-2.5 rounded-lg bg-[#0E1015] border border-white/[0.06]">
                      <span className="text-slate-500 block text-[10px]">VERIFIED PHONE</span>
                      <span className="text-slate-200 font-semibold">{selectedLead.phone}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#0E1015] border border-white/[0.06]">
                      <span className="text-slate-500 block text-[10px]">WEBSITE DOMAIN</span>
                      <span className="text-emerald-400 font-semibold truncate block">
                        {selectedLead.website.replace('https://', '')}
                      </span>
                    </div>
                  </div>

                  {/* Opportunity Callout */}
                  <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-xs font-mono">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold mb-1">
                      <Sparkles className="w-3.5 h-3.5" /> High Margin Service Gap
                    </div>
                    <p className="text-slate-300 font-sans text-xs">
                      {selectedLead.flag}. Lead qualifies for high-ticket website modernization retainer.
                    </p>
                  </div>

                  {/* Action Bar */}
                  <div className="pt-2 flex items-center gap-3">
                    <Link href="/finder" className="flex-1">
                      <Button variant="primary" size="sm" withTrailingIcon className="w-full text-xs font-mono">
                        Draft AI Outreach
                      </Button>
                    </Link>
                    <Link href="/pipeline">
                      <Button variant="outline" size="sm" className="text-xs font-mono">
                        Save to CRM
                      </Button>
                    </Link>
                  </div>
                </div>
              </DoubleBezelCard>
            </div>
          </div>
        </section>

        {/* 3 Pillars of Cockpit Velocity */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DoubleBezelCard>
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">1. Sub-Second Scans</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Scan 1km to 50km radii around any metropolitan hub in under 2 seconds. Real-time deduplication prevents wasted spend on duplicates.
              </p>
            </div>
          </DoubleBezelCard>

          <DoubleBezelCard>
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">2. Auto-Enrichment</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Background workers crawl discovered websites, verify SSL certificates, measure TTFB speeds, and isolate conversion bottlenecks.
              </p>
            </div>
          </DoubleBezelCard>

          <DoubleBezelCard>
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">3. Outreach Drafting</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Generate cold emails, WhatsApp opening notes, and LinkedIn connection requests referencing exact website quotes with zero hallucination.
              </p>
            </div>
          </DoubleBezelCard>
        </section>

        {/* Keyboard Shortcuts Section */}
        <section className="p-8 rounded-3xl bg-[#111318] border border-white/[0.08] space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Built for High-Velocity SDR Hotkeys</h3>
              <p className="text-xs text-slate-400">Navigate and qualify hundreds of local businesses without touching your mouse.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
            <div className="p-3 rounded-xl bg-[#090A0D] border border-white/[0.06] flex items-center justify-between">
              <span className="text-slate-400">Focus Search</span>
              <kbd className="px-2 py-1 rounded bg-white/[0.08] text-white border border-white/[0.1] text-[11px]">/</kbd>
            </div>
            <div className="p-3 rounded-xl bg-[#090A0D] border border-white/[0.06] flex items-center justify-between">
              <span className="text-slate-400">Next Lead</span>
              <kbd className="px-2 py-1 rounded bg-white/[0.08] text-white border border-white/[0.1] text-[11px]">J</kbd>
            </div>
            <div className="p-3 rounded-xl bg-[#090A0D] border border-white/[0.06] flex items-center justify-between">
              <span className="text-slate-400">Previous Lead</span>
              <kbd className="px-2 py-1 rounded bg-white/[0.08] text-white border border-white/[0.1] text-[11px]">K</kbd>
            </div>
            <div className="p-3 rounded-xl bg-[#090A0D] border border-white/[0.06] flex items-center justify-between">
              <span className="text-slate-400">Save to Pipeline</span>
              <kbd className="px-2 py-1 rounded bg-white/[0.08] text-white border border-white/[0.1] text-[11px]">S</kbd>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="text-center space-y-6 pt-6">
          <h2 className="text-3xl font-bold text-white">Experience the Split Cockpit in action</h2>
          <div className="flex justify-center gap-4">
            <Link href="/finder">
              <Button size="lg" withTrailingIcon className="font-semibold shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                Launch Live Cockpit
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
