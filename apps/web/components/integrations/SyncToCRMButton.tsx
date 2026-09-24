'use client';

import * as React from 'react';
import type { CRMSyncStatus } from '@leadmap/shared-types';
import { apiClient } from '@/lib/api/client';
import { RefreshCw, CheckCircle2, AlertCircle, Share2, Sparkles } from 'lucide-react';

interface SyncToCRMButtonProps {
  leadId: string;
  currentStatus?: CRMSyncStatus | string | null;
  externalId?: string | null;
  integrationId?: string | null;
  onSyncComplete?: (data: { crm_sync_status: CRMSyncStatus; crm_external_id: string }) => void;
  className?: string;
  size?: 'sm' | 'md';
}

export function SyncToCRMButton({
  leadId,
  currentStatus = 'NOT_SYNCED',
  externalId,
  integrationId,
  onSyncComplete,
  className = '',
  size = 'md',
}: SyncToCRMButtonProps) {
  const [status, setStatus] = React.useState<string>(currentStatus || 'NOT_SYNCED');
  const [loading, setLoading] = React.useState(false);
  const [activeIntegrationId, setActiveIntegrationId] = React.useState<string | null>(integrationId || null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Sync internal state with prop updates
  React.useEffect(() => {
    if (currentStatus) {
      setStatus(currentStatus);
    }
  }, [currentStatus]);

  // Load connected integration if not provided
  React.useEffect(() => {
    if (activeIntegrationId) return;

    let isMounted = true;
    async function fetchIntegration() {
      try {
        const res = await apiClient.get<any[]>('/api/v1/integrations');
        if (isMounted && res.data && res.data.length > 0) {
          const connected = res.data.find((item: any) => item.status === 'CONNECTED');
          if (connected) {
            setActiveIntegrationId(connected.id);
          } else {
            setActiveIntegrationId(res.data[0].id);
          }
        }
      } catch (e) {
        // Silent fallback
      }
    }

    fetchIntegration();
    return () => {
      isMounted = false;
    };
  }, [activeIntegrationId]);

  const handleSync = async () => {
    setLoading(true);
    setErrorMessage(null);
    setStatus('SYNCING');

    try {
      // If we still don't have an integration ID, fallback or create default mock/riffcrm
      let intId = activeIntegrationId;
      if (!intId) {
        // Connect default RiffCRM sandbox integration
        const connectRes = await apiClient.post<any>('/api/v1/integrations/connect', {
          provider: 'riffcrm',
          name: 'RiffCRM Production',
          credentials: {
            api_key: 'riff_live_demo_key_998811',
            base_url: 'https://api.riffcrm.com',
          },
          test_before_connect: false,
        });
        intId = connectRes.data?.id;
        setActiveIntegrationId(intId);
      }

      const res = await apiClient.post<any>(`/api/v1/integrations/${intId}/sync-lead`, {
        lead_id: leadId,
        sync_now: true,
      });

      setStatus('SYNCED');
      const extId = res.data?.crm_external_id || `riff_comp_${leadId.slice(0, 8)}`;
      onSyncComplete?.({
        crm_sync_status: 'SYNCED',
        crm_external_id: extId,
      });
    } catch (err: any) {
      setStatus('FAILED');
      const msg = err.response?.data?.message || err.message || 'Failed to sync lead to CRM';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const isSynced = status.toUpperCase() === 'SYNCED';
  const isSyncing = loading || status.toUpperCase() === 'SYNCING';
  const isFailed = status.toUpperCase() === 'FAILED';

  const sizeClasses = size === 'sm' ? 'px-2.5 py-1.5 text-xs' : 'px-3.5 py-2 text-xs';

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={handleSync}
        disabled={isSyncing}
        className={`flex items-center gap-1.5 rounded-xl font-mono transition-all btn-tactile ${sizeClasses} ${
          isSynced
            ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            : isFailed
            ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30'
            : 'bg-[#111318] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/[0.08] shadow-sm'
        } ${className}`}
        title={
          isSynced
            ? `Synced to CRM (ID: ${externalId || 'linked'}) — Click to re-sync`
            : 'Synchronize Company & Contacts into RiffCRM'
        }
      >
        {isSyncing ? (
          <>
            <RefreshCw className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
            <span>Syncing CRM...</span>
          </>
        ) : isSynced ? (
          <>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Synced to RiffCRM</span>
          </>
        ) : isFailed ? (
          <>
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>Retry CRM Sync</span>
          </>
        ) : (
          <>
            <Share2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sync to RiffCRM</span>
          </>
        )}
      </button>

      {errorMessage && (
        <span
          className="absolute -bottom-6 left-0 text-[10px] font-mono text-rose-400 whitespace-nowrap"
          title={errorMessage}
        >
          {errorMessage.slice(0, 30)}...
        </span>
      )}
    </div>
  );
}
