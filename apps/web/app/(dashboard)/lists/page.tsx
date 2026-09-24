'use client';

import * as React from 'react';
import { 
  FolderPlus, 
  Search, 
  Layers, 
  Download, 
  Trash2, 
  Users, 
  ArrowLeft,
  ExternalLink,
  Sparkles,
  Phone,
  Globe,
  Star,
  Check
} from 'lucide-react';
import Link from 'next/link';
import { LeadListDTO, LeadDTO, ExportField, CreateLeadListRequest } from '@leadmap/shared-types';
import { ListCard } from '@/components/lists/ListCard';
import { CreateListModal } from '@/components/lists/CreateListModal';
import { ExportModal } from '@/components/leads/ExportModal';
import { OutreachDrawer } from '@/components/outreach/OutreachDrawer';

// Demo initial lists for robust offline fidelity
const INITIAL_DEMO_LISTS: LeadListDTO[] = [
  {
    id: 'list-001',
    workspace_id: 'ws-default',
    name: 'Austin Dental — Performance Laggards',
    description: 'Local clinics with >4.5★ patient reviews but page load latency > 2.5s. High conversion potential for Core Web Vitals modernization.',
    color: '#10B981',
    leads_count: 8,
    created_at: '2026-09-18T10:00:00Z',
    updated_at: '2026-09-21T08:00:00Z',
  },
  {
    id: 'list-002',
    workspace_id: 'ws-default',
    name: 'Roofing & HVAC — Missing Booking Widget',
    description: 'High-intent emergency home service providers lacking direct online scheduling embeds. Pitching automated instant quote & calendar booking funnel.',
    color: '#06B6D4',
    leads_count: 14,
    created_at: '2026-09-19T14:30:00Z',
    updated_at: '2026-09-21T09:15:00Z',
  },
  {
    id: 'list-003',
    workspace_id: 'ws-default',
    name: 'MedSpa & Aesthetics — Mobile Responsive Deficit',
    description: 'High-ticket cosmetic practices whose websites fail mobile tap targets and lack direct WhatsApp chat widgets.',
    color: '#8B5CF6',
    leads_count: 5,
    created_at: '2026-09-20T11:00:00Z',
    updated_at: '2026-09-21T11:00:00Z',
  },
];

// Sample leads inside the selected list
const SAMPLE_LIST_LEADS: Record<string, LeadDTO[]> = {
  'list-001': [
    {
      id: 'lead-001',
      workspace_id: 'ws-default',
      business: {
        id: 'biz-001',
        google_place_id: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
        name: 'Apex Dental Care & Orthodontics',
        phone_number: '+1 (512) 555-0192',
        website_url: 'https://apexdentalcare.example.com',
        formatted_address: '1420 South Congress Ave, Austin, TX 78704',
        address: '1420 South Congress Ave, Austin, TX 78704',
        city: 'Austin',
        country: 'US',
        rating: 4.8,
        review_count: 142,
        reviews_count: 142,
        latitude: 30.2500,
        longitude: -97.7500,
      },
      status: 'AUDITED',
      lead_score: {
        total_score: 78,
        breakdown: [
          { dimension: 'Reputation', awarded_points: 25, max_points: 30, rationale: 'High rating' },
          { dimension: 'Technical Deficit', awarded_points: 28, max_points: 30, rationale: 'Slow speed' },
        ],
      },
      opportunities: [
        {
          id: 'opp-1',
          category: 'PERFORMANCE',
          title: 'Core Web Vitals latency (3,200ms)',
          evidence: 'Page load took 3.2s on mobile viewport',
          suggested_service: 'Speed optimization',
          confidence: 'HIGH',
        },
      ],
      tags: ['Dental', 'High-Rating', 'Speed-Deficit'],
      notes_count: 2,
      created_at: '2026-09-21T00:00:00Z',
      updated_at: '2026-09-21T00:00:00Z',
    },
    {
      id: 'lead-002',
      workspace_id: 'ws-default',
      business: {
        id: 'biz-002',
        google_place_id: 'ChIJL01_tDeuEmsRUsoyG83frY5',
        name: 'Lone Star Pediatric Dental',
        phone_number: '+1 (512) 555-0144',
        website_url: 'https://lonestarpediatric.example.com',
        formatted_address: '701 Brazos St, Austin, TX 78701',
        address: '701 Brazos St, Austin, TX 78701',
        city: 'Austin',
        country: 'US',
        rating: 4.9,
        review_count: 88,
        reviews_count: 88,
        latitude: 30.2680,
        longitude: -97.7410,
      },
      status: 'PITCH_READY',
      lead_score: {
        total_score: 84,
        breakdown: [],
      },
      opportunities: [
        {
          id: 'opp-2',
          category: 'CONVERSION',
          title: 'Missing Direct Online Booking',
          evidence: 'No booking widget or appointment calendar detected',
          suggested_service: 'Online Booking Integration',
          confidence: 'HIGH',
        },
      ],
      tags: ['Pediatric', 'High-Intent'],
      notes_count: 1,
      created_at: '2026-09-21T00:00:00Z',
      updated_at: '2026-09-21T00:00:00Z',
    },
  ],
};

export default function CustomListsPage() {
  const [lists, setLists] = React.useState<LeadListDTO[]>(INITIAL_DEMO_LISTS);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedList, setSelectedList] = React.useState<LeadListDTO | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [exportModalList, setExportModalList] = React.useState<LeadListDTO | null>(null);
  const [outreachLead, setOutreachLead] = React.useState<LeadDTO | null>(null);

  const filteredLists = lists.filter((list) => 
    list.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (list.description && list.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCreateList = async (data: CreateLeadListRequest) => {
    const newList: LeadListDTO = {
      id: `list-${Date.now()}`,
      workspace_id: 'ws-default',
      name: data.name,
      description: data.description || null,
      color: data.color || '#10B981',
      leads_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setLists([newList, ...lists]);
  };

  const handleDeleteList = (id: string) => {
    setLists(lists.filter((l) => l.id !== id));
    if (selectedList?.id === id) {
      setSelectedList(null);
    }
  };

  const handleExportListCsv = async (columns: ExportField[]) => {
    // Generate browser RFC 4180 CSV
    const leads = (selectedList && SAMPLE_LIST_LEADS[selectedList.id]) 
      || (exportModalList && SAMPLE_LIST_LEADS[exportModalList.id]) 
      || SAMPLE_LIST_LEADS['list-001'];

    const headers = columns.join(',');
    const rows = leads.map((lead) => {
      return columns.map((col) => {
        let val = '';
        if (col === 'id') val = lead.id;
        else if (col === 'business_name') val = lead.business?.name || '';
        else if (col === 'phone') val = lead.business?.phone_number || '';
        else if (col === 'email') val = lead.business?.email || '';
        else if (col === 'website') val = lead.business?.website_url || '';
        else if (col === 'city') val = lead.business?.city || '';
        else if (col === 'address') val = lead.business?.address || '';
        else if (col === 'rating') val = String(lead.business?.rating || '');
        else if (col === 'reviews_count') val = String(lead.business?.reviews_count || 0);
        else if (col === 'lead_score') val = String(lead.lead_score?.total_score || lead.score_value || 0);
        else if (col === 'status') val = lead.status;
        else if (col === 'top_opportunity') val = lead.opportunities?.[0]?.title || '';
        else if (col === 'technical_deficit') val = lead.opportunities?.[0]?.evidence || '';
        else val = 'YES';

        // RFC 4180 escape quotes
        if (val.includes(',') || val.includes('"') || val.includes('\n')) {
          return `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      }).join(',');
    });

    // UTF-8 BOM
    const csvContent = '\uFEFF' + [headers, ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${(exportModalList || selectedList)?.name || 'leads'}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          {selectedList ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedList(null)}
                className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-slate-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: selectedList.color || '#10B981' }}
                  />
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                    {selectedList.name}
                  </h1>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selectedList.description || 'Custom targeted lead segment'}
                </p>
              </div>
            </div>
          ) : (
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Custom Lists & Segments
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Group prospects by deficit, campaign focus, or geographical territory
              </p>
            </div>
          )}
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-3">
          {selectedList ? (
            <button
              onClick={() => setExportModalList(selectedList)}
              className="px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-200 hover:text-white text-xs font-mono font-medium transition-all inline-flex items-center gap-2"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              Export List CSV
            </button>
          ) : (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-mono font-semibold transition-all inline-flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.25)]"
            >
              <FolderPlus className="w-4 h-4" />
              New Custom List
            </button>
          )}
        </div>
      </div>

      {/* SELECTED LIST LEADS VIEW */}
      {selectedList ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
              List Members ({(SAMPLE_LIST_LEADS[selectedList.id] || []).length} leads)
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {(SAMPLE_LIST_LEADS[selectedList.id] || []).map((lead) => (
              <div
                key={lead.id}
                className="p-5 rounded-2xl bg-[#111318] border border-white/[0.08] hover:border-white/[0.16] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/leads/${lead.id}`}
                      className="text-base font-semibold text-white hover:text-emerald-400 transition-colors"
                    >
                      {lead.business?.name}
                    </Link>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                      Score: {lead.lead_score?.total_score}/100
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-mono">
                    <span className="flex items-center gap-1.5 text-amber-400">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      {lead.business?.rating}★ ({lead.business?.reviews_count} reviews)
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      {lead.business?.phone_number}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-slate-500" />
                      {lead.business?.website_url}
                    </span>
                  </div>

                  {lead.opportunities?.[0] && (
                    <p className="text-xs text-slate-300">
                      <span className="text-emerald-400 font-mono">Top Deficit:</span> {lead.opportunities[0].title}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setOutreachLead(lead)}
                    className="px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-medium transition-all inline-flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    AI Outreach
                  </button>
                  <Link
                    href={`/leads/${lead.id}`}
                    className="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/[0.08] text-xs font-mono transition-all"
                  >
                    Dossier &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ALL LISTS GRID VIEW */
        <div className="space-y-6">
          {/* Search bar */}
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search custom lists..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-emerald-500/50 transition-all"
            />
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredLists.map((list) => (
              <ListCard
                key={list.id}
                list={list}
                onView={(l) => setSelectedList(l)}
                onExport={(l) => setExportModalList(l)}
                onDelete={handleDeleteList}
              />
            ))}
          </div>

          {filteredLists.length === 0 && (
            <div className="text-center py-16 px-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
              <Layers className="w-8 h-8 text-slate-600 mx-auto" />
              <h3 className="text-sm font-semibold text-slate-300">No custom lists found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Create custom lists to group prospects by deficit angle or export custom CSVs.
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono hover:bg-emerald-500/20 transition-all"
              >
                Create your first list
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modals & Drawers */}
      <CreateListModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateList={handleCreateList}
      />

      <ExportModal
        isOpen={!!exportModalList}
        onClose={() => setExportModalList(null)}
        listName={exportModalList?.name}
        leadCount={exportModalList?.leads_count || 5}
        onExport={handleExportListCsv}
      />

      <OutreachDrawer
        isOpen={!!outreachLead}
        onClose={() => setOutreachLead(null)}
        lead={outreachLead}
      />
    </div>
  );
}
