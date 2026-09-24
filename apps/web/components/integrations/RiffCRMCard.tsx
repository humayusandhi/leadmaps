'use client';

import * as React from 'react';
import type { IntegrationDTO } from '@leadmap/shared-types';
import { apiClient } from '@/lib/api/client';
import {
  Share2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Power,
  Key,
  Globe,
  Sliders,
  ShieldCheck,
  Eye,
  EyeOff,
  Zap,
} from 'lucide-react';

interface RiffCRMCardProps {
  integration?: IntegrationDTO | null;
  onUpdate: () => void;
}

export function RiffCRMCard({ integration, onUpdate }: RiffCRMCardProps) {
  const isConnected = integration?.status === 'CONNECTED';
  const isError = integration?.status === 'ERROR';

  const [apiKey, setApiKey] = React.useState('');
  const [showApiKey, setShowApiKey] = React.useState(false);
  const [baseUrl, setBaseUrl] = React.useState('https://api.riffcrm.com');
  const [autoSync, setAutoSync] = React.useState(integration?.settings?.auto_sync_high_score ?? true);
  const [scoreThreshold, setScoreThreshold] = React.useState(integration?.settings?.score_threshold ?? 80);

  const [isTesting, setIsTesting] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isDisconnecting, setIsDisconnecting] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null);

  React.useEffect(() => {
    if (integration) {
      if (integration.base_url) setBaseUrl(integration.base_url);
      if (integration.settings?.auto_sync_high_score !== undefined) {
        setAutoSync(integration.settings.auto_sync_high_score);
      }
      if (integration.settings?.score_threshold !== undefined) {
        setScoreThreshold(integration.settings.score_threshold);
      }
    }
  }, [integration]);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setFeedback(null);
    try {
      if (integration?.id) {
        await apiClient.post(`/api/v1/integrations/${integration.id}/test`, {
          credentials: apiKey ? { api_key: apiKey, base_url: baseUrl } : undefined,
        });
      } else {
        if (!apiKey) {
          throw new Error('Please enter an API Key to test connection.');
        }
        // Test via connect dry run
        await apiClient.post('/api/v1/integrations/connect', {
          provider: 'riffcrm',
          credentials: { api_key: apiKey, base_url: baseUrl },
          test_before_connect: true,
        });
      }
      setFeedback({ type: 'success', message: 'Connection handshake verified with RiffCRM API!' });
      onUpdate();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Connection test failed.';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey && !integration?.has_credentials) {
      setFeedback({ type: 'error', message: 'API key is required to configure integration.' });
      return;
    }

    setIsSaving(true);
    setFeedback(null);
    try {
      await apiClient.post('/api/v1/integrations/connect', {
        provider: 'riffcrm',
        name: 'RiffCRM Production',
        credentials: {
          api_key: apiKey || 'riff_retained_encrypted_key',
          base_url: baseUrl,
        },
        settings: {
          auto_sync_high_score: autoSync,
          score_threshold: Number(scoreThreshold),
          sync_tags: true,
        },
        test_before_connect: true,
      });

      setFeedback({ type: 'success', message: 'RiffCRM configuration connected & saved successfully!' });
      setApiKey('');
      onUpdate();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to save integration.';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDisconnect = async () => {
    if (!integration?.id) return;
    setIsDisconnecting(true);
    setFeedback(null);
    try {
      await apiClient.delete(`/api/v1/integrations/${integration.id}`);
      setFeedback({ type: 'success', message: 'RiffCRM integration disconnected.' });
      onUpdate();
    } catch (err: any) {
      setFeedback({ type: 'error', message: 'Failed to disconnect integration.' });
    } finally {
      setIsDisconnecting(false);
    }
  };

  const stats = integration?.stats || { total_syncs: 0, successful_syncs: 0, failed_syncs: 0 };
  const successRate = stats.total_syncs > 0 ? Math.round((stats.successful_syncs / stats.total_syncs) * 100) : 100;

  return (
    <div className="rounded-2xl bg-[#111318] border border-white/[0.08] p-6 shadow-xl relative overflow-hidden flex flex-col justify-between group">
      {/* Ambient background glow for Signal Emerald */}
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div>
        {/* Header Bar */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
              <Share2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-sans font-bold text-lg text-white">RiffCRM</h3>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                  Native 2-Way
                </span>
              </div>
              <p className="font-sans text-xs text-zinc-400 mt-0.5">
                Direct REST pipeline sync with custom fields, opportunities, and score waterfall
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-2">
            {isConnected ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Connected
              </span>
            ) : isError ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-rose-500/10 text-rose-400 border border-rose-500/30">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                Error
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-white/[0.04] text-zinc-400 border border-white/[0.08]">
                Disconnected
              </span>
            )}
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`mb-5 p-3 rounded-xl text-xs font-mono border flex items-center justify-between ${
              feedback.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
            }`}
          >
            <span>{feedback.message}</span>
            <button
              onClick={() => setFeedback(null)}
              className="text-zinc-400 hover:text-white text-xs ml-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* Configuration Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block font-mono text-xs text-zinc-400 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-zinc-400" />
                API Key
              </span>
              {integration?.masked_api_key && !apiKey && (
                <span className="text-[11px] text-zinc-500">
                  Active: {integration.masked_api_key}
                </span>
              )}
            </label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={
                  integration?.has_credentials
                    ? 'Enter new API key to update...'
                    : 'riff_live_••••••••••••••••'
                }
                className="w-full rounded-xl bg-black/40 border border-white/[0.08] px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 font-mono focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all pr-10"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block font-mono text-xs text-zinc-400 mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-zinc-400" />
              API Endpoint URL
            </label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://api.riffcrm.com"
              className="w-full rounded-xl bg-black/40 border border-white/[0.08] px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 font-mono focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
            />
          </div>

          {/* Sync Behavior Preferences */}
          <div className="pt-2 border-t border-white/[0.06] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-sans text-xs font-semibold text-white block">
                  Automatic High-Score Sync
                </span>
                <span className="font-sans text-[11px] text-zinc-500 block">
                  Instantly push researched leads scoring above threshold
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSync}
                  onChange={(e) => setAutoSync(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            {autoSync && (
              <div className="flex items-center justify-between pl-2">
                <span className="font-mono text-xs text-zinc-400">Score Threshold:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="50"
                    max="95"
                    step="5"
                    value={scoreThreshold}
                    onChange={(e) => setScoreThreshold(Number(e.target.value))}
                    className="w-24 accent-emerald-400"
                  />
                  <span className="font-mono text-xs font-bold text-emerald-400 w-8 text-right">
                    ≥{scoreThreshold}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 hover:text-white border border-white/[0.08] text-xs font-mono transition-all btn-tactile disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-zinc-400 ${isTesting ? 'animate-spin' : ''}`} />
                <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
              </button>

              {isConnected && (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  disabled={isDisconnecting}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/25 text-xs font-mono transition-all btn-tactile disabled:opacity-50"
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>Disconnect</span>
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-sans font-semibold text-xs transition-all btn-tactile shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Connecting...' : isConnected ? 'Save Changes' : 'Connect RiffCRM'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Sync Metric Strip */}
      <div className="mt-6 pt-4 border-t border-white/[0.06] grid grid-cols-3 gap-2 text-center">
        <div>
          <span className="font-mono text-xs text-zinc-500 block">Total Synced</span>
          <span className="font-mono text-sm font-bold text-white mt-0.5 block">
            {stats.total_syncs}
          </span>
        </div>
        <div>
          <span className="font-mono text-xs text-zinc-500 block">Success Rate</span>
          <span className="font-mono text-sm font-bold text-emerald-400 mt-0.5 block">
            {successRate}%
          </span>
        </div>
        <div>
          <span className="font-mono text-xs text-zinc-500 block">Last Active</span>
          <span className="font-mono text-[11px] text-zinc-400 mt-0.5 block truncate">
            {integration?.last_synced_at
              ? new Date(integration.last_synced_at).toLocaleDateString()
              : 'Never'}
          </span>
        </div>
      </div>
    </div>
  );
}
