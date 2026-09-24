'use client';

import * as React from 'react';
import { Zap, AlertTriangle, Plus, ShieldCheck } from 'lucide-react';
import { CreditBalanceDTO } from '@leadmap/shared-types';

interface CreditUsageBarProps {
  balance: CreditBalanceDTO;
  quota?: number;
  planName?: string;
  onTopUpClick: () => void;
}

export function CreditUsageBar({ balance, quota = 2000, planName, onTopUpClick }: CreditUsageBarProps) {
  const percentRemaining = Math.min(100, Math.max(0, Math.round((balance.available / quota) * 100)));
  const isLow = percentRemaining < 15;
  const isDepleted = balance.available <= 0;

  return (
    <div className="rounded-2xl bg-[#111318] border border-white/[0.08] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)] space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
            <Zap className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-semibold text-white tracking-tight">Active Usage Credits</h3>
              {planName && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white/[0.06] text-slate-300 border border-white/[0.1]">
                  {planName}
                </span>
              )}
              {isDepleted ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/10 text-rose-400 border border-rose-500/25">
                  Depleted
                </span>
              ) : isLow ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/25 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Low Balance
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Active Quota
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Deterministic consumption: 1 credit per verified lead saved & analyzed
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onTopUpClick}
          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-mono font-semibold transition-all inline-flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.25)] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Top-Up Credits
        </button>
      </div>

      {/* Numerical Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2 border-y border-white/[0.06] text-xs font-mono">
        <div>
          <span className="text-slate-500 uppercase tracking-wider block text-[10px]">Available Credits</span>
          <span className="text-xl font-bold text-white tracking-tight">
            {balance.available.toLocaleString()}
          </span>
        </div>
        <div>
          <span className="text-slate-500 uppercase tracking-wider block text-[10px]">Reserved (In-Flight)</span>
          <span className="text-xl font-bold text-amber-400 tracking-tight">
            {balance.reserved.toLocaleString()}
          </span>
        </div>
        <div>
          <span className="text-slate-500 uppercase tracking-wider block text-[10px]">Monthly Quota</span>
          <span className="text-xl font-bold text-slate-300 tracking-tight">
            {quota.toLocaleString()}
          </span>
        </div>
        <div>
          <span className="text-slate-500 uppercase tracking-wider block text-[10px]">Lifetime Granted</span>
          <span className="text-xl font-bold text-slate-300 tracking-tight">
            {balance.lifetime_granted.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Visual Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span>{percentRemaining}% remaining this billing cycle</span>
          <span>{balance.available} / {quota} credits</span>
        </div>

        <div className="w-full h-2.5 rounded-full bg-white/[0.06] overflow-hidden p-[1px]">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isDepleted
                ? 'bg-rose-500'
                : isLow
                ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                : 'bg-gradient-to-r from-emerald-500 to-teal-400'
            }`}
            style={{ width: `${Math.max(3, percentRemaining)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
