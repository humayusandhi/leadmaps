import * as React from 'react';
import { Button } from '@/components/ui/button';
import { DoubleBezelCard } from '@/components/ui/double-bezel-card';
import { Badge } from '@/components/ui/badge';
import { ScoreGauge } from '@/components/ui/score-gauge';
import { MapPin, Globe, Phone, Star, ShieldCheck, Sparkles } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-[100dvh] bg-[#090A0D] text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Floating Island Navigation */}
      <header className="sticky top-5 z-50 max-w-6xl mx-auto px-4">
        <nav className="flex items-center justify-between px-6 py-3 rounded-full bg-[#111318]/85 backdrop-blur-xl border border-white/[0.08] shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono font-bold text-sm">
              LM
            </div>
            <span className="font-semibold tracking-tight text-white text-base">
              LeadMap<span className="text-emerald-400">.ai</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-6 text-sm text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Intelligence</a>
            <a href="#cockpit" className="hover:text-white transition-colors">Cockpit</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#docs" className="hover:text-white transition-colors">Documentation</a>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="secondary" size="sm">
              Sign In
            </Button>
            <Button variant="primary" size="sm" withTrailingIcon>
              Launch Console
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section: Asymmetric Split Architecture */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: 7 Cols Typography & Value Proposition */}
          <div className="lg:col-span-7 flex flex-col items-start gap-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-medium tracking-wider uppercase">
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
              <Button size="lg" withTrailingIcon className="font-semibold">
                Start Free Discovery Search
              </Button>
              <Button variant="outline" size="lg">
                Inspect Sample Audit
              </Button>
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
                    <MapPin className="w-3.5 h-3.5 text-slate-500" /> Austin, TX • 12.4 km away
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
                  <Badge variant="emerald">Valid TLS</Badge>
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
                <Button variant="primary" size="sm" withTrailingIcon>
                  Draft Outreach
                </Button>
              </div>
            </DoubleBezelCard>
          </div>
        </div>
      </section>
    </main>
  );
}
