'use client';

import * as React from 'react';
import { 
  X, 
  Download, 
  FileSpreadsheet, 
  CheckSquare, 
  Square, 
  Check, 
  Sparkles,
  ArrowDownToLine
} from 'lucide-react';
import { ExportField } from '@leadmap/shared-types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadCount?: number;
  listName?: string;
  onExport: (selectedColumns: ExportField[]) => Promise<void> | void;
}

interface ColumnOption {
  key: ExportField;
  label: string;
  category: 'core' | 'contact' | 'intelligence' | 'signals';
}

const ALL_COLUMNS: ColumnOption[] = [
  // Core Business
  { key: 'business_name', label: 'Business Name', category: 'core' },
  { key: 'city', label: 'City', category: 'core' },
  { key: 'address', label: 'Full Address', category: 'core' },
  { key: 'rating', label: 'Google Rating (★)', category: 'core' },
  { key: 'reviews_count', label: 'Review Count', category: 'core' },

  // Contact Details
  { key: 'phone', label: 'Phone Number', category: 'contact' },
  { key: 'email', label: 'Email Address', category: 'contact' },
  { key: 'website', label: 'Website URL', category: 'contact' },

  // Intelligence & Score
  { key: 'lead_score', label: 'Lead Score (0-100)', category: 'intelligence' },
  { key: 'status', label: 'Pipeline Stage', category: 'intelligence' },
  { key: 'top_opportunity', label: 'Primary Sales Pitch Angle', category: 'intelligence' },
  { key: 'opportunities_count', label: 'Opportunities Count', category: 'intelligence' },
  { key: 'technical_deficit', label: 'Key Technical Deficit', category: 'intelligence' },

  // Signals
  { key: 'cms', label: 'CMS / Tech Stack', category: 'signals' },
  { key: 'has_ssl', label: 'SSL Active (HTTPS)', category: 'signals' },
  { key: 'mobile_responsive', label: 'Mobile Responsive', category: 'signals' },
  { key: 'has_booking', label: 'Online Booking Embed', category: 'signals' },
  { key: 'has_whatsapp', label: 'WhatsApp Widget', category: 'signals' },
];

export function ExportModal({
  isOpen,
  onClose,
  leadCount = 1,
  listName,
  onExport,
}: ExportModalProps) {
  const [selectedKeys, setSelectedKeys] = React.useState<Set<ExportField>>(
    new Set(ALL_COLUMNS.map((c) => c.key))
  );
  const [isExporting, setIsExporting] = React.useState(false);
  const [exportComplete, setExportComplete] = React.useState(false);

  if (!isOpen) return null;

  const toggleColumn = (key: ExportField) => {
    const next = new Set(selectedKeys);
    if (next.has(key)) {
      if (next.size > 1) next.delete(key);
    } else {
      next.add(key);
    }
    setSelectedKeys(next);
  };

  const selectAll = () => {
    setSelectedKeys(new Set(ALL_COLUMNS.map((c) => c.key)));
  };

  const selectEssentialsOnly = () => {
    setSelectedKeys(
      new Set([
        'business_name',
        'phone',
        'email',
        'website',
        'city',
        'lead_score',
        'top_opportunity',
      ] as ExportField[])
    );
  };

  const selectAuditOnly = () => {
    setSelectedKeys(
      new Set([
        'business_name',
        'website',
        'lead_score',
        'top_opportunity',
        'technical_deficit',
        'has_ssl',
        'mobile_responsive',
        'has_booking',
        'cms',
      ] as ExportField[])
    );
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await onExport(Array.from(selectedKeys));
      setExportComplete(true);
      setTimeout(() => {
        setExportComplete(false);
        onClose();
      }, 1200);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl rounded-2xl bg-[#0E1015] border border-white/[0.08] shadow-[0_16px_60px_rgba(0,0,0,0.8)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight">Export Leads (RFC 4180 CSV)</h2>
              <p className="text-xs text-slate-400">
                {listName ? `Scope: ${listName} • ` : ''}
                Targeting <span className="text-white font-medium">{leadCount}</span> {leadCount === 1 ? 'record' : 'records'}
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
        <div className="p-6 space-y-5">
          {/* Quick Preset Selector */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Select Columns ({selectedKeys.size}/{ALL_COLUMNS.length})
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={selectAll}
                className="text-[11px] font-mono text-emerald-400 hover:underline px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20"
              >
                All Fields
              </button>
              <button
                type="button"
                onClick={selectEssentialsOnly}
                className="text-[11px] font-mono text-slate-300 hover:text-white px-2 py-1 rounded bg-white/[0.04] border border-white/[0.08]"
              >
                CRM Essentials
              </button>
              <button
                type="button"
                onClick={selectAuditOnly}
                className="text-[11px] font-mono text-slate-300 hover:text-white px-2 py-1 rounded bg-white/[0.04] border border-white/[0.08]"
              >
                Audit Signals Only
              </button>
            </div>
          </div>

          {/* Grid of Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
            {ALL_COLUMNS.map((col) => {
              const isChecked = selectedKeys.has(col.key);
              return (
                <button
                  key={col.key}
                  type="button"
                  onClick={() => toggleColumn(col.key)}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-left text-xs transition-all ${
                    isChecked
                      ? 'bg-emerald-500/[0.08] border-emerald-500/30 text-white'
                      : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                  }`}
                >
                  <div className={`w-4 h-4 rounded flex items-center justify-center transition-colors ${
                    isChecked ? 'bg-emerald-500 text-slate-950' : 'border border-white/20'
                  }`}>
                    {isChecked ? <Check className="w-3 h-3 stroke-[3]" /> : null}
                  </div>
                  <span className="font-sans font-medium">{col.label}</span>
                </button>
              );
            })}
          </div>

          {/* Export compliance badge */}
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Encoding: UTF-8 with BOM</span>
            <span className="text-emerald-400">Compatible with Excel &bull; Salesforce &bull; HubSpot</span>
          </div>

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
              disabled={isExporting || selectedKeys.size === 0}
              onClick={handleExport}
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-semibold shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transition-all inline-flex items-center gap-2"
            >
              {isExporting ? (
                <>
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  Generating CSV...
                </>
              ) : exportComplete ? (
                <>
                  <Check className="w-4 h-4 text-slate-950" />
                  Downloaded!
                </>
              ) : (
                <>
                  <ArrowDownToLine className="w-4 h-4" />
                  Download CSV
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
