'use client';

import * as React from 'react';
import Link from 'next/link';
import type { LeadDTO, LeadStatus } from '@leadmap/shared-types';
import {
  ChevronRight,
  ExternalLink,
  Filter,
  Globe,
  MapPin,
  Phone,
  Plus,
  Search as SearchIcon,
  SlidersHorizontal,
  Sparkles,
  Star,
  Tag as TagIcon,
  Trash2,
  UserCheck,
} from 'lucide-react';

interface LeadsTableProps {
  leads: LeadDTO[];
  onStatusChange: (leadId: string, nextStatus: LeadStatus) => void;
  onDeleteLead?: (leadId: string) => void;
  isLoading?: boolean;
}

const STATUS_CONFIG: Record<
  LeadStatus,
  { label: string; bg: string; text: string; dot: string; border: string }
> = {
  NEW: {
    label: 'New',
    bg: 'bg-sky-500/10',
    text: 'text-sky-400',
    dot: 'bg-sky-400',
    border: 'border-sky-500/30',
  },
  RESEARCHED: {
    label: 'Researched',
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    dot: 'bg-purple-400',
    border: 'border-purple-500/30',
  },
  CONTACTED: {
    label: 'Contacted',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    dot: 'bg-amber-400',
    border: 'border-amber-500/30',
  },
  REPLIED: {
    label: 'Replied',
    bg: 'bg-pink-500/10',
    text: 'text-pink-400',
    dot: 'bg-pink-400',
    border: 'border-pink-500/30',
  },
  QUALIFIED: {
    label: 'Qualified',
    bg: 'bg-emerald-500/15',
    text: 'text-emerald-400',
    dot: 'bg-emerald-400',
    border: 'border-emerald-500/30',
  },
  MEETING: {
    label: 'Meeting',
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-400',
    dot: 'bg-indigo-400',
    border: 'border-indigo-500/30',
  },
  WON: {
    label: 'Won',
    bg: 'bg-emerald-500/25',
    text: 'text-emerald-300',
    dot: 'bg-emerald-300',
    border: 'border-emerald-500/50',
  },
  AUDITED: {
    label: 'Audited',
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-400',
    dot: 'bg-cyan-400',
    border: 'border-cyan-500/30',
  },
  PITCH_READY: {
    label: 'Pitch Ready',
    bg: 'bg-emerald-500/20',
    text: 'text-emerald-300',
    dot: 'bg-emerald-400',
    border: 'border-emerald-500/40',
  },
  LOST: {
    label: 'Lost',
    bg: 'bg-zinc-500/10',
    text: 'text-zinc-400',
    dot: 'bg-zinc-400',
    border: 'border-zinc-500/30',
  },
  UNQUALIFIED: {
    label: 'Unqualified',
    bg: 'bg-rose-500/10',
    text: 'text-rose-400',
    dot: 'bg-rose-400',
    border: 'border-rose-500/30',
  },
};

const ALL_STATUSES: LeadStatus[] = [
  'NEW',
  'RESEARCHED',
  'CONTACTED',
  'REPLIED',
  'QUALIFIED',
  'MEETING',
  'WON',
  'LOST',
];

export function LeadsTable({
  leads,
  onStatusChange,
  onDeleteLead,
  isLoading = false,
}: LeadsTableProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedStatusTab, setSelectedStatusTab] = React.useState<string>('ALL');
  const [minScoreFilter, setMinScoreFilter] = React.useState<number>(0);
  const [selectedLeadIds, setSelectedLeadIds] = React.useState<Set<string>>(new Set());

  // Count leads per status
  const statusCounts = React.useMemo(() => {
    const counts: Record<string, number> = { ALL: leads.length };
    ALL_STATUSES.forEach((s) => {
      counts[s] = 0;
    });
    leads.forEach((l) => {
      counts[l.status] = (counts[l.status] || 0) + 1;
    });
    return counts;
  }, [leads]);

  // Filtered Leads
  const filteredLeads = React.useMemo(() => {
    return leads.filter((l) => {
      // Status Filter
      if (selectedStatusTab !== 'ALL' && l.status !== selectedStatusTab) {
        return false;
      }

      // Min Score Filter
      const score = l.score_value ?? l.lead_score?.total_score ?? 0;
      if (minScoreFilter > 0 && score < minScoreFilter) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const nameMatch = l.business.name.toLowerCase().includes(q);
        const cityMatch = l.business.city.toLowerCase().includes(q);
        const phoneMatch = l.business.phone_number?.toLowerCase().includes(q);
        if (!nameMatch && !cityMatch && !phoneMatch) {
          return false;
        }
      }

      return true;
    });
  }, [leads, selectedStatusTab, minScoreFilter, searchQuery]);

  // Checkbox toggle
  const toggleSelectAll = () => {
    if (selectedLeadIds.size === filteredLeads.length) {
      setSelectedLeadIds(new Set());
    } else {
      setSelectedLeadIds(new Set(filteredLeads.map((l) => l.id)));
    }
  };

  const toggleSelectLead = (id: string) => {
    const next = new Set(selectedLeadIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedLeadIds(next);
  };

  return (
    <div className="w-full space-y-4">
      {/* Top Filter Bar */}
      <div className="rounded-2xl bg-[#111318]/90 backdrop-blur-xl border border-white/[0.08] p-4 shadow-xl space-y-3">
        {/* Search & Global Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search leads by name, city, or phone..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#181B22] border border-white/[0.08] text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 transition-all font-sans"
            />
          </div>

          {/* Quick Score Threshold & Actions */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 bg-[#181B22] px-3 py-1.5 rounded-xl border border-white/[0.08]">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-mono text-zinc-400">Min Score:</span>
              <select
                value={minScoreFilter}
                onChange={(e) => setMinScoreFilter(Number(e.target.value))}
                className="bg-transparent text-xs text-emerald-400 font-mono font-bold focus:outline-none"
              >
                <option value={0} className="bg-[#181B22]">All Scores</option>
                <option value={60} className="bg-[#181B22]">60+ Score</option>
                <option value={75} className="bg-[#181B22]">75+ Score</option>
                <option value={85} className="bg-[#181B22]">85+ High Yield</option>
              </select>
            </div>

            <Link
              href="/finder"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-sans font-semibold text-xs transition-spring shadow-[0_0_16px_rgba(16,185,129,0.3)] btn-tactile"
            >
              <Plus className="w-3.5 h-3.5 text-black" />
              Discover Leads
            </Link>
          </div>
        </div>

        {/* Status Horizontal Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-white/[0.06] pb-1 scrollbar-thin">
          <button
            onClick={() => setSelectedStatusTab('ALL')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-sans transition-all shrink-0 ${
              selectedStatusTab === 'ALL'
                ? 'bg-emerald-500 text-black font-semibold shadow-sm'
                : 'bg-white/[0.04] text-zinc-400 hover:text-white border border-white/[0.06]'
            }`}
          >
            <span>All Leads</span>
            <span className={`font-mono text-[11px] px-1.5 py-0.2 rounded ${
              selectedStatusTab === 'ALL' ? 'bg-black/20 text-black font-bold' : 'bg-white/[0.06] text-zinc-400'
            }`}>
              {statusCounts.ALL}
            </span>
          </button>

          {ALL_STATUSES.map((status) => {
            const cfg = STATUS_CONFIG[status];
            const isSelected = selectedStatusTab === status;
            return (
              <button
                key={status}
                onClick={() => setSelectedStatusTab(status)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-sans transition-all shrink-0 ${
                  isSelected
                    ? `${cfg.bg} ${cfg.text} ${cfg.border} border font-semibold`
                    : 'bg-white/[0.03] text-zinc-400 hover:text-white border border-transparent hover:border-white/[0.08]'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                <span>{cfg.label}</span>
                <span className="font-mono text-[10px] opacity-70">
                  {statusCounts[status] || 0}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Double-Bezel Table Container */}
      <div className="rounded-2xl bg-white/[0.08] p-[1px] shadow-2xl overflow-hidden">
        <div className="rounded-[15px] bg-[#111318] overflow-hidden">
          {filteredLeads.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.08] bg-[#14171F]/80 text-zinc-400 font-mono text-[11px] uppercase tracking-wider">
                    <th className="py-3.5 pl-4 pr-2 w-10">
                      <input
                        type="checkbox"
                        checked={selectedLeadIds.size === filteredLeads.length && filteredLeads.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded accent-emerald-500 cursor-pointer"
                      />
                    </th>
                    <th className="py-3.5 px-4 font-semibold">Business Prospect</th>
                    <th className="py-3.5 px-4 font-semibold">Lifecycle Status</th>
                    <th className="py-3.5 px-4 font-semibold">Lead Score</th>
                    <th className="py-3.5 px-4 font-semibold">Contact Coordinates</th>
                    <th className="py-3.5 px-4 font-semibold">Tags</th>
                    <th className="py-3.5 pr-4 pl-2 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filteredLeads.map((lead) => {
                    const cfg = STATUS_CONFIG[lead.status] || STATUS_CONFIG.NEW;
                    const score = lead.score_value ?? lead.lead_score?.total_score ?? 0;
                    const isSelected = selectedLeadIds.has(lead.id);

                    return (
                      <tr
                        key={lead.id}
                        className={`group transition-colors duration-150 ${
                          isSelected ? 'bg-emerald-500/[0.04]' : 'hover:bg-white/[0.02]'
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="py-3.5 pl-4 pr-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectLead(lead.id)}
                            className="rounded accent-emerald-500 cursor-pointer"
                          />
                        </td>

                        {/* Business Name & Address */}
                        <td className="py-3.5 px-4 min-w-[220px]">
                          <Link
                            href={`/leads/${lead.id}`}
                            className="block group/link"
                          >
                            <span className="font-sans font-semibold text-sm text-white group-hover/link:text-emerald-400 transition-colors">
                              {lead.business.name}
                            </span>
                            <span className="flex items-center gap-1 text-[11px] text-zinc-400 mt-0.5 truncate max-w-xs">
                              <MapPin className="w-3 h-3 text-zinc-500 shrink-0" />
                              {lead.business.formatted_address}
                            </span>
                          </Link>
                        </td>

                        {/* Lifecycle Status Selector */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="relative inline-block">
                            <select
                              value={lead.status}
                              onChange={(e) => onStatusChange(lead.id, e.target.value as LeadStatus)}
                              className={`appearance-none pl-6 pr-6 py-1 rounded-full text-xs font-sans font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border} focus:outline-none cursor-pointer hover:brightness-110 transition-all`}
                            >
                              {ALL_STATUSES.map((s) => (
                                <option key={s} value={s} className="bg-[#181B22] text-white">
                                  {STATUS_CONFIG[s].label}
                                </option>
                              ))}
                            </select>
                            <span
                              className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${cfg.dot} pointer-events-none`}
                            />
                          </div>
                        </td>

                        {/* Lead Score Indicator */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold border ${
                                score >= 70
                                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                  : score >= 40
                                  ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                                  : 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30'
                              }`}
                            >
                              {score > 0 ? score : '—'}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-mono text-[11px] text-zinc-300 font-semibold">
                                {score >= 70 ? 'High Yield' : score >= 40 ? 'Moderate' : 'Unscored'}
                              </span>
                              <span className="text-[10px] text-zinc-500">0–100 Engine</span>
                            </div>
                          </div>
                        </td>

                        {/* Contact Coordinates */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            {lead.business.website_url ? (
                              <a
                                href={lead.business.website_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-zinc-300 hover:text-emerald-400 transition-colors"
                              >
                                <Globe className="w-3.5 h-3.5 text-zinc-500" />
                                <span className="truncate max-w-[140px] font-mono text-[11px]">
                                  {lead.business.website_url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/.*$/, '')}
                                </span>
                                <ExternalLink className="w-2.5 h-2.5 text-zinc-500" />
                              </a>
                            ) : (
                              <span className="text-rose-400/80 font-mono text-[11px]">No Website</span>
                            )}

                            {lead.business.phone_number ? (
                              <a
                                href={`tel:${lead.business.phone_number}`}
                                className="flex items-center gap-1 text-zinc-400 hover:text-white font-mono text-[11px] transition-colors"
                              >
                                <Phone className="w-3 h-3 text-zinc-500" />
                                {lead.business.phone_number}
                              </a>
                            ) : (
                              <span className="text-zinc-600 font-mono text-[11px]">No Phone</span>
                            )}
                          </div>
                        </td>

                        {/* Tag Chips */}
                        <td className="py-3.5 px-4 min-w-[140px]">
                          <div className="flex flex-wrap items-center gap-1">
                            {lead.tags && lead.tags.length > 0 ? (
                              lead.tags.map((tag, idx) => {
                                const name = typeof tag === 'string' ? tag : tag.name;
                                const color = typeof tag === 'string' ? '#10B981' : tag.color;
                                return (
                                  <span
                                    key={idx}
                                    style={{ borderColor: `${color}40`, backgroundColor: `${color}15` }}
                                    className="inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded border text-white"
                                  >
                                    <span style={{ backgroundColor: color }} className="w-1.5 h-1.5 rounded-full" />
                                    {name}
                                  </span>
                                );
                              })
                            ) : (
                              <span className="text-zinc-600 font-mono text-[11px]">—</span>
                            )}
                          </div>
                        </td>

                        {/* Action Column */}
                        <td className="py-3.5 pr-4 pl-2 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              href={`/leads/${lead.id}`}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-emerald-500/20 text-zinc-300 hover:text-emerald-300 border border-white/[0.08] hover:border-emerald-500/30 transition-all font-sans text-xs"
                            >
                              <span>Dossier</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </Link>

                            {onDeleteLead && (
                              <button
                                onClick={() => onDeleteLead(lead.id)}
                                title="Archive lead"
                                className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* Empty State */
            <div className="py-16 px-6 text-center flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                <TagIcon className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="font-sans font-semibold text-lg text-white mb-1">
                No Leads in Pipeline
              </h3>
              <p className="font-sans text-xs text-zinc-400 max-w-sm mb-5 leading-relaxed">
                {searchQuery || selectedStatusTab !== 'ALL'
                  ? 'No leads matched your current filters. Try resetting the status tab or clearing your search.'
                  : 'Your pipeline is currently empty. Use the Lead Finder to discover high-yield local businesses and convert them into active opportunities.'}
              </p>
              <Link
                href="/finder"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-sans font-semibold text-xs shadow-lg shadow-emerald-500/20 transition-all btn-tactile"
              >
                <Sparkles className="w-4 h-4 text-black" />
                Find Businesses with Google Places
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
