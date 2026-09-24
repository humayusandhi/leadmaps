'use client';

import * as React from 'react';
import Link from 'next/link';
import { Compass, Sparkles, ShieldCheck, ArrowUpRight, Terminal, Github } from 'lucide-react';

export function PublicFooter() {
  return (
    <footer className="border-t border-white/[0.08] bg-[#090A0D] text-slate-400 text-xs mt-24">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand & Mission Statement */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono font-bold text-sm shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                LM
              </div>
              <span className="font-semibold tracking-tight text-white text-base">
                LeadMap<span className="text-emerald-400 font-mono text-sm">.ai</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              The high-precision sales intelligence platform for elite outbound teams. Turn local business signals into qualified opportunities backed by verifiable proof.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                All Systems Operational
              </div>
              <span className="text-slate-600 font-mono text-xs">v1.0.0</span>
            </div>
          </div>

          {/* Product Column */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-200">
              Product
            </h4>
            <ul className="space-y-2.5 font-sans">
              <li>
                <Link href="/intelligence" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  Intelligence Engine
                </Link>
              </li>
              <li>
                <Link href="/cockpit" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  Split Cockpit
                </Link>
              </li>
              <li>
                <Link href="/finder" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  Live Lead Finder
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-slate-300">App</span>
                </Link>
              </li>
              <li>
                <Link href="/pipeline" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  Pipeline & CRM
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  Agency Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Engineering & Resources */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-200">
              Developers
            </h4>
            <ul className="space-y-2.5 font-sans">
              <li>
                <Link href="/docs" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/docs#api-reference" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  REST API Spec
                </Link>
              </li>
              <li>
                <Link href="/docs#ssrf-security" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  SSRF Defense Architecture
                </Link>
              </li>
              <li>
                <Link href="/docs#webhooks" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  Signed Webhooks
                </Link>
              </li>
              <li>
                <Link href="/docs#scoring-formula" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  0–100 Scoring Math
                </Link>
              </li>
            </ul>
          </div>

          {/* Standards & Provenance */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-200">
              Data Standards
            </h4>
            <ul className="space-y-2.5 font-sans">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]" />
                <span className="text-slate-300">Google Places (New)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                <span className="text-slate-300">Observed Crawler Facts</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                <span className="text-slate-300">Deterministic Scoring</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C084FC]" />
                <span className="text-slate-300">Verified AI Inferences</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 mt-12 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6 font-mono text-[11px] text-slate-500">
            <span>&copy; {new Date().getFullYear()} LeadMap AI Inc. All rights reserved.</span>
            <span>Zero Web Scraping &bull; Official Places API</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <Link href="/docs" className="hover:text-white transition-colors">
              Security
            </Link>
            <span className="text-slate-700">&bull;</span>
            <Link href="/pricing" className="hover:text-white transition-colors">
              Terms
            </Link>
            <span className="text-slate-700">&bull;</span>
            <Link href="/docs" className="hover:text-white transition-colors">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
