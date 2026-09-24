'use client';

import * as React from 'react';
import type { AIOpportunityDTO } from '@leadmap/shared-types';
import {
  Briefcase,
  Calendar,
  Check,
  Copy,
  ExternalLink,
  Globe,
  Layout,
  MessageSquare,
  Search,
  Sparkles,
  Zap,
} from 'lucide-react';

interface OpportunityCardProps {
  opportunity: AIOpportunityDTO;
  onSelectAngle?: (opp: AIOpportunityDTO) => void;
}

export function OpportunityCard({ opportunity, onSelectAngle }: OpportunityCardProps) {
  const [copied, setCopied] = React.useState(false);

  const title = opportunity.title || opportunity.opportunity || 'High-Leverage Opportunity';
  const category = (opportunity.category || 'WEBSITE').toUpperCase();
  const confidence = (opportunity.confidence || 'MEDIUM').toUpperCase();

  const handleCopyAngle = () => {
    const text = `Opportunity: ${title}\nEvidence: ${opportunity.evidence}\nSuggested Service: ${opportunity.suggested_service}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'BOOKING':
        return <Calendar className="w-3.5 h-3.5 text-emerald-400" />;
      case 'WHATSAPP':
        return <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />;
      case 'SEO':
      case 'LOCAL_SEO':
        return <Search className="w-3.5 h-3.5 text-sky-400" />;
      case 'PERFORMANCE':
        return <Zap className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <Layout className="w-3.5 h-3.5 text-purple-400" />;
    }
  };

  const confidenceBadge =
    confidence === 'HIGH'
      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      : confidence === 'MEDIUM'
      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';

  return (
    <div className="rounded-2xl bg-white/[0.08] p-[1px] shadow-lg transition-spring hover:bg-white/[0.14] group">
      <div className="rounded-[15px] bg-[#111318] p-5 h-full flex flex-col justify-between space-y-4">
        {/* Top Header Row */}
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.05] border border-white/[0.08] font-mono text-[11px] text-zinc-300">
                {getCategoryIcon(category)}
                {category}
              </span>

              <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                AI INFERENCE
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className={`font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${confidenceBadge}`}>
                {confidence} CONFIDENCE
              </span>

              {opportunity.points_estimated && (
                <span className="font-mono text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  +{opportunity.points_estimated} pts
                </span>
              )}
            </div>
          </div>

          {/* Opportunity Title */}
          <h4 className="font-sans font-bold text-sm text-white leading-snug group-hover:text-emerald-400 transition-colors">
            {title}
          </h4>
        </div>

        {/* Observable Evidence Quote Inset */}
        <div className="rounded-xl bg-[#181B22] border-l-2 border-emerald-500/80 p-3 space-y-1">
          <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider block">
            Observed Verifiable Evidence
          </span>
          <p className="font-mono text-xs text-zinc-300 leading-relaxed italic">
            &ldquo;{opportunity.evidence}&rdquo;
          </p>
        </div>

        {/* Suggested Agency Service & Action Footer */}
        <div className="pt-2 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2">
            <Briefcase className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider block">
                Suggested Agency Service
              </span>
              <span className="font-sans font-semibold text-xs text-zinc-200 block">
                {opportunity.suggested_service}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyAngle}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 hover:text-white border border-white/[0.08] font-sans text-xs transition-spring btn-tactile"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-zinc-400" />
                  Copy Pitch
                </>
              )}
            </button>

            {onSelectAngle && (
              <button
                type="button"
                onClick={() => onSelectAngle(opportunity)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-sans font-semibold text-xs transition-spring btn-tactile"
              >
                <Sparkles className="w-3 h-3 fill-black" />
                Draft Outreach
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
