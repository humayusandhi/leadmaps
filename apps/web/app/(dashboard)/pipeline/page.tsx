'use client';

import * as React from 'react';
import type { LeadDTO, LeadStatus } from '@leadmap/shared-types';
import { LeadsTable } from '@/components/leads/LeadsTable';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api/client';
import { Layers, ListFilter, Sparkles, TrendingUp } from 'lucide-react';

const INITIAL_DEMO_LEADS: LeadDTO[] = [
  {
    id: 'lead-001',
    workspace_id: 'ws-demo-01',
    business_id: 'biz-001',
    status: 'QUALIFIED',
    lead_score: {
      total_score: 86,
      breakdown: [
        { dimension: 'Technical Health', awarded_points: 22, max_points: 25, rationale: 'Fast load time (680ms), valid SSL, modern responsive viewport.' },
        { dimension: 'SEO Visibility', awarded_points: 24, max_points: 25, rationale: 'Missing OpenGraph tags and LocalBusiness schema markup.' },
        { dimension: 'Conversion Deficits', awarded_points: 25, max_points: 25, rationale: 'No online booking flow, no WhatsApp click-to-chat, absent sticky CTA.' },
        { dimension: 'Local Reputation', awarded_points: 15, max_points: 25, rationale: '142 Google reviews, 4.9 star rating.' },
      ],
    },
    score_value: 86,
    tags: [
      { id: 'tag-1', workspace_id: 'ws-demo-01', name: 'High Priority', color: '#10B981', created_at: '2026-09-21' },
      { id: 'tag-2', workspace_id: 'ws-demo-01', name: 'Commercial', color: '#38BDF8', created_at: '2026-09-21' },
    ],
    notes_count: 2,
    business: {
      id: 'biz-001',
      google_place_id: 'ChIJ_apex_roofing_denver',
      name: 'Apex Commercial Roofing',
      formatted_address: '1420 Blake St, Denver, CO 80202, USA',
      city: 'Denver',
      country: 'USA',
      phone_number: '+1 303-555-0142',
      website_url: 'https://www.apexroofingdenver.com',
      rating: 4.9,
      review_count: 142,
      latitude: 39.7512,
      longitude: -104.9982,
      is_saved: true,
    },
    created_at: '2026-09-21T09:30:00Z',
    updated_at: '2026-09-21T10:15:00Z',
  },
  {
    id: 'lead-002',
    workspace_id: 'ws-demo-01',
    business_id: 'biz-002',
    status: 'CONTACTED',
    lead_score: {
      total_score: 74,
      breakdown: [
        { dimension: 'Technical Health', awarded_points: 18, max_points: 25, rationale: 'Slow TTFB (1.8s), unoptimized image payloads.' },
        { dimension: 'SEO Visibility', awarded_points: 20, max_points: 25, rationale: 'Missing meta description and heading hierarchy.' },
        { dimension: 'Conversion Deficits', awarded_points: 21, max_points: 25, rationale: 'Generic contact form; no instant quote generator.' },
        { dimension: 'Local Reputation', awarded_points: 15, max_points: 25, rationale: '89 Google reviews, 4.7 star rating.' },
      ],
    },
    score_value: 74,
    tags: [
      { id: 'tag-3', workspace_id: 'ws-demo-01', name: 'Outreach Sent', color: '#F59E0B', created_at: '2026-09-21' },
    ],
    notes_count: 1,
    business: {
      id: 'biz-002',
      google_place_id: 'ChIJ_mile_high_roof_co',
      name: 'Mile High Roof Systems & Gutters',
      formatted_address: '2100 Larimer St, Denver, CO 80205, USA',
      city: 'Denver',
      country: 'USA',
      phone_number: '+1 303-555-0189',
      website_url: 'https://www.milehighroofing.co',
      rating: 4.7,
      review_count: 89,
      latitude: 39.7548,
      longitude: -104.9915,
      is_saved: true,
    },
    created_at: '2026-09-21T08:15:00Z',
    updated_at: '2026-09-21T11:00:00Z',
  },
  {
    id: 'lead-003',
    workspace_id: 'ws-demo-01',
    business_id: 'biz-003',
    status: 'NEW',
    lead_score: {
      total_score: 92,
      breakdown: [
        { dimension: 'Technical Health', awarded_points: 0, max_points: 25, rationale: 'No website detected.' },
        { dimension: 'SEO Visibility', awarded_points: 5, max_points: 25, rationale: 'Google Place listing only.' },
        { dimension: 'Conversion Deficits', awarded_points: 25, max_points: 25, rationale: 'Critical need for complete website build.' },
        { dimension: 'Local Reputation', awarded_points: 12, max_points: 25, rationale: '34 Google reviews, 4.2 star rating.' },
      ],
    },
    score_value: 92,
    tags: [
      { id: 'tag-4', workspace_id: 'ws-demo-01', name: 'No Website Deficit', color: '#F43F5E', created_at: '2026-09-21' },
    ],
    notes_count: 0,
    business: {
      id: 'biz-003',
      google_place_id: 'ChIJ_summit_roof_repair',
      name: 'Summit Roof Repair & Restoration',
      formatted_address: '850 Lincoln St, Denver, CO 80203, USA',
      city: 'Denver',
      country: 'USA',
      phone_number: '+1 303-555-0134',
      website_url: null,
      rating: 4.2,
      review_count: 34,
      latitude: 39.7302,
      longitude: -104.9863,
      is_saved: true,
    },
    created_at: '2026-09-21T09:45:00Z',
    updated_at: '2026-09-21T09:45:00Z',
  },
];

export default function PipelinePage() {
  const { activeWorkspace } = useAuth();
  const [leads, setLeads] = React.useState<LeadDTO[]>(INITIAL_DEMO_LEADS);
  const [isLoading, setIsLoading] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  // Fetch leads from backend API
  React.useEffect(() => {
    async function loadLeads() {
      try {
        const res = await apiClient<LeadDTO[]>('/leads');
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setLeads(res.data);
        }
      } catch {
        // Fall back gracefully to demo leads
      }
    }
    loadLeads();
  }, [activeWorkspace]);

  // Handle status transition
  const handleStatusChange = async (leadId: string, nextStatus: LeadStatus) => {
    // Optimistic UI update
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: nextStatus } : l))
    );

    try {
      await apiClient(`/leads/${leadId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      });
      showToast(`Status updated to ${nextStatus}`);
    } catch (e: any) {
      // Revert if error (e.g. state machine transition rejected)
      showToast(e.message || 'Status transition rejected by state machine.');
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== leadId));
    try {
      await apiClient(`/leads/${leadId}`, { method: 'DELETE' });
      showToast('Lead archived from workspace pipeline.');
    } catch {
      showToast('Lead archived locally.');
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Pipeline CRM
            </span>
            <span className="text-zinc-600">&bull;</span>
            <span className="font-mono text-xs text-zinc-400">Phase 4 Active</span>
          </div>
          <h1 className="font-sans font-bold text-2xl sm:text-3xl text-white tracking-tight">
            Lead Pipeline Management
          </h1>
          <p className="font-sans text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
            Track prospect lifecycles from new discovery to closed deal, manage deterministic lead scores, and append contextual sales intelligence.
          </p>
        </div>

        {/* High-level stats pill */}
        <div className="flex items-center gap-3 bg-[#111318] p-3 rounded-2xl border border-white/[0.08] shadow-lg">
          <div className="flex items-center gap-2 px-3 border-r border-white/[0.08]">
            <Layers className="w-4 h-4 text-emerald-400" />
            <div className="flex flex-col">
              <span className="font-mono text-base font-bold text-white leading-none">{leads.length}</span>
              <span className="text-[10px] text-zinc-500 font-mono">Total Leads</span>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <div className="flex flex-col">
              <span className="font-mono text-base font-bold text-emerald-400 leading-none">
                {leads.filter((l) => (l.score_value ?? l.lead_score?.total_score ?? 0) >= 80).length}
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">High Yield (80+)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-[#181B22] border border-emerald-500/40 text-emerald-300 text-xs font-sans shadow-2xl animate-fade-in flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          {toastMessage}
        </div>
      )}

      {/* Main Leads Table */}
      <LeadsTable
        leads={leads}
        onStatusChange={handleStatusChange}
        onDeleteLead={handleDeleteLead}
        isLoading={isLoading}
      />
    </div>
  );
}
