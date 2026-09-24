'use client';

import * as React from 'react';
import type { CRMSyncStatus } from '@leadmap/shared-types';
import { CheckCircle2, RefreshCw, AlertCircle, CloudOff } from 'lucide-react';

interface SyncStatusBadgeProps {
  status?: CRMSyncStatus | string | null;
  externalId?: string | null;
  syncedAt?: string | null;
  className?: string;
  showDetails?: boolean;
}

export function SyncStatusBadge({
  status = 'NOT_SYNCED',
  externalId,
  syncedAt,
  className = '',
  showDetails = false,
}: SyncStatusBadgeProps) {
  const normalizedStatus = (status || 'NOT_SYNCED').toUpperCase();

  let badgeColor = 'bg-white/[0.04] text-zinc-400 border-white/[0.08]';
  let icon = <CloudOff className="w-3 h-3" />;
  let label = 'Not Synced';

  switch (normalizedStatus) {
    case 'SYNCED':
      badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      icon = <CheckCircle2 className="w-3 h-3 text-emerald-400" />;
      label = 'Synced to CRM';
      break;
    case 'SYNCING':
      badgeColor = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 animate-pulse';
      icon = <RefreshCw className="w-3 h-3 text-cyan-400 animate-spin" />;
      label = 'Syncing...';
      break;
    case 'FAILED':
      badgeColor = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      icon = <AlertCircle className="w-3 h-3 text-rose-400" />;
      label = 'Sync Failed';
      break;
  }

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium border ${badgeColor} transition-colors`}
        title={
          externalId
            ? `CRM ID: ${externalId}${syncedAt ? ` | Synced: ${new Date(syncedAt).toLocaleString()}` : ''}`
            : undefined
        }
      >
        {icon}
        <span>{label}</span>
      </span>

      {showDetails && externalId && (
        <span className="font-mono text-[11px] text-zinc-500 hidden sm:inline-block">
          ({externalId})
        </span>
      )}
    </div>
  );
}
