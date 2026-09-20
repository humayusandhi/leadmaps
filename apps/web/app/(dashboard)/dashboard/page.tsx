'use client';

import * as React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { DoubleBezelCard } from '@/components/ui/double-bezel-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScoreGauge } from '@/components/ui/score-gauge';
import {
  Search,
  MapPin,
  TrendingUp,
  AlertTriangle,
  Send,
  Zap,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';

interface MockLead {
  id: string;
  name: string;
  category: string;
  address: string;
  website: string;
  score: number;
  phone: string;
  deficits: string[];
  opportunity: string;
}

const SAMPLE_LEADS: MockLead[] = [
  {
    id: 'lead-01',
    name: 'Austin Family & Cosmetic Dentistry',
    category: 'Dentist / Healthcare',
    address: '4201 Westlake Dr, Austin, TX 78746',
    website: 'https://austinfamilycosmeticdental.com',
    score: 92,
    phone: '+1 (512) 345-2980',
    deficits: ['No Online Booking Widget', 'Missing Meta Description', 'Load Time 4.2s'],
    opportunity: 'High-value patient conversion leak: Replace static phone CTA with automated booking system.',
  },
  {
    id: 'lead-02',
    name: 'Lone Star Mechanical HVAC Solutions',
    category: 'HVAC / Home Services',
    address: '8810 Research Blvd, Austin, TX 78758',
    website: 'https://lonestarhvac-austin.com',
    score: 84,
    phone: '+1 (512) 890-1120',
    deficits: ['Unsecured HTTP Assets', 'No LocalBusiness Schema', 'Zero Mobile Click-to-Call'],
    opportunity: 'Emergency service capture deficit: Implement mobile sticky header and Google Schema validation.',
  },
  {
    id: 'lead-03',
    name: 'Apex Orthopedic Rehabilitation Clinic',
    category: 'Physical Therapy / Health',
    address: '1204 S Congress Ave, Austin, TX 78704',
    website: 'https://apexrehab-tx.com',
    score: 76,
    phone: '+1 (512) 671-5500',
    deficits: ['Missing Facebook Pixel', 'Slow Mobile TTFB (1.8s)'],
    opportunity: 'Remarketing blind spot: Install high-intent retargeting and optimize Hero asset weight.',
  },
];

export default function DashboardOverviewPage() {
  const { user, activeWorkspace } = useAuth();
  const [searchQuery, setSearchQuery] = React.useState('Dental Clinics');
  const [searchLocation, setSearchLocation] = React.useState('Austin, TX');
  const [searchRadius, setSearchRadius] = React.useState('15');

  return (
    <div className="space-y-8 animate-in fade-in-0 duration-300">
      {/* Cockpit Header & Welcome Zone */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[11px] font-mono text-emerald-400 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Cockpit Active
            </span>
            <span className="text-xs font-mono text-slate-500">
              Workspace: <strong className="text-slate-300">{activeWorkspace?.name || 'Main'}</strong>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
            Sales Intelligence Cockpit
          </h1>
          <p className="text-sm text-slate-400 font-sans">
            Welcome back, {user?.name || 'Operator'}. Your multi-tenant discovering and scoring engine is running.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="md"
            withTrailingIcon
            onClick={() => {
              const el = document.getElementById('discovery-search-box');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Launch Discovery Run
          </Button>
        </div>
      </div>

      {/* Telemetry KPI Cards (4-Column Bento Double-Bezel Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <DoubleBezelCard innerClassName="p-5 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Qualified Leads
            </span>
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-mono font-bold text-white tracking-tight">
              1,428
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs font-mono text-emerald-400">
              <span>+24.8%</span>
              <span className="text-slate-500">vs. last cycle</span>
            </div>
          </div>
        </DoubleBezelCard>

        {/* Metric 2 */}
        <DoubleBezelCard innerClassName="p-5 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
              High Deficit Flags
            </span>
            <div className="w-8 h-8 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-mono font-bold text-white tracking-tight">
              389
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs font-mono text-rose-400">
              <span>High-Value Targets</span>
              <span className="text-slate-500">identified</span>
            </div>
          </div>
        </DoubleBezelCard>

        {/* Metric 3 */}
        <DoubleBezelCard innerClassName="p-5 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Outreach Pitches
            </span>
            <div className="w-8 h-8 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
              <Send className="w-4 h-4 text-sky-400" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-mono font-bold text-white tracking-tight">
              142
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs font-mono text-sky-400">
              <span>AI Synthesized</span>
              <span className="text-slate-500">ready to sync</span>
            </div>
          </div>
        </DoubleBezelCard>

        {/* Metric 4 */}
        <DoubleBezelCard innerClassName="p-5 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Available Credits
            </span>
            <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-mono font-bold text-white tracking-tight">
              2,500 <span className="text-xs font-normal text-slate-500">/ 5,000</span>
            </div>
            <div className="w-full bg-white/[0.08] h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div className="bg-emerald-500 h-full w-1/2 rounded-full" />
            </div>
          </div>
        </DoubleBezelCard>
      </div>

      {/* Discovery Launcher Bar (Cockpit Search Console) */}
      <DoubleBezelCard
        id="discovery-search-box"
        innerClassName="p-5 md:p-6 space-y-4"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-white font-sans flex items-center gap-2">
              <Search className="w-4 h-4 text-emerald-400" />
              Targeted Geographic Discovery
            </h2>
            <p className="text-xs text-slate-400 font-sans">
              Enter target vertical and geographic epicenter to crawl, audit, and score local businesses.
            </p>
          </div>
          <Badge variant="emerald">Google Places API v1 Supported</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2">
          <div className="md:col-span-5 relative">
            <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
              Business Vertical / Niche
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. Dental Clinics, HVAC Services"
                className="w-full bg-[#181B22] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/50 outline-none"
              />
            </div>
          </div>

          <div className="md:col-span-4 relative">
            <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
              Geographic Epicenter
            </label>
            <div className="relative">
              <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                placeholder="City, State or Coordinates"
                className="w-full bg-[#181B22] border border-white/[0.1] rounded-xl pl-8 pr-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/50 outline-none"
              />
            </div>
          </div>

          <div className="md:col-span-3 flex flex-col justify-end">
            <Button
              variant="primary"
              size="md"
              withTrailingIcon
              className="w-full justify-center h-[38px]"
              onClick={() => alert(`Initiating discovery for "${searchQuery}" in ${searchLocation} (${searchRadius}km radius)...`)}
            >
              Scan Area
            </Button>
          </div>
        </div>
      </DoubleBezelCard>

      {/* High Opportunity Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white font-sans">
              High-Opportunity Lead Feed
            </h2>
            <p className="text-xs text-slate-400 font-sans">
              Ranked deterministically by conversion deficits and service opportunity value
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-slate-300 hover:text-white cursor-pointer">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <span>Score &ge; 75</span>
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {SAMPLE_LEADS.map((lead) => (
            <DoubleBezelCard
              key={lead.id}
              innerClassName="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5"
            >
              {/* Left Column: Business & Deficit Dossier */}
              <div className="space-y-2.5 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold text-white font-sans">
                    {lead.name}
                  </h3>
                  <Badge provenance="OBSERVED" />
                  <Badge provenance="PROVIDER" />
                </div>

                <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-400 font-sans">
                  <span className="text-slate-300 font-medium">{lead.category}</span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    {lead.address}
                  </span>
                  <span>&bull;</span>
                  <a
                    href={lead.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:underline flex items-center gap-1 font-mono text-[11px]"
                  >
                    {lead.website.replace('https://', '')}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Deficits Tags */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {lead.deficits.map((deficit, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/25 text-rose-300 text-[11px] font-mono"
                    >
                      {deficit}
                    </span>
                  ))}
                </div>

                {/* Opportunity Pitch Synopsis */}
                <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] text-xs font-sans text-slate-300 flex items-start gap-2">
                  <Badge provenance="AI_INFERENCE" className="shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{lead.opportunity}</span>
                </div>
              </div>

              {/* Right Column: Deterministic Gauge & Action */}
              <div className="flex lg:flex-col items-center lg:items-end justify-between gap-4 shrink-0 border-t lg:border-t-0 border-white/[0.06] pt-3 lg:pt-0">
                <div className="flex items-center gap-3">
                  <ScoreGauge score={lead.score} size="sm" showLabel={false} />
                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                      {lead.score >= 80 ? 'High Fit' : 'Moderate'}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500">
                      Score: {lead.score}/100
                    </div>
                  </div>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  withTrailingIcon
                  onClick={() => alert(`Opening full dossier for ${lead.name}...`)}
                >
                  Inspect Dossier
                </Button>
              </div>
            </DoubleBezelCard>
          ))}
        </div>
      </div>
    </div>
  );
}
