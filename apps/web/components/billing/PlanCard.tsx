'use client';

import * as React from 'react';
import { Check, Sparkles, ArrowRight } from 'lucide-react';
import { PlanDTO } from '@leadmap/shared-types';

interface PlanCardProps {
  plan: PlanDTO;
  isCurrentPlan: boolean;
  isRecommended?: boolean;
  onSelectPlan: (plan: PlanDTO) => void;
  isLoading?: boolean;
}

export function PlanCard({
  plan,
  isCurrentPlan,
  isRecommended,
  onSelectPlan,
  isLoading,
}: PlanCardProps) {
  return (
    <div
      className={`relative rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between ${
        isRecommended
          ? 'bg-[#12161D] border-2 border-emerald-500/50 shadow-[0_0_40px_rgba(16,185,129,0.15)] scale-[1.02]'
          : 'bg-[#111318] border border-white/[0.08] hover:border-white/[0.16]'
      }`}
    >
      {/* Recommended Tag */}
      {isRecommended && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-mono text-[10px] font-bold tracking-wider uppercase shadow-[0_0_15px_rgba(16,185,129,0.4)] flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> Most Popular
        </div>
      )}

      <div>
        {/* Plan Header */}
        <div className="space-y-1.5 mb-5">
          <h3 className="text-lg font-bold text-white tracking-tight">{plan.name}</h3>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-white font-mono">
              ₹{plan.price_inr.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-mono">/ month</span>
          </div>
          <p className="text-xs font-mono text-emerald-400 font-semibold">
            {plan.monthly_credits.toLocaleString()} credits included
          </p>
        </div>

        {/* Feature List */}
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

      {/* CTA Button */}
      <button
        type="button"
        disabled={isCurrentPlan || isLoading}
        onClick={() => onSelectPlan(plan)}
        className={`w-full py-2.5 px-4 rounded-xl text-xs font-mono font-semibold transition-all flex items-center justify-center gap-2 ${
          isCurrentPlan
            ? 'bg-white/[0.04] text-slate-500 border border-white/[0.06] cursor-default'
            : isRecommended
            ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
            : 'bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/[0.1]'
        }`}
      >
        {isCurrentPlan ? (
          'Current Active Plan'
        ) : plan.price_inr === 0 ? (
          <>
            <span>Switch to Free</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </>
        ) : (
          <>
            <span>Subscribe &bull; ₹{plan.price_inr.toLocaleString()}/mo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </>
        )}
      </button>
    </div>
  );
}
