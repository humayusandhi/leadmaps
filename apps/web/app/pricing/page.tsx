'use client';

import * as React from 'react';
import Link from 'next/link';
import { PublicNavbar } from '@/components/shared/PublicNavbar';
import { PublicFooter } from '@/components/shared/PublicFooter';
import { Button } from '@/components/ui/button';
import { DoubleBezelCard } from '@/components/ui/double-bezel-card';
import { Badge } from '@/components/ui/badge';
import {
  CreditCard,
  Sparkles,
  Check,
  HelpCircle,
  Zap,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  Calculator,
  ChevronDown,
} from 'lucide-react';

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = React.useState<'monthly' | 'annual'>('annual');
  const [currency, setCurrency] = React.useState<'USD' | 'INR'>('USD');
  const [closedDeals, setClosedDeals] = React.useState<number>(2);
  const [retainerAmount, setRetainerAmount] = React.useState<number>(1500);
  const [openFaq, setOpenFaq] = React.useState<number | null>(null);

  const isAnnual = billingCycle === 'annual';
  const discountMultiplier = isAnnual ? 0.8 : 1.0;

  const plans = [
    {
      id: 'free',
      name: 'Free Explorer',
      description: 'Ideal for trying out local business discovery in your city.',
      priceUSD: 0,
      priceINR: 0,
      credits: 50,
      seats: '1 Member',
      isPopular: false,
      cta: 'Start Free Trial',
      features: [
        '50 search credits / month',
        'Google Places API (New) discovery',
        'Basic website status (200 OK / SSL)',
        'Standard CSV export',
        'Single workspace',
      ],
    },
    {
      id: 'starter',
      name: 'Starter Prospector',
      description: 'Perfect for freelance consultants and boutique agency founders.',
      priceUSD: Math.round(29 * discountMultiplier),
      priceINR: Math.round(1999 * discountMultiplier),
      credits: 500,
      seats: '3 Seats',
      isPopular: false,
      cta: 'Choose Starter',
      features: [
        '500 search credits / month',
        'Full DOM harvester (SSL, TTFB, CMS)',
        'Multi-channel AI outreach (Email & WA)',
        '3 team seats with RBAC roles',
        'RFC 4180 sanitized CSV export',
        'Tagging & team note collaboration',
      ],
    },
    {
      id: 'growth',
      name: 'Growth Agency',
      description: 'High-velocity outbound machine for scaling marketing agencies.',
      priceUSD: Math.round(69 * discountMultiplier),
      priceINR: Math.round(4999 * discountMultiplier),
      credits: 2000,
      seats: '10 Seats',
      isPopular: true,
      cta: 'Choose Growth',
      features: [
        '2,000 search credits / month',
        'Deterministic 0–100 score waterfall',
        'AI Opportunity detection with quoted proof',
        'Custom lead lists & segmentation',
        '10 team seats with workspace switcher',
        'RiffCRM & Webhook direct synchronization',
        'Priority queue processing on Horizon',
      ],
    },
    {
      id: 'scale',
      name: 'Scale Enterprise',
      description: 'Bespoke volume and SLA for enterprise SDR pods and large agencies.',
      priceUSD: Math.round(149 * discountMultiplier),
      priceINR: Math.round(11999 * discountMultiplier),
      credits: 6000,
      seats: 'Unlimited',
      isPopular: false,
      cta: 'Choose Scale',
      features: [
        '6,000 search credits / month',
        'Dedicated IP crawlers & priority rate limits',
        'Unlimited workspace members',
        'Custom CRM & webhook integrations',
        'Automated S3 scheduled daily exports',
        'Dedicated account manager & Slack channel',
        'Custom multi-tenant security review',
      ],
    },
  ];

  const estimatedMonthlyRevenue = closedDeals * retainerAmount;
  const estimatedAnnualValue = estimatedMonthlyRevenue * 12;
  const growthPlanCost = (currency === 'USD' ? 69 : 4999) * (isAnnual ? 0.8 : 1);
  const netRoiMultiplier = Math.round(estimatedMonthlyRevenue / (growthPlanCost || 1));

  const faqs = [
    {
      q: 'How do LeadMap AI search credits work?',
      a: 'LeadMap AI follows a transparent 1 credit per lead model: exactly 1 credit is used to discover, analyze, and save 1 verified business lead into your workspace pipeline. This covers full website crawling, TTFB performance testing, technical deficit diagnosis, and AI opportunity synthesis. Unused credits roll over each billing cycle on active paid plans.',
    },
    {
      q: 'Does LeadMap AI scrape Google Maps or websites illegally?',
      a: 'No. LeadMap AI relies 100% on the official Google Maps Platform Places API (New) with optimized FieldMasks. Our website intelligence crawler obeys robots.txt, respects rate limits, and uses a multi-layer SSRF sandbox to protect target infrastructure.',
    },
    {
      q: 'Can I invite my sales reps or contractors?',
      a: 'Yes. Every paid plan includes multiple team seats with role-based access control (Owner, Admin, Member, Viewer). You can assign leads, leave internal notes, and manage shared lists in a multi-tenant workspace.',
    },
    {
      q: 'Can I sync discovered leads directly to my CRM?',
      a: 'Yes. The Growth and Scale tiers support instant RiffCRM synchronization, Hubspot webhooks, and custom signed webhook events (lead.discovered, lead.analyzed, opportunity.detected). You can also export RFC 4180 CSVs anytime.',
    },
    {
      q: 'What if I run out of monthly credits?',
      a: 'You can purchase instant Top-Up credit packs (100, 500, or 2,000 credits) directly in your billing dashboard at wholesale rates without changing your plan tier.',
    },
    {
      q: 'Is there a contract or cancellation penalty?',
      a: 'None. You can cancel or change your plan at any time with a single click in your billing console. If you cancel, your account remains active until the end of your prepaid period.',
    },
  ];

  return (
    <div className="min-h-[100dvh] bg-[#090A0D] text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-300">
      <PublicNavbar />

      <main className="max-w-7xl mx-auto px-6 pt-12 pb-24 space-y-24">
        {/* Header */}
        <section className="text-center max-w-4xl mx-auto space-y-6 pt-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-medium tracking-wider uppercase">
            <CreditCard className="w-3.5 h-3.5" /> Transparent Unit Economics
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white leading-[1.08]">
            Predictable pricing designed for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
              profitable agencies.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            One closed agency retainer pays for an entire year of LeadMap AI. No hidden per-seat markups or surprise overages.
          </p>

          {/* Toggles */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            {/* Billing cycle toggle */}
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

            {/* Currency toggle */}
            <div className="flex items-center p-1 rounded-full bg-[#111318] border border-white/[0.08] text-xs font-mono">
              <button
                type="button"
                onClick={() => setCurrency('USD')}
                className={`px-3 py-1 rounded-full transition-all ${
                  currency === 'USD' ? 'bg-white/[0.1] text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                USD ($)
              </button>
              <button
                type="button"
                onClick={() => setCurrency('INR')}
                className={`px-3 py-1 rounded-full transition-all ${
                  currency === 'INR' ? 'bg-white/[0.1] text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                INR (₹)
              </button>
            </div>
          </div>
        </section>

        {/* 4 Plan Cards Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {plans.map((plan) => {
            const price = currency === 'USD' ? `$${plan.priceUSD}` : `₹${plan.priceINR.toLocaleString()}`;

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between ${
                  plan.isPopular
                    ? 'bg-[#141820] border-2 border-emerald-500/60 shadow-[0_0_40px_rgba(16,185,129,0.18)] scale-[1.03] z-10'
                    : 'bg-[#111318] border border-white/[0.08] hover:border-white/[0.16]'
                }`}
              >
                {/* Popular Pill */}
                {plan.isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-mono text-[10px] font-bold tracking-wider uppercase shadow-[0_0_15px_rgba(16,185,129,0.4)] flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Most Popular
                  </div>
                )}

                <div>
                  <div className="space-y-2 mb-6">
                    <h3 className="text-lg font-bold text-white tracking-tight">{plan.name}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-sans">{plan.description}</p>
                    <div className="pt-2 flex items-baseline gap-1.5">
                      <span className="text-3xl font-extrabold text-white font-mono">{price}</span>
                      <span className="text-xs text-slate-400 font-mono">/ month</span>
                    </div>
                    <div className="flex items-center gap-2 pt-1 font-mono text-xs">
                      <span className="text-emerald-400 font-semibold">{plan.credits.toLocaleString()} credits</span>
                      <span className="text-slate-600">&bull;</span>
                      <span className="text-slate-400">{plan.seats}</span>
                    </div>
                  </div>

                  {/* Feature Checklist */}
                  <div className="space-y-2.5 py-4 border-t border-white/[0.06] mb-6">
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                        <div className="w-4 h-4 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5 text-emerald-400" />
                        </div>
                        <span className="leading-tight">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Plan Action CTA */}
                <Link href={`/register?plan=${plan.id}`}>
                  <button
                    type="button"
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-mono font-semibold transition-all flex items-center justify-center gap-2 ${
                      plan.isPopular
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                        : 'bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/[0.1]'
                    }`}
                  >
                    <span>{plan.cta}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </Link>
              </div>
            );
          })}
        </section>

        {/* Interactive Agency ROI Calculator */}
        <section className="p-8 sm:p-12 rounded-3xl bg-[#111318] border border-white/[0.08] space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/[0.08] pb-6">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-wider mb-1">
                <Calculator className="w-3.5 h-3.5" /> Agency Economics
              </div>
              <h3 className="text-2xl font-bold text-white tracking-tight">
                Interactive Agency ROI Calculator
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Model your outbound return when using observable website proof instead of generic cold pitches.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-right font-mono">
              <span className="text-[10px] text-emerald-400 uppercase tracking-wider block">Estimated Net Multiplier</span>
              <span className="text-2xl font-bold text-white">{netRoiMultiplier}x ROI</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Left Column: Sliders */}
            <div className="space-y-6 font-mono text-xs">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-300">Target Closed Clients / Month:</span>
                  <span className="text-emerald-400 font-bold text-sm">{closedDeals} Clients</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={closedDeals}
                  onChange={(e) => setClosedDeals(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>1 client</span>
                  <span>5 clients</span>
                  <span>10 clients</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-300">Average Client Monthly Retainer:</span>
                  <span className="text-emerald-400 font-bold text-sm">
                    {currency === 'USD' ? `$${retainerAmount}` : `₹${(retainerAmount * 80).toLocaleString()}`}
                  </span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="5000"
                  step="250"
                  value={retainerAmount}
                  onChange={(e) => setRetainerAmount(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>$500/mo</span>
                  <span>$2,500/mo</span>
                  <span>$5,000/mo</span>
                </div>
              </div>
            </div>

            {/* Right Column: Financial Results */}
            <div className="grid grid-cols-2 gap-4 font-mono">
              <div className="p-4 rounded-xl bg-[#090A0D] border border-white/[0.06] space-y-1">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Monthly Gross Revenue</span>
                <p className="text-xl font-bold text-white">
                  {currency === 'USD' ? `$${estimatedMonthlyRevenue.toLocaleString()}` : `₹${(estimatedMonthlyRevenue * 80).toLocaleString()}`}
                </p>
                <span className="text-[10px] text-emerald-400">Recurring cashflow</span>
              </div>

              <div className="p-4 rounded-xl bg-[#090A0D] border border-white/[0.06] space-y-1">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Annual Contract Value</span>
                <p className="text-xl font-bold text-emerald-400">
                  {currency === 'USD' ? `$${estimatedAnnualValue.toLocaleString()}` : `₹${(estimatedAnnualValue * 80).toLocaleString()}`}
                </p>
                <span className="text-[10px] text-slate-400">Cumulative retainers</span>
              </div>
            </div>
          </div>
        </section>

        {/* Frequently Asked Questions */}
        <section className="space-y-6 max-w-4xl mx-auto">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs font-mono text-slate-400">
              Clear answers on data compliance, billing, and credit rollovers.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;

              return (
                <div
                  key={idx}
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="cursor-pointer p-5 rounded-2xl bg-[#111318] border border-white/[0.08] hover:border-white/[0.14] transition-all"
                >
                  <div className="flex items-center justify-between gap-4">
                    <h4 className="text-sm font-bold text-white">{faq.q}</h4>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-emerald-400' : ''}`}
                    />
                  </div>
                  {isOpen && (
                    <p className="pt-3 text-xs text-slate-300 leading-relaxed font-sans border-t border-white/[0.06] mt-3">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Final CTA */}
        <section className="text-center space-y-6 pt-6">
          <h2 className="text-3xl font-bold text-white">Start finding qualified clients today</h2>
          <div className="flex justify-center gap-4">
            <Link href="/register">
              <Button size="lg" withTrailingIcon className="font-semibold shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                Create Free Account
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
