'use client';

import * as React from 'react';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface SignalIndicatorRowProps {
  label: string;
  value: boolean | string | number | null | undefined;
  type?: 'boolean' | 'text' | 'badge' | 'latency';
  detail?: string | null;
  icon?: React.ReactNode;
}

export function SignalIndicatorRow({
  label,
  value,
  type = 'boolean',
  detail,
  icon,
}: SignalIndicatorRowProps) {
  if (type === 'boolean') {
    const isPositive = Boolean(value);
    return (
      <div className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
        <div className="flex items-center gap-2">
          {icon && <span className="text-zinc-500">{icon}</span>}
          <div>
            <span className="font-sans text-xs text-zinc-300 block">{label}</span>
            {detail && <span className="font-mono text-[10px] text-zinc-500 block">{detail}</span>}
          </div>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-xs">
          {isPositive ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px]">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              Active
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[11px]">
              <XCircle className="w-3 h-3 text-rose-400" />
              Missing
            </span>
          )}
        </div>
      </div>
    );
  }

  if (type === 'latency') {
    const ms = Number(value) || 0;
    const isFast = ms < 800;
    const isFair = ms >= 800 && ms < 2000;

    return (
      <div className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
        <div className="flex items-center gap-2">
          {icon && <span className="text-zinc-500">{icon}</span>}
          <div>
            <span className="font-sans text-xs text-zinc-300 block">{label}</span>
            {detail && <span className="font-mono text-[10px] text-zinc-500 block">{detail}</span>}
          </div>
        </div>
        <span
          className={`font-mono text-xs font-semibold px-2 py-0.5 rounded-md border ${
            isFast
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : isFair
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
          }`}
        >
          {ms > 0 ? `${ms} ms` : 'N/A'}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
      <div className="flex items-center gap-2">
        {icon && <span className="text-zinc-500">{icon}</span>}
        <div>
          <span className="font-sans text-xs text-zinc-300 block">{label}</span>
          {detail && <span className="font-mono text-[10px] text-zinc-500 block">{detail}</span>}
        </div>
      </div>
      <span className="font-mono text-xs text-white max-w-[200px] truncate">
        {value ? String(value) : 'Not detected'}
      </span>
    </div>
  );
}
