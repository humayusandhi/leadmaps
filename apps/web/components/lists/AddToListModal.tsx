'use client';

import * as React from 'react';
import { X, Folder, Check, Plus, Layers } from 'lucide-react';
import { LeadListDTO } from '@leadmap/shared-types';

interface AddToListModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadIds: string[];
  lists: LeadListDTO[];
  onAddToList: (listId: string, leadIds: string[]) => Promise<void> | void;
  onCreateNewListClick: () => void;
}

export function AddToListModal({
  isOpen,
  onClose,
  leadIds,
  lists,
  onAddToList,
  onCreateNewListClick,
}: AddToListModalProps) {
  const [selectedListId, setSelectedListId] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [successListId, setSuccessListId] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (!selectedListId) return;

    setIsSubmitting(true);
    try {
      await onAddToList(selectedListId, leadIds);
      setSuccessListId(selectedListId);
      setTimeout(() => {
        setSuccessListId(null);
        onClose();
      }, 700);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md rounded-2xl bg-[#0E1015] border border-white/[0.08] shadow-[0_16px_60px_rgba(0,0,0,0.8)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
              <Layers className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight">Add to Custom List</h2>
              <p className="text-xs text-slate-400">
                Adding {leadIds.length} {leadIds.length === 1 ? 'lead' : 'leads'} to segment
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {lists.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-sm">
                No custom lists created yet.
              </div>
            ) : (
              lists.map((list) => {
                const isSelected = selectedListId === list.id;
                const isSuccess = successListId === list.id;

                return (
                  <button
                    key={list.id}
                    type="button"
                    onClick={() => setSelectedListId(list.id)}
                    className={`w-full px-4 py-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-white'
                        : 'bg-white/[0.02] border-white/[0.06] text-slate-300 hover:bg-white/[0.04] hover:border-white/[0.12]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: list.color || '#10B981' }}
                      />
                      <div>
                        <div className="text-sm font-medium tracking-tight text-white flex items-center gap-2">
                          {list.name}
                        </div>
                        <div className="text-xs text-slate-500 font-mono">
                          {list.leads_count ?? 0} leads currently
                        </div>
                      </div>
                    </div>

                    <div className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center transition-colors">
                      {isSuccess ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : isSelected ? (
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                      ) : null}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              onCreateNewListClick();
            }}
            className="w-full py-2.5 px-3 rounded-xl border border-dashed border-white/10 hover:border-emerald-500/40 text-xs font-mono uppercase tracking-wider text-slate-400 hover:text-emerald-400 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create New List
          </button>

          {/* Actions */}
          <div className="pt-4 border-t border-white/[0.06] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/[0.04] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!selectedListId || isSubmitting}
              onClick={handleConfirm}
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-semibold shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transition-all inline-flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : successListId ? (
                <>
                  <Check className="w-4 h-4 text-slate-950" />
                  Added!
                </>
              ) : (
                'Add to List'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
