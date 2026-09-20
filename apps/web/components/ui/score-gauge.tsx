import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ScoreGaugeProps {
  score: number; // 0 to 100
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function ScoreGauge({
  score,
  size = 'md',
  showLabel = true,
  className,
}: ScoreGaugeProps) {
  const clampedScore = Math.max(0, Math.min(100, score));

  // Determine color tier
  let strokeColor = '#10B981'; // Signal Emerald (80+)
  let textColor = 'text-emerald-400';
  let badgeLabel = 'HIGH PRIORITY';

  if (clampedScore < 50) {
    strokeColor = '#F43F5E'; // Rose Deficit (0-49)
    textColor = 'text-rose-400';
    badgeLabel = 'LOW FIT';
  } else if (clampedScore < 80) {
    strokeColor = '#F59E0B'; // Amber Warning (50-79)
    textColor = 'text-amber-400';
    badgeLabel = 'MODERATE';
  }

  const dimensions = {
    sm: { diameter: 44, strokeWidth: 3.5, textSize: 'text-sm' },
    md: { diameter: 72, strokeWidth: 5, textSize: 'text-xl' },
    lg: { diameter: 104, strokeWidth: 7, textSize: 'text-3xl' },
  };

  const { diameter, strokeWidth, textSize } = dimensions[size];
  const radius = (diameter - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  return (
    <div className={cn('inline-flex flex-col items-center justify-center gap-1.5', className)}>
      <div className="relative inline-flex items-center justify-center">
        <svg width={diameter} height={diameter} className="rotate-[-90deg]">
          {/* Background Track */}
          <circle
            cx={diameter / 2}
            cy={diameter / 2}
            r={radius}
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Active Score Bar */}
          <circle
            cx={diameter / 2}
            cy={diameter / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Monospace Score */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn('font-mono font-bold tracking-tight', textSize, textColor)}>
            {clampedScore}
          </span>
        </div>
      </div>

      {showLabel && (
        <span className="text-[10px] font-mono tracking-wider uppercase text-slate-400 font-semibold">
          {badgeLabel}
        </span>
      )}
    </div>
  );
}
