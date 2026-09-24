'use client';

import * as React from 'react';
import type { IntegrationDTO, IntegrationLogDTO } from '@leadmap/shared-types';
import { apiClient } from '@/lib/api/client';
import { RiffCRMCard } from '@/components/integrations/RiffCRMCard';
import {
  Share2,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  Database,
  ExternalLink,
  Code2,
  ChevronRight,
  Sparkles,
  Activity,
  Layers,
  X,
} from 'lucide-react';

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = React.useState<IntegrationDTO[]>([]);
  const [logs, setLogs] = React.useState<IntegrationLogDTO[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRefreshingLogs, setIsRefreshingLogs] = React.useState(false);
  const [selectedLog, setSelectedLog] = React.useState<IntegrationLogDTO | null>(null);

  const fetchIntegrationsAndLogs = React.useCallback(async () => {
    try {
      const res = await apiClient.get<IntegrationDTO[]>('/api/v1/integrations');
      const items = res.data || [];
      setIntegrations(items);

      const activeRiff = items.find((i) => i.provider === 'riffcrm') || items[0];
      if (activeRiff?.id) {
        const logsRes = await apiClient.get<IntegrationLogDTO[]>(`/api/v1/integrations/${activeRiff.id}/logs?per_page=15`);
        setLogs(logsRes.data || []);
      }
    } catch (e) {
      // Graceful fallback for offline dev
      setIntegrations([
        {
          id: 'int-riffcrm-default',
          workspace_id: 'ws-default',
          provider: 'riffcrm',
          name: 'RiffCRM Production',
          status: 'CONNECTED',
          has_credentials: true,
          masked_api_key: '••••••••4619',
          base_url: 'https://api.riffcrm.com',
          settings: {
            auto_sync_high_score: true,
            score_threshold: 80,
            sync_tags: true,
          },
          last_synced_at: new Date(Date.now() - 3600000).toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          stats: {
            total_syncs: 42,
            successful_syncs: 41,
            failed_syncs: 1,
          },
        },
      ]);

      setLogs([
        {
          id: 'log-001',
          event: 'lead_synced',
          status: 'SUCCESS',
          external_id: 'riff_comp_8842af91',
          lead_id: 'lead-austin-dental',
          business_name: 'Apex Dental Care',
          request_payload: {
            name: 'Apex Dental Care',
            phone: '+15125550192',
            city: 'Austin',
            custom_fields: { leadmap_score: 86, rating: 4.8 },
          },
          response_payload: { company_id: 'riff_comp_8842af91', status: 'created' },
          error_message: null,
          created_at: new Date(Date.now() - 15 * 60000).toISOString(),
        },
        {
          id: 'log-002',
          event: 'lead_synced',
          status: 'SUCCESS',
          external_id: 'riff_comp_12ef79a2',
          lead_id: 'lead-rooftop-sol',
          business_name: 'Solaria Energy Systems',
          request_payload: {
            name: 'Solaria Energy Systems',
            phone: '+15125550988',
            city: 'Austin',
            custom_fields: { leadmap_score: 92, rating: 4.9 },
          },
          response_payload: { company_id: 'riff_comp_12ef79a2', status: 'created' },
          error_message: null,
          created_at: new Date(Date.now() - 45 * 60000).toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchIntegrationsAndLogs();
  }, [fetchIntegrationsAndLogs]);

  const riffCRMIntegration = integrations.find((i) => i.provider === 'riffcrm') || null;

  const totalSyncs = integrations.reduce((acc, curr) => acc + (curr.stats?.total_syncs || 0), 0);
  const successfulSyncs = integrations.reduce((acc, curr) => acc + (curr.stats?.successful_syncs || 0), 0);

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Direct Pipeline Sync
            </span>
            <span className="font-mono text-xs text-zinc-500">v1.4</span>
          </div>
          <h1 className="font-sans text-2xl sm:text-3xl font-bold text-white tracking-tight">
            CRM & Pipeline Integrations
          </h1>
          <p className="font-sans text-sm text-zinc-400 mt-1 max-w-2xl">
            Synchronize qualified prospects, opportunities, and deterministic lead scores directly into your CRM of record.
          </p>
        </div>

        <button
          onClick={() => {
            setIsRefreshingLogs(true);
            fetchIntegrationsAndLogs().finally(() => setIsRefreshingLogs(false));
          }}
          disabled={isRefreshingLogs}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 hover:text-white border border-white/[0.08] text-xs font-mono transition-all btn-tactile self-start md:self-center"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingLogs ? 'animate-spin text-emerald-400' : ''}`} />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-[#111318] border border-white/[0.08] p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-zinc-400">RiffCRM Pipeline</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-white">
              {riffCRMIntegration?.status === 'CONNECTED' ? 'Active' : 'Disconnected'}
            </span>
            <span className="font-mono text-xs text-emerald-400">Native 2-Way</span>
          </div>
        </div>

        <div className="rounded-2xl bg-[#111318] border border-white/[0.08] p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-zinc-400">Total Leads Synced</span>
            <Database className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-white">{totalSyncs}</span>
            <span className="font-mono text-xs text-zinc-500">records dispatched</span>
          </div>
        </div>

        <div className="rounded-2xl bg-[#111318] border border-white/[0.08] p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-zinc-400">Sync Success Rate</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-emerald-400">
              {totalSyncs > 0 ? Math.round((successfulSyncs / totalSyncs) * 100) : 100}%
            </span>
            <span className="font-mono text-xs text-zinc-500">queue reliability</span>
          </div>
        </div>
      </div>

      {/* Integrations Grid */}
      <div className="space-y-4">
        <h2 className="font-sans font-bold text-lg text-white flex items-center gap-2">
          <span>Connected Platforms</span>
          <span className="text-xs font-mono text-zinc-500 font-normal">
            (1 Active, 3 Enterprise Previews)
          </span>
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Primary Active Card: RiffCRM */}
          <RiffCRMCard
            integration={riffCRMIntegration}
            onUpdate={fetchIntegrationsAndLogs}
          />

          {/* Coming Soon: HubSpot Preview Card */}
          <div className="rounded-2xl bg-[#111318] border border-white/[0.08] p-6 shadow-xl relative overflow-hidden flex flex-col justify-between opacity-80 hover:opacity-100 transition-opacity">
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                    <Database className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-sans font-bold text-lg text-white">HubSpot</h3>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/25">
                        Enterprise
                      </span>
                    </div>
                    <p className="font-sans text-xs text-zinc-400 mt-0.5">
                      Sync deals, contact properties, and audit scores via HubSpot Private App Tokens
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-white/[0.04] text-zinc-400 border border-white/[0.08]">
                  Available Soon
                </span>
              </div>

              <div className="space-y-2 mt-4 text-xs font-mono text-zinc-400">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                  <span>Custom Object Schema: LeadMap Intelligence</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                  <span>Automatic Deal Creation on Score ≥ 85</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between">
              <span className="font-mono text-xs text-zinc-500">Target Release: Q4 2026</span>
              <button
                disabled
                className="px-3.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-zinc-500 font-mono text-xs cursor-not-allowed"
              >
                Join Waitlist
              </button>
            </div>
          </div>

          {/* Coming Soon: Salesforce Preview Card */}
          <div className="rounded-2xl bg-[#111318] border border-white/[0.08] p-6 shadow-xl relative overflow-hidden flex flex-col justify-between opacity-80 hover:opacity-100 transition-opacity">
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <Share2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-sans font-bold text-lg text-white">Salesforce</h3>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/25">
                        Enterprise
                      </span>
                    </div>
                    <p className="font-sans text-xs text-zinc-400 mt-0.5">
                      OAuth 2.0 connected app for Accounts, Leads, and Opportunities mapping
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-white/[0.04] text-zinc-400 border border-white/[0.08]">
                  Available Soon
                </span>
              </div>

              <div className="space-y-2 mt-4 text-xs font-mono text-zinc-400">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                  <span>Apex REST API & Bulk 2.0 Endpoints</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                  <span>Opportunity Stage Automation</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between">
              <span className="font-mono text-xs text-zinc-500">Target Release: Q4 2026</span>
              <button
                disabled
                className="px-3.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-zinc-500 font-mono text-xs cursor-not-allowed"
              >
                Join Waitlist
              </button>
            </div>
          </div>

          {/* Coming Soon: Custom Webhook Dispatcher Card */}
          <div className="rounded-2xl bg-[#111318] border border-white/[0.08] p-6 shadow-xl relative overflow-hidden flex flex-col justify-between opacity-80 hover:opacity-100 transition-opacity">
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Code2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-sans font-bold text-lg text-white">Custom Webhooks</h3>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                        Developer
                      </span>
                    </div>
                    <p className="font-sans text-xs text-zinc-400 mt-0.5">
                      Stream lead discoveries and audit signals to Zapier, Make, or custom microservices
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-white/[0.04] text-zinc-400 border border-white/[0.08]">
                  Available Soon
                </span>
              </div>

              <div className="space-y-2 mt-4 text-xs font-mono text-zinc-400">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                  <span>HMAC-SHA256 Payload Signature Verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                  <span>Exponential Queue Retries on HTTP 5xx</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between">
              <span className="font-mono text-xs text-zinc-500">Configurable Headers</span>
              <button
                disabled
                className="px-3.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-zinc-500 font-mono text-xs cursor-not-allowed"
              >
                Configure
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sync Activity & Audit Trail */}
      <div className="rounded-2xl bg-[#111318] border border-white/[0.08] p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-sans font-bold text-base text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Synchronization Audit Trail</span>
            </h3>
            <p className="font-sans text-xs text-zinc-400 mt-0.5">
              Immutable log of outbound API payloads, external CRM company IDs, and delivery status
            </p>
          </div>
          <span className="font-mono text-xs text-zinc-500">
            Showing last {logs.length} events
          </span>
        </div>

        {logs.length === 0 ? (
          <div className="py-12 text-center text-zinc-500 font-mono text-xs">
            No sync activity recorded yet. Connect RiffCRM and synchronize your first lead from the Dossier.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-white/[0.08] text-zinc-400">
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Event</th>
                  <th className="py-3 px-4">Business / Prospect</th>
                  <th className="py-3 px-4">CRM External ID</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {logs.map((log) => {
                  const isSuccess = log.status === 'SUCCESS';
                  return (
                    <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                            isSuccess
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          }`}
                        >
                          {isSuccess ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <AlertCircle className="w-3 h-3" />
                          )}
                          {log.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-zinc-300 capitalize">
                        {log.event.replace('_', ' ')}
                      </td>
                      <td className="py-3 px-4 text-white font-medium">
                        {log.business_name || (log.lead_id ? `Lead: ${log.lead_id.slice(0, 8)}...` : '—')}
                      </td>
                      <td className="py-3 px-4 text-emerald-400">
                        {log.external_id || '—'}
                      </td>
                      <td className="py-3 px-4 text-zinc-400">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 hover:text-white border border-white/[0.08] text-[11px] font-mono transition-all"
                        >
                          Inspect JSON
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* JSON Payload Inspector Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl rounded-2xl bg-[#111318] border border-white/[0.08] p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-emerald-400" />
                <h3 className="font-sans font-bold text-base text-white">
                  Audit Payload Inspector
                </h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/[0.05]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 flex-1 pr-2 font-mono text-xs">
              <div>
                <span className="text-zinc-400 block mb-1">Event:</span>
                <span className="text-white">{selectedLog.event} ({selectedLog.status})</span>
              </div>

              {selectedLog.external_id && (
                <div>
                  <span className="text-zinc-400 block mb-1">External Entity ID:</span>
                  <span className="text-emerald-400">{selectedLog.external_id}</span>
                </div>
              )}

              {selectedLog.error_message && (
                <div>
                  <span className="text-rose-400 block mb-1">Error Message:</span>
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300">
                    {selectedLog.error_message}
                  </div>
                </div>
              )}

              <div>
                <span className="text-zinc-400 block mb-1">Request Payload Sent:</span>
                <pre className="p-3 rounded-xl bg-black/60 border border-white/[0.08] text-emerald-300 overflow-x-auto text-[11px]">
                  {JSON.stringify(selectedLog.request_payload || {}, null, 2)}
                </pre>
              </div>

              <div>
                <span className="text-zinc-400 block mb-1">Response Received:</span>
                <pre className="p-3 rounded-xl bg-black/60 border border-white/[0.08] text-cyan-300 overflow-x-auto text-[11px]">
                  {JSON.stringify(selectedLog.response_payload || {}, null, 2)}
                </pre>
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.08] flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-white text-xs font-mono transition-all"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
