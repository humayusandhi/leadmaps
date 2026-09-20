import * as React from 'react';
import { cn } from '@/lib/utils';
import type { DataProvenance } from '@leadmap/shared-types';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  provenance?: DataProvenance;
  variant?: 'emerald' | 'amber' | 'rose' | 'slate' | 'default';
}

export function Badge({
  className,
  provenance,
  variant = 'default',
  children,
  ...props
}: BadgeProps) {
  // 4-Tier Data Provenance Badges from DESIGN.md
  if (provenance) {
    const provenanceStyles: Record<DataProvenance, { label: string; style: string }> = {
      PROVIDER: {
        label: 'Provider Data',
        style: 'border-sky-500/30 text-sky-400 bg-sky-500/10',
      },
      OBSERVED: {
        label: 'Observed Fact',
        style: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
      },
      DERIVED: {
        label: 'Derived Metric',
        style: 'border-amber-500/30 text-amber-400 bg-amber-500/10',
      },
      AI_INFERENCE: {
        label: 'AI Inference',
        style: 'border-purple-500/35 text-purple-300 bg-purple-500/10',
      },
    };

    const config = provenanceStyles[provenance];

    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium border uppercase tracking-wider',
          config.style,
          className
        )}
        {...props}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
        {children || config.label}
      </span>
    );
  }

  const variants = {
    default: 'bg-white/[0.05] border-white/[0.1] text-slate-300',
    emerald: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400',
    amber: 'bg-amber-500/10 border-amber-500/25 text-amber-400',
    rose: 'bg-rose-500/10 border-rose-500/25 text-rose-400',
    slate: 'bg-slate-800/60 border-slate-700/50 text-slate-400',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
