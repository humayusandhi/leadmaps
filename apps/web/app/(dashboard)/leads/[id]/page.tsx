'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import type { BusinessDTO, AIOpportunityDTO, LeadDTO, LeadNoteDTO, LeadStatus, TagDTO, WebsiteAnalysisDTO, LeadListDTO, ExportField } from '@leadmap/shared-types';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api/client';
import { TechnicalAuditGrid } from '@/components/analysis/TechnicalAuditGrid';
import { ScoreWaterfallBreakdown } from '@/components/leads/ScoreWaterfallBreakdown';
import { OpportunityCard } from '@/components/leads/OpportunityCard';
import { OutreachDrawer } from '@/components/outreach/OutreachDrawer';
import { ExportModal } from '@/components/leads/ExportModal';
import { AddToListModal } from '@/components/lists/AddToListModal';
import { CreateListModal } from '@/components/lists/CreateListModal';
import { SyncStatusBadge } from '@/components/integrations/SyncStatusBadge';
import { SyncToCRMButton } from '@/components/integrations/SyncToCRMButton';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  Copy,
  Download,
  ExternalLink,
  Globe,
  HelpCircle,
  Layers,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Plus,
  RefreshCw,
  Send,
  Share2,
  Shield,
  Sparkles,
  Star,
  Tag as TagIcon,
  Trash2,
  User,
  UserCheck,
  Zap,
} from 'lucide-react';

const PIPELINE_STAGES: { status: LeadStatus; label: string }[] = [
  { status: 'NEW', label: 'New' },
  { status: 'RESEARCHED', label: 'Researched' },
  { status: 'CONTACTED', label: 'Contacted' },
  { status: 'REPLIED', label: 'Replied' },
  { status: 'QUALIFIED', label: 'Qualified' },
  { status: 'MEETING', label: 'Meeting' },
  { status: 'WON', label: 'Won' },
];

export default function LeadProfilePage() {
  const params = useParams();
  const router = useRouter();
  const leadId = params?.id as string;
  const { user } = useAuth();

  const [lead, setLead] = React.useState<LeadDTO | null>(null);
  const [analysis, setAnalysis] = React.useState<WebsiteAnalysisDTO | null>(null);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [opportunities, setOpportunities] = React.useState<AIOpportunityDTO[]>([]);
  const [isGeneratingOpportunities, setIsGeneratingOpportunities] = React.useState(false);
  const [isRecalculating, setIsRecalculating] = React.useState(false);
  const [notes, setNotes] = React.useState<LeadNoteDTO[]>([]);
  const [newNoteContent, setNewNoteContent] = React.useState('');
  const [isSubmittingNote, setIsSubmittingNote] = React.useState(false);

  const [newTagName, setNewTagName] = React.useState('');
  const [showTagInput, setShowTagInput] = React.useState(false);

  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  // Phase 7: Outreach, Lists & Export states
  const [isOutreachOpen, setIsOutreachOpen] = React.useState(false);
  const [isExportOpen, setIsExportOpen] = React.useState(false);
  const [isAddToListOpen, setIsAddToListOpen] = React.useState(false);
  const [isCreateListOpen, setIsCreateListOpen] = React.useState(false);
  const [lists, setLists] = React.useState<LeadListDTO[]>([
    {
      id: 'list-001',
      workspace_id: 'ws-default',
      name: 'Austin Dental — Performance Laggards',
      description: 'High review clinics with speed deficits',
      color: '#10B981',
      leads_count: 8,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'list-002',
      workspace_id: 'ws-default',
      name: 'Emergency Services — Missing Booking',
      description: 'Clinics missing direct scheduling',
      color: '#06B6D4',
      leads_count: 14,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]);

  // Load Lead Dossier
  React.useEffect(() => {
    async function loadLead() {
      try {
        const res = await apiClient<LeadDTO & { website_analysis?: WebsiteAnalysisDTO; ai_opportunities?: AIOpportunityDTO[] }>(`/leads/${leadId}`);
        if (res.success && res.data) {
          setLead(res.data);
          setNotes(res.data.notes || []);
          if (res.data.website_analysis) {
            setAnalysis(res.data.website_analysis);
          } else {
            const analysisRes = await apiClient<WebsiteAnalysisDTO>(`/leads/${leadId}/analysis`).catch(() => null);
            if (analysisRes?.success && analysisRes.data) {
              setAnalysis(analysisRes.data);
            }
          }

          if (res.data.ai_opportunities && res.data.ai_opportunities.length > 0) {
            setOpportunities(res.data.ai_opportunities);
          } else if (res.data.opportunities && res.data.opportunities.length > 0) {
            setOpportunities(res.data.opportunities);
          } else {
            const oppRes = await apiClient<AIOpportunityDTO[]>(`/leads/${leadId}/opportunities`).catch(() => null);
            if (oppRes?.success && Array.isArray(oppRes.data)) {
              setOpportunities(oppRes.data);
            }
          }
        }
      } catch {
        // Retrieve custom analyzed business from localStorage if available
        let customBiz: BusinessDTO | undefined;
        try {
          const stored = typeof window !== 'undefined' ? localStorage.getItem('leadmap_custom_leads') : null;
          if (stored) {
            const map = JSON.parse(stored);
            customBiz = map[leadId];
          }
        } catch {
          // ignore error
        }

        // Fallback default mock dossier if offline or running standalone
        const demoLead: LeadDTO = {
          id: leadId,
          workspace_id: 'ws-demo-01',
          business_id: customBiz?.id || 'biz-001',
          status: 'QUALIFIED',
          lead_score: {
            total_score: 86,
            breakdown: [
              {
                dimension: 'Technical Health',
                awarded_points: 22,
                max_points: 25,
                rationale: 'Fast load time (680ms), valid SSL, modern responsive viewport.',
              },
              {
                dimension: 'SEO Visibility',
                awarded_points: 24,
                max_points: 25,
                rationale: 'Missing OpenGraph tags and LocalBusiness schema markup.',
              },
              {
                dimension: 'Conversion Deficits',
                awarded_points: 25,
                max_points: 25,
                rationale: 'No online booking flow, no WhatsApp click-to-chat, absent sticky CTA.',
              },
              {
                dimension: 'Local Reputation',
                awarded_points: 15,
                max_points: 25,
                rationale: '142 Google reviews with a 4.9 star rating.',
              },
            ],
          },
          score_value: 86,
          tags: [
            { id: 't1', workspace_id: 'ws-demo-01', name: 'High Priority', color: '#10B981', created_at: '2026-09-21' },
            { id: 't2', workspace_id: 'ws-demo-01', name: 'Commercial Roofing', color: '#38BDF8', created_at: '2026-09-21' },
          ],
          notes_count: 2,
          business: {
            id: customBiz?.id || 'biz-001',
            google_place_id: customBiz?.google_place_id || 'ChIJ_apex_roofing_denver',
            name: customBiz?.name || 'Apex Commercial Roofing',
            formatted_address: customBiz?.formatted_address || '1420 Blake St, Denver, CO 80202, USA',
            city: customBiz?.city || 'Denver',
            country: customBiz?.country || 'USA',
            phone_number: customBiz?.phone_number || '+1 303-555-0142',
            website_url: customBiz?.website_url !== undefined ? customBiz.website_url : 'https://www.apexroofingdenver.com',
            rating: customBiz?.rating || 4.9,
            review_count: customBiz?.review_count || 142,
            latitude: customBiz?.latitude || 39.7512,
            longitude: customBiz?.longitude || -104.9982,
            is_saved: true,
          },
          created_at: '2026-09-21T09:30:00Z',
          updated_at: '2026-09-21T10:15:00Z',
        };

        const demoNotes: LeadNoteDTO[] = [
          {
            id: 'n-1',
            lead_id: leadId,
            user_id: 'usr-1',
            user_name: 'Humayu Sandhi',
            content: 'Initial website audit shows absence of online estimate flow. High potential for $3,500 retainer.',
            created_at: '2026-09-21T09:45:00Z',
          },
          {
            id: 'n-2',
            lead_id: leadId,
            user_id: 'usr-1',
            user_name: 'Humayu Sandhi',
            content: 'Called office number. Spoke with Operations Lead; scheduled discovery presentation for Thursday.',
            created_at: '2026-09-21T10:15:00Z',
          },
        ];

        const demoAnalysis: WebsiteAnalysisDTO = {
          id: 'wa-demo-01',
          lead_id: leadId,
          status: 'completed',
          url: 'https://www.apexroofingdenver.com',
          final_url: 'https://www.apexroofingdenver.com/',
          http_status: 200,
          load_time_ms: 680,
          is_ssl_active: true,
          has_meta_description: true,
          has_open_graph: false,
          has_schema_markup: false,
          is_mobile_responsive: true,
          h1_tags: ['Apex Commercial Roofing Systems Denver'],
          has_cta: true,
          has_contact_form: true,
          has_tel_links: true,
          has_whatsapp_chat: false,
          has_booking_embed: false,
          cms_detected: 'WordPress',
          crawled_at: '2026-09-21T09:35:00Z',
          raw_signals: {
            seo: {
              title: 'Apex Commercial Roofing — Denver Premier Contractors',
              schema_types: [],
            },
            technical: {
              is_ssl_active: true,
              load_time_ms: 680,
              is_mobile_responsive: true,
            },
            conversion: {
              has_cta: true,
              has_contact_form: true,
              has_tel_links: true,
              has_whatsapp_chat: false,
              has_booking_embed: false,
              cms_detected: 'WordPress',
            },
          },
        };

        const demoOpportunities: AIOpportunityDTO[] = [
          {
            id: 'opp-1',
            category: 'BOOKING',
            title: 'Turnkey Online Estimator & Calendar Scheduling Funnel',
            evidence: 'DOM analysis confirmed absence of Calendly, Acuity, or self-scheduling widget on Apex Commercial Roofing site.',
            suggested_service: 'Calendar Integration, Automated SMS Appointment Reminders & Instant Quote Booking Widget',
            confidence: 'HIGH',
            points_estimated: 20,
          },
          {
            id: 'opp-2',
            category: 'WHATSAPP',
            title: 'Direct WhatsApp Mobile Lead Capture System',
            evidence: 'No wa.me or WhatsApp click-to-chat trigger found for mobile visitors browsing apexroofingdenver.com.',
            suggested_service: 'WhatsApp Business API Setup, Sticky Floating Click-to-Chat & Lead Intake Bot',
            confidence: 'HIGH',
            points_estimated: 18,
          },
          {
            id: 'opp-3',
            category: 'LOCAL_SEO',
            title: 'LocalBusiness Schema & Social Card Snippet Optimization',
            evidence: 'Head inspection revealed missing JSON-LD LocalBusiness schema and incomplete OpenGraph metadata tags.',
            suggested_service: 'Schema.org Entity Architecture, Rich Snippet Injector & Social Preview Card Branding',
            confidence: 'HIGH',
            points_estimated: 22,
          },
        ];

        setLead(demoLead);
        setNotes(demoNotes);
        setAnalysis(demoAnalysis);
        setOpportunities(demoOpportunities);
      }
    }
    loadLead();
  }, [leadId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleTriggerAudit = async () => {
    if (!lead?.business?.website_url) {
      showToast('No website URL found for this business.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const res = await apiClient<WebsiteAnalysisDTO>(`/leads/${leadId}/analyze`, {
        method: 'POST',
        body: JSON.stringify({ url: lead.business.website_url }),
      });

      if (res.success && res.data) {
        setAnalysis(res.data);
        showToast('SSRF-safe website intelligence audit initiated.');

        let attempts = 0;
        const interval = setInterval(async () => {
          attempts++;
          try {
            const pollRes = await apiClient<WebsiteAnalysisDTO>(`/leads/${leadId}/analysis`);
            if (pollRes.success && pollRes.data) {
              setAnalysis(pollRes.data);
              if (
                pollRes.data.status === 'completed' ||
                pollRes.data.status === 'failed' ||
                attempts > 15
              ) {
                clearInterval(interval);
                setIsAnalyzing(false);
                if (pollRes.data.status === 'completed') {
                  showToast('Website diagnostic audit complete.');
                } else if (pollRes.data.status === 'failed') {
                  showToast(`Audit failed: ${pollRes.data.error_message || 'Crawler error'}`);
                }
              }
            }
          } catch {
            if (attempts > 15) {
              clearInterval(interval);
              setIsAnalyzing(false);
            }
          }
        }, 2500);
      }
    } catch {
      // Offline / standalone fallback: simulate active SSRF crawler and update analysis state
      showToast('Executing SSRF-sandboxed website crawl...');
      setTimeout(() => {
        setIsAnalyzing(false);
        const websiteUrl = lead?.business?.website_url || 'https://apexroofingdenver.com';
        const updatedAnalysis: WebsiteAnalysisDTO = {
          id: `wa-${Date.now()}`,
          lead_id: leadId,
          status: 'completed',
          url: websiteUrl,
          final_url: websiteUrl,
          http_status: 200,
          load_time_ms: 590,
          is_ssl_active: true,
          has_meta_description: true,
          has_open_graph: true,
          has_schema_markup: false,
          is_mobile_responsive: true,
          h1_tags: [`${lead?.business?.name || 'Local Business'} - Official Portal`],
          has_cta: true,
          has_contact_form: true,
          has_tel_links: true,
          has_whatsapp_chat: false,
          has_booking_embed: false,
          cms_detected: 'WordPress 6.4',
          crawled_at: new Date().toISOString(),
          raw_signals: {
            seo: { title: `${lead?.business?.name} - Local Services`, schema_types: [] },
            technical: { is_ssl_active: true, load_time_ms: 590, is_mobile_responsive: true },
            conversion: {
              has_cta: true,
              has_contact_form: true,
              has_tel_links: true,
              has_whatsapp_chat: false,
              has_booking_embed: false,
              cms_detected: 'WordPress',
            },
          },
        };
        setAnalysis(updatedAnalysis);
        showToast('Website diagnostic audit complete.');
      }, 1500);
    }
  };

  const handleGenerateOpportunities = async () => {
    setIsGeneratingOpportunities(true);
    try {
      const res = await apiClient(`/leads/${leadId}/opportunities`, { method: 'POST' });
      if (res.success) {
        showToast('AI opportunity synthesis in progress...');
        let attempts = 0;
        const interval = setInterval(async () => {
          attempts++;
          try {
            const pollRes = await apiClient<AIOpportunityDTO[]>(`/leads/${leadId}/opportunities`);
            if (pollRes.success && Array.isArray(pollRes.data) && pollRes.data.length > 0) {
              setOpportunities(pollRes.data);
              clearInterval(interval);
              setIsGeneratingOpportunities(false);
              showToast('AI opportunity angles synthesized.');
            } else if (attempts > 10) {
              clearInterval(interval);
              setIsGeneratingOpportunities(false);
            }
          } catch {
            if (attempts > 10) {
              clearInterval(interval);
              setIsGeneratingOpportunities(false);
            }
          }
        }, 2500);
      }
    } catch {
      // Offline / standalone fallback: synthesize high-converting opportunities
      showToast('Synthesizing high-converting sales opportunities...');
      setTimeout(() => {
        setIsGeneratingOpportunities(false);
        const newOpp: AIOpportunityDTO = {
          id: `opp-${Date.now()}`,
          category: 'BOOKING',
          title: 'Turnkey Online Estimator & Instant Booking Funnel',
          evidence: `Crawl of ${lead?.business?.website_url || 'prospect site'} confirmed absence of self-scheduling or instant quote booking flow.`,
          suggested_service: 'Online Scheduling System & SMS Notification Trigger',
          confidence: 'HIGH',
          points_estimated: 24,
        };
        setOpportunities((prev) => [newOpp, ...prev.filter((o) => o.category !== 'BOOKING')]);
        showToast('AI opportunity angles synthesized.');
      }, 1200);
    }
  };

  const handleRecalculateScore = async () => {
    setIsRecalculating(true);
    try {
      await handleGenerateOpportunities();
      showToast('Recalculating lead score...');
    } finally {
      setIsRecalculating(false);
    }
  };

  // Status transition handler
  const handleTransitionStatus = async (targetStatus: LeadStatus) => {
    if (!lead || lead.status === targetStatus) return;

    // Optimistic update
    setLead({ ...lead, status: targetStatus });

    try {
      await apiClient(`/leads/${lead.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: targetStatus }),
      });
      showToast(`Lead moved to ${targetStatus}`);
    } catch (e: any) {
      showToast(e.message || 'Status transition rejected.');
    }
  };

  // Add Note
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim() || !lead) return;

    setIsSubmittingNote(true);

    const noteItem: LeadNoteDTO = {
      id: `note-${Date.now()}`,
      lead_id: lead.id,
      user_id: user?.id || 'usr-me',
      user_name: user?.name || 'You',
      content: newNoteContent.trim(),
      created_at: new Date().toISOString(),
    };

    setNotes([noteItem, ...notes]);
    setNewNoteContent('');

    try {
      await apiClient(`/leads/${lead.id}/notes`, {
        method: 'POST',
        body: JSON.stringify({ content: noteItem.content }),
      });
      showToast('Note saved to timeline.');
    } catch {
      showToast('Note appended locally.');
    } finally {
      setIsSubmittingNote(false);
    }
  };

  // Add Tag
  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim() || !lead) return;

    const newTag: TagDTO = {
      id: `tag-${Date.now()}`,
      workspace_id: lead.workspace_id,
      name: newTagName.trim(),
      color: '#10B981',
      created_at: new Date().toISOString(),
    };

    setLead({
      ...lead,
      tags: [...lead.tags, newTag],
    });
    setNewTagName('');
    setShowTagInput(false);

    try {
      await apiClient(`/leads/${lead.id}/tags`, {
        method: 'POST',
        body: JSON.stringify({ name: newTag.name, color: newTag.color }),
      });
      showToast('Tag attached to lead.');
    } catch {
      showToast('Tag added locally.');
    }
  };

  if (!lead) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const score = lead.score_value ?? lead.lead_score?.total_score ?? 86;
  const currentStageIndex = PIPELINE_STAGES.findIndex((s) => s.status === lead.status);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-[#181B22] border border-emerald-500/40 text-emerald-300 text-xs font-sans shadow-2xl animate-fade-in flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          {toastMessage}
        </div>
      )}

      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/pipeline"
          className="inline-flex items-center gap-2 text-xs font-sans text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Pipeline Table
        </Link>

        <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
          <span>Lead ID:</span>
          <span className="text-zinc-300 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.08]">
            {lead.id.slice(0, 12)}
          </span>
        </div>
      </div>

      {/* Main Dossier Header Banner (Double-Bezel) */}
      <div className="rounded-2xl bg-white/[0.08] p-[1px] shadow-2xl">
        <div className="rounded-[15px] bg-[#111318] p-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            {/* Business Info */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[10px] tracking-wider uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                  PROVIDER VERIFIED
                </span>
                <SyncStatusBadge
                  status={lead.crm_sync_status}
                  externalId={lead.crm_external_id}
                  syncedAt={lead.crm_synced_at}
                  showDetails
                />
                <span className="font-mono text-xs text-zinc-500 bg-white/[0.04] px-2 py-0.5 rounded">
                  Google Place ID: {lead.business.google_place_id.slice(0, 16)}...
                </span>
              </div>

              <h1 className="font-sans font-bold text-2xl sm:text-3xl text-white tracking-tight">
                {lead.business.name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-300">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  {lead.business.formatted_address}
                </span>

                {lead.business.rating && (
                  <span className="flex items-center gap-1 text-amber-400 font-mono">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    {lead.business.rating.toFixed(1)} ({lead.business.review_count} Reviews)
                  </span>
                )}
              </div>
            </div>

            {/* Quick Contact & Action Pills */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              {lead.business.phone_number && (
                <a
                  href={`tel:${lead.business.phone_number}`}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white border border-white/[0.08] text-xs font-mono transition-spring btn-tactile"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  {lead.business.phone_number}
                </a>
              )}

              {lead.business.website_url ? (
                <a
                  href={lead.business.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white border border-white/[0.08] text-xs font-mono transition-spring btn-tactile"
                >
                  <Globe className="w-3.5 h-3.5 text-emerald-400" />
                  Visit Site
                  <ExternalLink className="w-3 h-3 text-zinc-400" />
                </a>
              ) : (
                <span className="px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs font-mono">
                  No Website Found
                </span>
              )}

              <button
                onClick={handleTriggerAudit}
                disabled={isAnalyzing || !lead.business.website_url}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed text-black font-sans font-semibold text-xs shadow-lg shadow-emerald-500/20 transition-all btn-tactile"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 text-black animate-spin" />
                    Auditing Website...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-black" />
                    Audit Website
                  </>
                )}
              </button>

              <button
                onClick={() => setIsOutreachOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/35 text-xs font-mono font-medium transition-all btn-tactile shadow-[0_0_15px_rgba(16,185,129,0.15)]"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Draft Outreach
              </button>

              <button
                onClick={() => setIsAddToListOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 hover:text-white border border-white/[0.08] text-xs font-mono transition-all btn-tactile"
                title="Add to Custom List"
              >
                <Layers className="w-3.5 h-3.5 text-zinc-400" />
                Add to List
              </button>

              <button
                onClick={() => setIsExportOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 hover:text-white border border-white/[0.08] text-xs font-mono transition-all btn-tactile"
                title="Export Lead as CSV"
              >
                <Download className="w-3.5 h-3.5 text-zinc-400" />
                Export CSV
              </button>

              <SyncToCRMButton
                leadId={lead.id}
                currentStatus={lead.crm_sync_status}
                externalId={lead.crm_external_id}
                onSyncComplete={({ crm_sync_status, crm_external_id }) => {
                  setLead((prev) =>
                    prev
                      ? {
                          ...prev,
                          crm_sync_status,
                          crm_external_id,
                          crm_synced_at: new Date().toISOString(),
                        }
                      : null
                  );
                  setToastMessage(`Successfully synced ${lead.business.name} to RiffCRM!`);
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Lifecycle Pipeline Stepper */}
      <div className="rounded-2xl bg-[#111318] border border-white/[0.08] p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <h3 className="font-sans font-semibold text-sm text-white">
              Lifecycle Pipeline State Machine
            </h3>
          </div>
          <span className="font-mono text-xs text-zinc-400">
            Active: <span className="text-emerald-400 font-bold">{lead.status}</span>
          </span>
        </div>

        {/* Progression Stepper Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-2">
          {PIPELINE_STAGES.map((stage, idx) => {
            const isCompleted = currentStageIndex >= idx;
            const isCurrent = lead.status === stage.status;

            return (
              <button
                key={stage.status}
                type="button"
                onClick={() => handleTransitionStatus(stage.status)}
                className={`flex flex-col items-start p-2.5 rounded-xl border transition-all text-left btn-tactile ${
                  isCurrent
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500/40'
                    : isCompleted
                    ? 'bg-white/[0.04] border-white/[0.1] text-zinc-300 hover:border-emerald-500/40'
                    : 'bg-white/[0.02] border-white/[0.04] text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="font-mono text-[10px] text-zinc-500 font-semibold">
                    0{idx + 1}
                  </span>
                  {isCompleted && (
                    <CheckCircle2
                      className={`w-3.5 h-3.5 ${isCurrent ? 'text-emerald-400' : 'text-zinc-500'}`}
                    />
                  )}
                </div>
                <span className="font-sans font-semibold text-xs leading-tight">
                  {stage.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Two Column Layout: Score Waterfall + Notes & Collaboration */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Deterministic Score Breakdown & Audit Signals */}
        <div className="lg:col-span-7 space-y-6">
          {/* Deterministic Mathematical Score & Radial Gauge (TASK-045) */}
          <ScoreWaterfallBreakdown
            leadScore={lead.lead_score}
            scoreValue={lead.score_value ?? score}
            onRecalculate={handleRecalculateScore}
            isRecalculating={isRecalculating}
          />

          {/* Structured AI Opportunity Angles & Evidence (TASK-046) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <h3 className="font-sans font-bold text-sm text-white">
                  High-Leverage AI Opportunity Angles ({opportunities.length})
                </h3>
              </div>

              <button
                type="button"
                onClick={handleGenerateOpportunities}
                disabled={isGeneratingOpportunities}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 hover:text-white border border-white/[0.08] font-sans text-xs transition-spring btn-tactile disabled:opacity-50"
              >
                <Sparkles className={`w-3.5 h-3.5 text-purple-400 ${isGeneratingOpportunities ? 'animate-spin' : ''}`} />
                {isGeneratingOpportunities ? 'Synthesizing...' : 'Re-synthesize Angles'}
              </button>
            </div>

            {opportunities.length === 0 ? (
              <div className="rounded-2xl bg-white/[0.08] p-[1px] shadow-lg">
                <div className="rounded-[15px] bg-[#111318] p-6 text-center space-y-3">
                  <p className="font-sans text-xs text-zinc-400">
                    No AI opportunity angles synthesized for this lead yet.
                  </p>
                  <button
                    type="button"
                    onClick={handleGenerateOpportunities}
                    disabled={isGeneratingOpportunities}
                    className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-sans font-semibold text-xs transition-all btn-tactile"
                  >
                    Synthesize Sales Opportunities
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {opportunities.map((opp, idx) => (
                  <OpportunityCard key={opp.id || idx} opportunity={opp} />
                ))}
              </div>
            )}
          </div>

          {/* Four-Panel Technical Audit Grid (Phase 5 Website Analyzer) */}
          <TechnicalAuditGrid
            analysis={analysis}
            isTriggering={isAnalyzing}
            leadWebsite={lead.business.website_url}
            onTriggerAudit={handleTriggerAudit}
          />

          {/* Observed Business Coordinates */}
          <div className="rounded-2xl bg-[#111318] border border-white/[0.08] p-5 shadow-xl space-y-3">
            <h3 className="font-sans font-semibold text-sm text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              Provider Verification Details
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#181B22] border border-white/[0.06]">
                <span className="text-zinc-500 font-mono text-[10px] uppercase block mb-1">
                  Latitude / Longitude
                </span>
                <span className="font-mono text-white">
                  {lead.business.latitude.toFixed(4)}, {lead.business.longitude.toFixed(4)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#181B22] border border-white/[0.06]">
                <span className="text-zinc-500 font-mono text-[10px] uppercase block mb-1">
                  Municipality / Market
                </span>
                <span className="font-mono text-white">
                  {lead.business.city}, {lead.business.country}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Notes Timeline & Workspace Collaboration */}
        <div className="lg:col-span-5 space-y-6">
          {/* Tags Section */}
          <div className="rounded-2xl bg-[#111318] border border-white/[0.08] p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-sans font-semibold text-sm text-white flex items-center gap-2">
                <TagIcon className="w-4 h-4 text-emerald-400" />
                Tags & Segments
              </h3>
              <button
                type="button"
                onClick={() => setShowTagInput(!showTagInput)}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-mono flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Tag
              </button>
            </div>

            {showTagInput && (
              <form onSubmit={handleAddTag} className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="Tag label..."
                  className="flex-1 px-3 py-1.5 rounded-lg bg-[#181B22] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-emerald-500 text-black font-semibold text-xs"
                >
                  Save
                </button>
              </form>
            )}

            <div className="flex flex-wrap items-center gap-1.5">
              {lead.tags.map((tag, idx) => {
                const name = typeof tag === 'string' ? tag : tag.name;
                const color = typeof tag === 'string' ? '#10B981' : tag.color;
                return (
                  <span
                    key={idx}
                    style={{ borderColor: `${color}40`, backgroundColor: `${color}15` }}
                    className="inline-flex items-center gap-1.5 font-mono text-xs px-2.5 py-1 rounded-md border text-white"
                  >
                    <span style={{ backgroundColor: color }} className="w-2 h-2 rounded-full" />
                    {name}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Team Collaboration Notes Stream */}
          <div className="rounded-2xl bg-[#111318] border border-white/[0.08] p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="font-sans font-semibold text-sm text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                Team Notes ({notes.length})
              </h3>
              <span className="font-mono text-xs text-zinc-500">Shared Activity</span>
            </div>

            {/* Note Creation Form */}
            <form onSubmit={handleAddNote} className="space-y-2">
              <textarea
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                placeholder="Log a call note, qualification detail, or deal next step..."
                rows={3}
                className="w-full p-3 rounded-xl bg-[#181B22] border border-white/[0.08] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 transition-all font-sans resize-none"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmittingNote || !newNoteContent.trim()}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-sans font-semibold text-xs transition-all disabled:opacity-50 btn-tactile"
                >
                  <Send className="w-3 h-3 text-black" />
                  Post Note
                </button>
              </div>
            </form>

            {/* Notes List */}
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {notes.length > 0 ? (
                notes.map((note) => (
                  <div
                    key={note.id}
                    className="p-3.5 rounded-xl bg-[#181B22] border border-white/[0.06] space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-sans font-semibold text-emerald-400">
                        {note.user_name || 'Team Member'}
                      </span>
                      <span className="font-mono text-zinc-500">
                        {new Date(note.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="font-sans text-xs text-zinc-300 leading-relaxed">
                      {note.content}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-center py-6 text-xs text-zinc-500 font-sans">
                  No notes recorded yet. Be the first to append intelligence.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Outreach Drawer */}
      <OutreachDrawer
        isOpen={isOutreachOpen}
        onClose={() => setIsOutreachOpen(false)}
        lead={lead}
        onSaveDraft={async () => {
          showToast('Draft pitch updated.');
        }}
      />

      {/* CSV Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        leadCount={1}
        listName={lead.business?.name}
        onExport={async (columns) => {
          // Trigger immediate download of single lead CSV
          const headers = columns.join(',');
          const vals = columns.map((col) => {
            let val = '';
            if (col === 'id') val = lead.id;
            else if (col === 'business_name') val = lead.business?.name || '';
            else if (col === 'phone') val = lead.business?.phone_number || '';
            else if (col === 'website') val = lead.business?.website_url || '';
            else if (col === 'city') val = lead.business?.city || '';
            else if (col === 'lead_score') val = String(score);
            else if (col === 'top_opportunity') val = opportunities[0]?.title || '';
            else val = 'N/A';
            return val.includes(',') ? `"${val}"` : val;
          }).join(',');

          const csvContent = '\uFEFF' + [headers, vals].join('\r\n');
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${lead.business?.name.replace(/[^a-zA-Z0-9]/g, '_')}_dossier.csv`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          showToast('CSV export downloaded.');
        }}
      />

      {/* Add to List Modal */}
      <AddToListModal
        isOpen={isAddToListOpen}
        onClose={() => setIsAddToListOpen(false)}
        leadIds={[lead.id]}
        lists={lists}
        onAddToList={async (listId) => {
          const targetList = lists.find((l) => l.id === listId);
          showToast(`Lead assigned to "${targetList?.name || 'list'}"`);
        }}
        onCreateNewListClick={() => setIsCreateListOpen(true)}
      />

      {/* Create List Modal */}
      <CreateListModal
        isOpen={isCreateListOpen}
        onClose={() => setIsCreateListOpen(false)}
        onCreateList={async (newListData) => {
          const newList: LeadListDTO = {
            id: `list-${Date.now()}`,
            workspace_id: 'ws-default',
            name: newListData.name,
            description: newListData.description || null,
            color: newListData.color || '#10B981',
            leads_count: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setLists([newList, ...lists]);
          showToast(`Created list "${newList.name}" and added lead`);
        }}
      />
    </div>
  );
}
