'use client';

import * as React from 'react';
import Link from 'next/link';
import { LeadListDTO } from '@leadmap/shared-types';
import { Folder, Users, Download, Trash2, ArrowRight } from 'lucide-react';

interface ListCardProps {
  list: LeadListDTO;
  onExport: (list: LeadListDTO) => void;
  onDelete: (listId: string) => void;
  onView: (list: LeadListDTO) => void;
}

export function ListCard({ list, onExport, onDelete, onView }: ListCardProps) {
  const [isConfirmingDelete, setIsConfirmingDelete] = React.useState(false);

  return (
    <div className="group relative rounded-2xl bg-[#111318] border border-white/[0.08] hover:border-white/[0.16] transition-all duration-300 p-6 flex flex-col justify-between shadow-[0_4px_24px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
      {/* Top Accent bar */}
      <div 
        className="absolute top-0 left-6 right-6 h-[2px] rounded-full opacity-60 group-hover:opacity-100 transition-opacity"
        style={{ backgroundColor: list.color || '#10B981' }}
      />

      {/* Header Info */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div 
              className="w-9 h-9 rounded-xl flex items-center justify-center border"
              style={{ 
                backgroundColor: `${list.color || '#10B981'}15`,
                borderColor: `${list.color || '#10B981'}35`
              }}
            >
              <Folder 
                className="w-4 h-4" 
                style={{ color: list.color || '#10B981' }} 
              />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white tracking-tight group-hover:text-emerald-400 transition-colors">
                {list.name}
              </h3>
              <div className="text-xs text-slate-500 font-mono">
                Updated {new Date(list.updated_at).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Lead count badge */}
          <div className="px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center gap-1.5 text-xs font-mono text-slate-300">
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <span>{list.leads_count ?? 0}</span>
          </div>
        </div>

        {list.description ? (
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {list.description}
          </p>
        ) : (
          <p className="text-xs text-slate-600 italic">No description added.</p>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-5 mt-5 border-t border-white/[0.06] flex items-center justify-between gap-2">
        <button
          onClick={() => onView(list)}
          className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          <span>Explore Leads</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onExport(list)}
            title="Export List as CSV"
            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>

          {isConfirmingDelete ? (
            <div className="flex items-center gap-1 bg-rose-500/10 border border-rose-500/30 rounded-lg px-2 py-0.5 animate-in fade-in">
              <span className="text-[10px] font-mono text-rose-400">Delete?</span>
              <button
                onClick={() => onDelete(list.id)}
                className="text-[10px] font-mono font-bold text-rose-300 hover:underline px-1"
              >
                Yes
              </button>
              <button
                onClick={() => setIsConfirmingDelete(false)}
                className="text-[10px] font-mono text-slate-400 hover:text-white px-1"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsConfirmingDelete(true)}
              title="Delete List"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
