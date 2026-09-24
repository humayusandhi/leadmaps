'use client';

import * as React from 'react';
import type { WebsiteAnalysisDTO } from '@leadmap/shared-types';
import { SignalIndicatorRow } from './SignalIndicatorRow';
import {
  Activity,
  AlertTriangle,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Cpu,
  ExternalLink,
  Globe,
  Layout,
  MessageCircle,
  PhoneCall,
  RefreshCw,
  Search,
  Server,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';

interface TechnicalAuditGridProps {
  analysis: WebsiteAnalysisDTO | null;
  isLoading?: boolean;
  isTriggering?: boolean;
  leadWebsite?: string | null;
  onTriggerAudit: () => void;
}

export function TechnicalAuditGrid({
  analysis,
  isLoading = false,
  isTriggering = false,
  leadWebsite,
  onTriggerAudit,
}: TechnicalAuditGridProps) {
  // 1. Loading State (Initial Dossier Load)
  if (isLoading) {
    return (
      <div className="rounded-2xl bg-white/[0.08] p-[1px] shadow-xl">
        <div className="rounded-[15px] bg-[#111318] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-5 w-48 bg-white/[0.06] rounded animate-pulse" />
            <div className="h-8 w-28 bg-white/[0.06] rounded-xl animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-44 rounded-xl bg-white/[0.03] animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 2. Active Crawling / Processing State
  if (analysis?.status === 'crawling' || analysis?.status === 'pending' || isTriggering) {
    return (
      <div className="rounded-2xl bg-white/[0.08] p-[1px] shadow-xl">
        <div className="rounded-[15px] bg-[#111318] p-8 text-center space-y-4">
          <div className="relative inline-flex items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center">
              <RefreshCw className="w-6 h-6 text-emerald-400 animate-spin" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </span>
          </div>

          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="font-sans font-semibold text-base text-white">
              SSRF-Safe Crawler In Flight
            </h3>
            <p className="font-sans text-xs text-zinc-400 leading-relaxed">
              Validating DNS records, executing socket handshake, and analyzing DOM heuristics for{' '}
              <span className="font-mono text-emerald-400">{leadWebsite || analysis?.url || 'target URL'}</span>.
            </p>
          </div>

          <div className="w-full max-w-sm mx-auto bg-white/[0.06] h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full w-2/3 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // 3. Failed Crawl State
  if (analysis?.status === 'failed') {
    return (
      <div className="rounded-2xl bg-rose-500/20 p-[1px] shadow-xl">
        <div className="rounded-[15px] bg-[#111318] p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="font-sans font-semibold text-sm text-white">
                  Website Intelligence Audit Failed
                </h3>
                <p className="font-sans text-xs text-zinc-400 mt-0.5">
                  {analysis.error_message || 'Crawler encountered an unresolvable error.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onTriggerAudit}
              disabled={isTriggering}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/[0.1] font-sans text-xs font-semibold transition-all btn-tactile shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5 text-zinc-400" />
              Retry Diagnostic
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Empty State: No Audit Run Yet
  if (!analysis) {
    return (
      <div className="rounded-2xl bg-white/[0.08] p-[1px] shadow-xl">
        <div className="rounded-[15px] bg-[#111318] p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <h3 className="font-sans font-semibold text-base text-white">
                  Technical & Conversion Diagnostic Audit
                </h3>
              </div>
              <p className="font-sans text-xs text-zinc-400 max-w-xl leading-relaxed">
                Run our asynchronous SSRF-safe crawler to extract technical health, SEO structure,
                conversion bottlenecks, and heuristic CMS stack details for high-leverage outreach.
              </p>
            </div>

            <button
              type="button"
              onClick={onTriggerAudit}
              disabled={isTriggering || !leadWebsite}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-sans font-semibold text-xs shadow-lg shadow-emerald-500/20 transition-all btn-tactile shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Zap className="w-4 h-4 fill-black" />
              Run Audit Engine
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 5. Completed Audit State — Four-Panel Bento Grid (DESIGN.md Section 5.4)
  const seoDetails = analysis.raw_signals?.seo as Record<string, unknown> | undefined;
  const techDetails = analysis.raw_signals?.technical as Record<string, unknown> | undefined;
  const conversionDetails = analysis.raw_signals?.conversion as Record<string, unknown> | undefined;
  const titleText = (seoDetails?.title as string) || '';
  const schemaTypes = (seoDetails?.schema_types as string[]) || [];

  return (
    <div className="space-y-4">
      {/* Audit Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-sans font-bold text-sm text-white">
              Website Diagnostic Dossier
            </h3>
            <span className="font-mono text-[11px] text-zinc-500">
              Verified crawl via {analysis.final_url || analysis.url}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {analysis.crawled_at && (
            <span className="font-mono text-xs text-zinc-500 flex items-center gap-1">
              <Clock className="w-3 h-3 text-zinc-600" />
              {new Date(analysis.crawled_at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          )}

          <button
            type="button"
            onClick={onTriggerAudit}
            disabled={isTriggering}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 hover:text-white border border-white/[0.08] font-sans text-xs transition-spring btn-tactile"
          >
            <RefreshCw className="w-3 h-3 text-zinc-400" />
            Re-audit
          </button>
        </div>
      </div>

      {/* Four-Panel Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Panel 1: Technical Health */}
        <div className="rounded-2xl bg-white/[0.08] p-[1px] shadow-lg">
          <div className="rounded-[15px] bg-[#111318] p-5 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3 border-b border-white/[0.06] pb-2.5">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <h4 className="font-sans font-semibold text-xs text-white uppercase tracking-wider">
                    Technical Health
                  </h4>
                </div>
                <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  HTTP {analysis.http_status || 200} OK
                </span>
              </div>

              <div className="space-y-1">
                <SignalIndicatorRow
                  label="SSL / TLS Encryption"
                  value={analysis.is_ssl_active}
                  type="boolean"
                  detail={analysis.is_ssl_active ? 'HTTPS Protocol Active' : 'Unencrypted HTTP'}
                  icon={<ShieldCheck className="w-3.5 h-3.5" />}
                />
                <SignalIndicatorRow
                  label="Response Latency (TTFB)"
                  value={analysis.load_time_ms}
                  type="latency"
                  detail="Target benchmark < 1,000ms"
                  icon={<Zap className="w-3.5 h-3.5" />}
                />
                <SignalIndicatorRow
                  label="Mobile Viewport Responsive"
                  value={analysis.is_mobile_responsive}
                  type="boolean"
                  detail="Viewport width=device-width"
                  icon={<Layout className="w-3.5 h-3.5" />}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Panel 2: SEO Visibility */}
        <div className="rounded-2xl bg-white/[0.08] p-[1px] shadow-lg">
          <div className="rounded-[15px] bg-[#111318] p-5 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3 border-b border-white/[0.06] pb-2.5">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-sky-400" />
                  <h4 className="font-sans font-semibold text-xs text-white uppercase tracking-wider">
                    SEO Visibility
                  </h4>
                </div>
                <span className="font-mono text-[10px] text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                  {analysis.has_meta_description && analysis.has_schema_markup ? 'OPTIMIZED' : 'DEFICITS OBSERVED'}
                </span>
              </div>

              <div className="space-y-1">
                <SignalIndicatorRow
                  label="Meta Description Tag"
                  value={analysis.has_meta_description}
                  type="boolean"
                  detail={analysis.has_meta_description ? 'Found in HTML head' : 'Missing SERP snippet description'}
                  icon={<Globe className="w-3.5 h-3.5" />}
                />
                <SignalIndicatorRow
                  label="OpenGraph Social Cards"
                  value={analysis.has_open_graph}
                  type="boolean"
                  detail={analysis.has_open_graph ? 'og:title & og:image present' : 'Missing OpenGraph meta tags'}
                  icon={<Globe className="w-3.5 h-3.5" />}
                />
                <SignalIndicatorRow
                  label="Structured Schema Markup"
                  value={analysis.has_schema_markup}
                  type="boolean"
                  detail={schemaTypes.length > 0 ? `Types: ${schemaTypes.join(', ')}` : 'No JSON-LD / Microdata detected'}
                  icon={<Server className="w-3.5 h-3.5" />}
                />
                <div className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                  <span className="font-sans text-xs text-zinc-300">H1 Tag Count</span>
                  <span className="font-mono text-xs text-white bg-white/[0.06] px-2 py-0.5 rounded">
                    {analysis.h1_tags ? analysis.h1_tags.length : 0} tags
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Panel 3: Conversion Deficits */}
        <div className="rounded-2xl bg-white/[0.08] p-[1px] shadow-lg">
          <div className="rounded-[15px] bg-[#111318] p-5 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3 border-b border-white/[0.06] pb-2.5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h4 className="font-sans font-semibold text-xs text-white uppercase tracking-wider">
                    Conversion Deficits
                  </h4>
                </div>
                <span className="font-mono text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  REVENUE LEVERS
                </span>
              </div>

              <div className="space-y-1">
                <SignalIndicatorRow
                  label="Call-To-Action (CTA) Button"
                  value={analysis.has_cta}
                  type="boolean"
                  detail={analysis.has_cta ? 'Direct action element detected' : 'Absent hero CTA'}
                  icon={<Zap className="w-3.5 h-3.5" />}
                />
                <SignalIndicatorRow
                  label="Interactive Contact Form"
                  value={analysis.has_contact_form}
                  type="boolean"
                  detail={analysis.has_contact_form ? 'Lead capture form detected' : 'No web form detected'}
                  icon={<Layout className="w-3.5 h-3.5" />}
                />
                <SignalIndicatorRow
                  label="Direct Phone Link (tel:)"
                  value={analysis.has_tel_links}
                  type="boolean"
                  detail={analysis.has_tel_links ? 'Mobile click-to-call enabled' : 'Phone unlinked or missing'}
                  icon={<PhoneCall className="w-3.5 h-3.5" />}
                />
                <SignalIndicatorRow
                  label="WhatsApp Instant Chat"
                  value={analysis.has_whatsapp_chat}
                  type="boolean"
                  detail={analysis.has_whatsapp_chat ? 'wa.me or WhatsApp widget' : 'No direct chat flow'}
                  icon={<MessageCircle className="w-3.5 h-3.5" />}
                />
                <SignalIndicatorRow
                  label="Online Appointment Booking"
                  value={analysis.has_booking_embed}
                  type="boolean"
                  detail={analysis.has_booking_embed ? 'Calendly / Acuity embed found' : 'No calendar integration'}
                  icon={<CalendarCheck className="w-3.5 h-3.5" />}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Panel 4: Observed Technology & Heuristics */}
        <div className="rounded-2xl bg-white/[0.08] p-[1px] shadow-lg">
          <div className="rounded-[15px] bg-[#111318] p-5 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3 border-b border-white/[0.06] pb-2.5">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-emerald-400" />
                  <h4 className="font-sans font-semibold text-xs text-white uppercase tracking-wider">
                    Observed Technology
                  </h4>
                </div>
                <span className="font-mono text-[10px] text-zinc-400 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.08]">
                  HEURISTICS
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between py-2 border-b border-white/[0.04]">
                  <div>
                    <span className="font-sans text-xs text-zinc-300 block">CMS / Framework</span>
                    <span className="font-mono text-[10px] text-zinc-500 block">
                      Fingerprint detector
                    </span>
                  </div>
                  <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-md bg-white/[0.05] border border-white/[0.1] text-emerald-400">
                    {analysis.cms_detected || 'Custom Architecture'}
                  </span>
                </div>

                <div className="py-2 border-b border-white/[0.04] space-y-1">
                  <span className="font-sans text-xs text-zinc-300 block">Verified Page Title</span>
                  <p className="font-mono text-[11px] text-zinc-400 truncate bg-[#181B22] p-2 rounded border border-white/[0.04]">
                    {titleText || 'No <title> tag found'}
                  </p>
                </div>

                {analysis.final_url && (
                  <div className="py-2 space-y-1">
                    <span className="font-sans text-xs text-zinc-300 block">Final Destination Socket</span>
                    <a
                      href={analysis.final_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-[11px] text-emerald-400 hover:underline flex items-center gap-1 truncate"
                    >
                      {analysis.final_url}
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
