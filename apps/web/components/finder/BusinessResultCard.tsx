'use client';

import * as React from 'react';
import type { BusinessDTO } from '@leadmap/shared-types';
import {
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  ExternalLink,
  Globe,
  MapPin,
  Phone,
  Sparkles,
  Star,
} from 'lucide-react';

interface BusinessResultCardProps {
  business: BusinessDTO;
  rank: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onAnalyze?: (business: BusinessDTO) => void;
  onSave?: (business: BusinessDTO) => boolean | void;
}

export function BusinessResultCard({
  business,
  rank,
  isSelected,
  onSelect,
  onAnalyze,
  onSave,
}: BusinessResultCardProps) {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [saved, setSaved] = React.useState(business.is_saved ?? false);

  // Sync internal state when business prop changes
  React.useEffect(() => {
    setSaved(business.is_saved ?? false);
  }, [business.is_saved]);

  // Auto-scroll when card becomes selected from map
  React.useEffect(() => {
    if (isSelected && cardRef.current) {
      cardRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [isSelected]);

  const handleSaveToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextSaved = !saved;
    if (onSave) {
      const allowed = onSave({ ...business, is_saved: nextSaved });
      if (allowed !== false) {
        setSaved(nextSaved);
      }
    } else {
      setSaved(nextSaved);
    }
  };

  const handleAnalyzeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAnalyze) {
      onAnalyze(business);
    }
  };

  return (
    <div
      ref={cardRef}
      onClick={() => onSelect(business.id)}
      className={`group relative rounded-xl p-[1px] transition-all duration-300 cursor-pointer ${
        isSelected
          ? 'bg-gradient-to-b from-emerald-500/50 via-emerald-500/20 to-white/[0.05] shadow-[0_0_24px_rgba(16,185,129,0.15)]'
          : 'bg-white/[0.08] hover:bg-white/[0.16] hover:border-white/20'
      }`}
    >
      {/* Inner Double-Bezel Container */}
      <div
        className={`rounded-[11px] p-4 transition-all duration-300 ${
          isSelected
            ? 'bg-[#14171F]'
            : 'bg-[#111318] group-hover:bg-[#13161D]'
        }`}
      >
        {/* Top Header: Rank, Name, and Badges */}
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-start gap-2.5 min-w-0">
            {/* Rank Pin Pill */}
            <div
              className={`w-6 h-6 rounded-md flex items-center justify-center font-mono text-xs font-bold shrink-0 transition-colors ${
                isSelected
                  ? 'bg-emerald-500 text-black shadow-[0_0_12px_rgba(16,185,129,0.6)]'
                  : 'bg-white/[0.06] text-zinc-400 group-hover:text-white border border-white/[0.08]'
              }`}
            >
              {rank}
            </div>

            <div className="min-w-0">
              <h3 className="font-sans font-semibold text-sm text-white truncate leading-tight group-hover:text-emerald-300 transition-colors">
                {business.name}
              </h3>
              <p className="font-sans text-xs text-zinc-400 truncate mt-0.5 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-zinc-500 shrink-0" />
                <span>{business.formatted_address}</span>
              </p>
            </div>
          </div>

          {/* Save Action Button with 1 Credit indicator */}
          <button
            onClick={handleSaveToggle}
            aria-label="Save lead"
            title={saved ? 'Saved in pipeline (1 credit used)' : 'Save lead into pipeline (Costs 1 Credit)'}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all shrink-0 ${
              saved
                ? 'bg-amber-400/15 border-amber-400/30 text-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.2)]'
                : 'bg-white/[0.04] border-white/[0.08] text-zinc-400 hover:text-white hover:border-emerald-500/40 hover:bg-emerald-500/10'
            }`}
          >
            {saved ? (
              <BookmarkCheck className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Bookmark className="w-3.5 h-3.5" />
            )}
            <span className="text-[10px] font-mono font-bold">
              {saved ? 'Saved' : '1 cr'}
            </span>
          </button>
        </div>

        {/* Middle Metadata: Rating & Provenance Pill */}
        <div className="flex flex-wrap items-center gap-2 mb-3 text-xs">
          {/* Rating */}
          {business.rating !== null ? (
            <div className="flex items-center gap-1 font-mono text-xs font-medium text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{business.rating.toFixed(1)}</span>
              <span className="text-zinc-500 text-[11px]">
                ({business.review_count})
              </span>
            </div>
          ) : (
            <span className="font-mono text-[11px] text-zinc-500 bg-white/[0.04] px-2 py-0.5 rounded">
              No Reviews
            </span>
          )}

          {/* 4-Tier Data Provenance Badge */}
          <div className="flex items-center gap-1 font-mono text-[10px] tracking-wider uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            PROVIDER
          </div>

          {/* Saved in Pipeline Badge */}
          {saved && (
            <div className="flex items-center gap-1 font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/25">
              SAVED
            </div>
          )}
        </div>

        {/* Contact Strip */}
        <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-white/[0.06] text-xs">
          {/* Website Link */}
          {business.website_url ? (
            <a
              href={business.website_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 text-zinc-300 hover:text-emerald-400 truncate transition-colors group/link"
            >
              <Globe className="w-3.5 h-3.5 text-zinc-500 group-hover/link:text-emerald-400 shrink-0" />
              <span className="truncate">
                {business.website_url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/.*$/, '')}
              </span>
              <ExternalLink className="w-3 h-3 text-zinc-600 group-hover/link:text-emerald-400 shrink-0" />
            </a>
          ) : (
            <span className="flex items-center gap-1.5 text-rose-400/80 font-mono text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400/60" />
              No Website
            </span>
          )}

          {/* Phone Number */}
          {business.phone_number ? (
            <a
              href={`tel:${business.phone_number}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 text-zinc-300 hover:text-emerald-400 font-mono text-[11px] truncate justify-end transition-colors"
            >
              <Phone className="w-3 h-3 text-zinc-500 shrink-0" />
              <span className="truncate">{business.phone_number}</span>
            </a>
          ) : (
            <span className="text-zinc-600 font-mono text-[11px] text-right">
              No Phone
            </span>
          )}
        </div>

        {/* Action Bar (Revealed on Hover / Selected) */}
        <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between gap-2">
          <span className="text-[11px] font-mono text-zinc-500">
            ID: {business.google_place_id.slice(0, 8)}...
          </span>

          <button
            onClick={handleAnalyzeClick}
            className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-black font-sans text-xs font-semibold border border-emerald-500/30 transition-all shadow-sm btn-tactile"
          >
            <Sparkles className="w-3 h-3" />
            Analyze Lead
          </button>
        </div>
      </div>
    </div>
  );
}
