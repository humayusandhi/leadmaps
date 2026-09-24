'use client';

import * as React from 'react';

interface LeadScoreGaugeProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
}

export function LeadScoreGauge({
  score,
  size = 140,
  strokeWidth = 10,
  showLabel = true,
}: LeadScoreGaugeProps) {
  const normalizedScore = Math.max(0, Math.min(100, Math.round(score)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  // Color grade based on deterministic score tiers
  const isPrime = normalizedScore >= 75;
  const isModerate = normalizedScore >= 50 && normalizedScore < 75;

  const strokeColor = isPrime ? '#10B981' : isModerate ? '#F59E0B' : '#F43F5E';
  const tierLabel = isPrime ? 'High Leverage' : isModerate ? 'Moderate Fit' : 'Early Outreach';
  const tierBadgeBg = isPrime
    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
    : isModerate
    ? 'bg-amber-500/10 text-amber-400 border-amber-500/25'
    : 'bg-rose-500/10 text-rose-400 border-rose-500/25';

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
        >
          {/* Track Background */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.06)"
            strokeWidth={strokeWidth}
          />
          {/* Animated Value Stroke */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Digital Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-3xl font-bold tracking-tight text-white leading-none">
            {normalizedScore}
          </span>
          <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mt-1">
            / 100 PTS
          </span>
        </div>
      </div>

      {showLabel && (
        <span
          className={`mt-2 font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${tierBadgeBg}`}
        >
          {tierLabel}
        </span>
      )}
    </div>
  );
}
