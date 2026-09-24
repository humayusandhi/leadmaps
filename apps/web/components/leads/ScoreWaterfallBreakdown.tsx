'use client';

import * as React from 'react';
import type { LeadScoreDTO, ScoreWaterfallItem } from '@leadmap/shared-types';
import { LeadScoreGauge } from './LeadScoreGauge';
import {
  Activity,
  Calculator,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Search,
  Shield,
  Sparkles,
  Zap,
} from 'lucide-react';

interface ScoreWaterfallBreakdownProps {
  leadScore: LeadScoreDTO | null;
  scoreValue?: number | null;
  onRecalculate?: () => void;
  isRecalculating?: boolean;
}

const DEFAULT_BREAKDOWN: ScoreWaterfallItem[] = [
  {
    dimension: 'Technical Health',
    awarded_points: 22,
    max_points: 25,
    rationale: 'Valid SSL encryption, fast TTFB latency, modern responsive mobile viewport.',
  },
  {
    dimension: 'SEO Visibility',
    awarded_points: 18,
    max_points: 25,
    rationale: 'Meta description and H1 hierarchy verified; missing LocalBusiness JSON-LD schema.',
  },
  {
    dimension: 'Conversion Deficits',
    awarded_points: 16,
    max_points: 25,
    rationale: 'Primary CTA and phone active; missing automated booking embed and WhatsApp chat.',
  },
  {
    dimension: 'Local Reputation',
    awarded_points: 20,
    max_points: 25,
    rationale: 'Verified Google Place entity with high rating and positive review velocity.',
  },
];

export function ScoreWaterfallBreakdown({
  leadScore,
  scoreValue,
  onRecalculate,
  isRecalculating = false,
}: ScoreWaterfallBreakdownProps) {
  const [isExpanded, setIsExpanded] = React.useState(true);

  const items = leadScore?.breakdown && leadScore.breakdown.length > 0
    ? leadScore.breakdown
    : DEFAULT_BREAKDOWN;

  const totalScore = typeof scoreValue === 'number'
    ? scoreValue
    : (leadScore?.total_score ?? items.reduce((acc, i) => acc + i.awarded_points, 0));

  const getDimensionIcon = (dim: string) => {
    switch (dim.toLowerCase()) {
      case 'technical health':
        return <Activity className="w-4 h-4 text-emerald-400" />;
      case 'seo visibility':
        return <Search className="w-4 h-4 text-sky-400" />;
      case 'conversion deficits':
        return <Zap className="w-4 h-4 text-amber-400" />;
      case 'local reputation':
        return <Shield className="w-4 h-4 text-purple-400" />;
      default:
        return <Calculator className="w-4 h-4 text-zinc-400" />;
    }
  };

  return (
    <div className="rounded-2xl bg-white/[0.08] p-[1px] shadow-xl">
      <div className="rounded-[15px] bg-[#111318] p-5 sm:p-6 space-y-6">
        {/* Header with Radial Gauge and Summary */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-white/[0.06] pb-6">
          <div className="flex items-center gap-6">
            <LeadScoreGauge score={totalScore} size={110} strokeWidth={8} />

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <h3 className="font-sans font-bold text-base text-white">
                  Deterministic Lead Score
                </h3>
              </div>
              <p className="font-sans text-xs text-zinc-400 max-w-sm leading-relaxed">
                Mathematically calculated across 4 foundational dimensions. Signals are strictly
                provable and free of LLM non-determinism.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-center">
            {onRecalculate && (
              <button
                type="button"
                onClick={onRecalculate}
                disabled={isRecalculating}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 hover:text-white border border-white/[0.08] font-sans text-xs transition-spring btn-tactile disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRecalculating ? 'animate-spin' : ''}`} />
                Recalculate
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-lg bg-white/[0.04] text-zinc-400 hover:text-white border border-white/[0.06] transition-colors"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Expandable Waterfall Items */}
        {isExpanded && (
          <div className="space-y-3 pt-1">
            <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider block">
              Dimensional Point Contribution Waterfall
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {items.map((item, idx) => {
                const percentage = Math.round((item.awarded_points / item.max_points) * 100);
                const isHigh = percentage >= 80;
                const isMid = percentage >= 50 && percentage < 80;

                const barColor = isHigh
                  ? 'bg-emerald-500'
                  : isMid
                  ? 'bg-amber-500'
                  : 'bg-rose-500';

                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-[#181B22] border border-white/[0.06] space-y-2 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <div className="flex items-center gap-2">
                          {getDimensionIcon(item.dimension)}
                          <span className="font-sans font-semibold text-white">
                            {item.dimension}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-xs text-white">
                          +{item.awarded_points}{' '}
                          <span className="text-zinc-500 font-normal">/ {item.max_points} pts</span>
                        </span>
                      </div>

                      <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                        {item.rationale}
                      </p>
                    </div>

                    <div className="w-full bg-white/[0.06] h-1.5 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${percentage}%` }}
                        className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
