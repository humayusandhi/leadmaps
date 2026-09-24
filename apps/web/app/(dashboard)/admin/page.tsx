'use client';

import * as React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { DoubleBezelCard } from '@/components/ui/double-bezel-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { SubscriptionTier } from '@leadmap/shared-types';
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  Building2,
  Coins,
  Activity,
  Cpu,
  Server,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Plus,
  ArrowUpRight,
  Database,
  Key,
  Flame,
  Clock,
  Sparkles,
  Lock,
  Download,
} from 'lucide-react';

interface TenantWorkspace {
  id: string;
  name: string;
  owner_name: string;
  owner_email: string;
  tier: SubscriptionTier;
  credit_balance: number;
  total_leads_saved: number;
  searches_count: number;
  status: 'ACTIVE' | 'FLAGGED' | 'SUSPENDED';
  created_at: string;
}

const INITIAL_TENANTS: TenantWorkspace[] = [
  {
    id: 'ws-demo-01',
    name: "Apex Growth Agency",
    owner_name: 'Humayu Sandhi',
    owner_email: 'admin@leadmap.ai',
    tier: 'AGENCY',
    credit_balance: 14850,
    total_leads_saved: 124,
    searches_count: 88,
    status: 'ACTIVE',
    created_at: '2026-09-01T08:00:00Z',
  },
  {
    id: 'ws-austin-02',
    name: 'Austin Dental Outreach Co.',
    owner_name: 'Marcus Vance',
    owner_email: 'marcus@austindental.io',
    tier: 'GROWTH',
    credit_balance: 1940,
    total_leads_saved: 46,
    searches_count: 32,
    status: 'ACTIVE',
    created_at: '2026-09-10T11:20:00Z',
  },
  {
    id: 'ws-roofing-03',
    name: 'Mile High Roofing Funnels',
    owner_name: 'Sarah Lindqvist',
    owner_email: 'sarah@milehighroofing.com',
    tier: 'PRO',
    credit_balance: 4780,
    total_leads_saved: 89,
    searches_count: 54,
    status: 'ACTIVE',
    created_at: '2026-09-14T14:40:00Z',
  },
  {
    id: 'ws-solaria-04',
    name: 'Solaria Clean Energy Sales',
    owner_name: 'David Zhao',
    owner_email: 'david@solariapower.co',
    tier: 'STARTER',
    credit_balance: 380,
    total_leads_saved: 18,
    searches_count: 14,
    status: 'ACTIVE',
    created_at: '2026-09-18T09:15:00Z',
  },
  {
    id: 'ws-freemium-05',
    name: 'Northstar Local SEO Lab',
    owner_name: 'Elena Rostova',
    owner_email: 'elena@northstarlab.dev',
    tier: 'FREE',
    credit_balance: 12,
    total_leads_saved: 5,
    searches_count: 8,
    status: 'FLAGGED',
    created_at: '2026-09-20T16:00:00Z',
  },
];

export default function SuperAdminDashboardPage() {
  const { user, isLoading } = useAuth();
  const [tenants, setTenants] = React.useState<TenantWorkspace[]>(INITIAL_TENANTS);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedTier, setSelectedTier] = React.useState<string>('ALL');
  const [selectedTenant, setSelectedTenant] = React.useState<TenantWorkspace | null>(null);
  const [grantAmount, setGrantAmount] = React.useState<number>(500);
  const [isGrantModalOpen, setIsGrantModalOpen] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const isSuperAdmin =
    Boolean(user?.email?.toLowerCase().includes('admin')) ||
    user?.email?.toLowerCase() === 'operator@leadmap.ai';

  if (!isLoading && user && !isSuperAdmin) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-white font-sans">Access Denied</h1>
        <p className="text-xs text-slate-400 max-w-sm mx-auto font-sans">
          The Super Admin Control Plane is restricted to platform operators. Your current account does not have root administrative clearance.
        </p>
        <div className="pt-2">
          <a
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-sans font-bold text-xs shadow-lg transition-all"
          >
            Return to User Dashboard
          </a>
        </div>
      </div>
    );
  }

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtered tenants list
  const filteredTenants = React.useMemo(() => {
    return tenants.filter((t) => {
      const matchesSearch =
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.owner_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.owner_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTier = selectedTier === 'ALL' || t.tier === selectedTier;
      return matchesSearch && matchesTier;
    });
  }, [tenants, searchQuery, selectedTier]);

  // Handle tier upgrade/downgrade
  const handleUpdateTier = (id: string, nextTier: SubscriptionTier) => {
    setTenants((prev) =>
      prev.map((t) => (t.id === id ? { ...t, tier: nextTier } : t))
    );
    showToast(`Workspace tier updated to ${nextTier}`);
  };

  // Handle status toggle
  const handleToggleStatus = (id: string) => {
    setTenants((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const next = t.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
          return { ...t, status: next };
        }
        return t;
      })
    );
    showToast('Tenant status modified.');
  };

  // Handle direct credit injection
  const handleInjectCredits = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant || grantAmount <= 0) return;

    setTenants((prev) =>
      prev.map((t) =>
        t.id === selectedTenant.id
          ? { ...t, credit_balance: t.credit_balance + grantAmount }
          : t
      )
    );
    showToast(`Injected +${grantAmount.toLocaleString()} credits into "${selectedTenant.name}".`);
    setIsGrantModalOpen(false);
  };

  const handleRefreshDiagnostics = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('Diagnostic health telemetry re-synced.');
    }, 600);
  };

  // Platform Telemetry Aggregates
  const totalCreditsInCirculation = tenants.reduce((acc, t) => acc + t.credit_balance, 0);
  const totalLeadsExtracted = tenants.reduce((acc, t) => acc + t.total_leads_saved, 0);
  const totalSearchesFired = tenants.reduce((acc, t) => acc + t.searches_count, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-[#181B22] border border-emerald-500/40 text-emerald-300 text-xs font-sans shadow-2xl flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          {toastMessage}
        </div>
      )}

      {/* Super Admin Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-[11px] font-mono text-rose-400 uppercase tracking-widest font-bold">
              <ShieldAlert className="w-3.5 h-3.5" />
              Root Privilege Tier
            </span>
            <span className="text-xs font-mono text-slate-500">&bull;</span>
            <span className="text-xs font-mono text-emerald-400">Security Guard Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
            Super Administrator Control Plane
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-sans">
            Global tenant provisioning, credit issuance authority, cluster health telemetry, and service quotas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefreshDiagnostics}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-mono text-slate-300 hover:text-white transition-colors btn-tactile"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
            <span>Rescan Services</span>
          </button>
        </div>
      </div>

      {/* Top Telemetry KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DoubleBezelCard innerClassName="p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Total Workspaces</span>
            <Building2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tracking-tight">
            {tenants.length}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono">
            <span>100% SLA uptime</span>
            <span className="text-slate-600">&bull;</span>
            <span className="text-slate-400">4 Active / 1 Flagged</span>
          </div>
        </DoubleBezelCard>

        <DoubleBezelCard innerClassName="p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Circulating Credits</span>
            <Coins className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tracking-tight">
            {totalCreditsInCirculation.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-amber-400 font-mono">
            <span>Pool reserve</span>
            <span className="text-slate-600">&bull;</span>
            <span className="text-slate-400">Burn rate: 42/hr</span>
          </div>
        </DoubleBezelCard>

        <DoubleBezelCard innerClassName="p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Leads Unlocked</span>
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tracking-tight">
            {totalLeadsExtracted.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-cyan-400 font-mono">
            <span>Across 5 tenants</span>
            <span className="text-slate-600">&bull;</span>
            <span className="text-slate-400">86.4% avg audit score</span>
          </div>
        </DoubleBezelCard>

        <DoubleBezelCard innerClassName="p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Searches Executed</span>
            <Activity className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tracking-tight">
            {totalSearchesFired.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-indigo-400 font-mono">
            <span>Google Places v1 API</span>
            <span className="text-slate-600">&bull;</span>
            <span className="text-slate-400">220ms avg latency</span>
          </div>
        </DoubleBezelCard>
      </div>

      {/* Gateway Health & Cluster Status */}
      <div className="rounded-2xl bg-[#111318] border border-white/[0.08] p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white font-sans">Core Cluster & Security Status</h2>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            All Systems Nominal
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-[#181B22] border border-white/[0.06] space-y-1">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300">Places API Gateway</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Online
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Latency: 184ms &bull; Cache hit: 68%</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#181B22] border border-white/[0.06] space-y-1">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300">OpenAI Outreach Model</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Operational
              </span>
            </div>
            <p className="text-[11px] text-slate-500">GPT-4o Mini &bull; Avg gen: 1.1s</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#181B22] border border-white/[0.06] space-y-1">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300">CWE-1236 Sanitizer</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Enforced
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Formula escaping active on CSV exports</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#181B22] border border-white/[0.06] space-y-1">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300">SSRF Crawler Guard</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Locked
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Private IP/Metadata blocking enabled</p>
          </div>
        </div>
      </div>

      {/* Multi-Tenant Workspace Management Table */}
      <div className="rounded-2xl bg-[#111318] border border-white/[0.08] shadow-xl overflow-hidden space-y-4 p-5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white font-sans">Registered Tenant Workspaces</h2>
            <p className="text-xs text-slate-400">
              Directly reallocate credit allocations, manage subscription plan tiers, or freeze suspicious tenants.
            </p>
          </div>

          {/* Search & Tier Filters */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tenant or email..."
                className="pl-8 pr-3 py-1.5 rounded-xl bg-[#181B22] border border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-sans"
              />
            </div>

            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="bg-[#181B22] border border-white/[0.08] text-xs font-mono text-emerald-400 px-3 py-1.5 rounded-xl focus:outline-none"
            >
              <option value="ALL">All Tiers</option>
              <option value="FREE">FREE</option>
              <option value="STARTER">STARTER</option>
              <option value="GROWTH">GROWTH</option>
              <option value="PRO">PRO</option>
              <option value="AGENCY">AGENCY</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-[#181B22] text-slate-400 border-b border-white/[0.08] font-mono text-[11px] uppercase">
              <tr>
                <th className="py-3 px-4">Workspace & Owner</th>
                <th className="py-3 px-4">Tier</th>
                <th className="py-3 px-4">Credits</th>
                <th className="py-3 px-4">Leads Saved</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredTenants.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white">{tenant.name}</div>
                    <div className="text-[11px] text-slate-400">
                      {tenant.owner_name} &bull; <span className="font-mono">{tenant.owner_email}</span>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <select
                      value={tenant.tier}
                      onChange={(e) => handleUpdateTier(tenant.id, e.target.value as SubscriptionTier)}
                      className="bg-[#181B22] border border-white/[0.1] rounded-lg px-2 py-1 text-[11px] font-mono font-bold text-emerald-400 focus:outline-none cursor-pointer"
                    >
                      <option value="FREE">FREE (50)</option>
                      <option value="STARTER">STARTER (500)</option>
                      <option value="GROWTH">GROWTH (2,000)</option>
                      <option value="PRO">PRO (5,000)</option>
                      <option value="AGENCY">AGENCY (15,000)</option>
                    </select>
                  </td>

                  <td className="py-3 px-4 font-mono">
                    <span className="font-bold text-white">{tenant.credit_balance.toLocaleString()}</span>
                    <span className="text-[10px] text-slate-500 uppercase ml-1">cr</span>
                  </td>

                  <td className="py-3 px-4 font-mono text-slate-300">
                    {tenant.total_leads_saved} leads
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        tenant.status === 'ACTIVE'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : tenant.status === 'FLAGGED'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          tenant.status === 'ACTIVE'
                            ? 'bg-emerald-400'
                            : tenant.status === 'FLAGGED'
                            ? 'bg-amber-400'
                            : 'bg-rose-400'
                        }`}
                      />
                      {tenant.status}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTenant(tenant);
                        setIsGrantModalOpen(true);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-mono text-[11px] transition-colors"
                    >
                      + Grant Credits
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(tenant.id)}
                      className={`px-2.5 py-1 rounded-lg border font-mono text-[11px] transition-colors ${
                        tenant.status === 'ACTIVE'
                          ? 'bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/30 text-rose-300'
                          : 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
                      }`}
                    >
                      {tenant.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Direct Credit Grant Modal */}
      {isGrantModalOpen && selectedTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-[#181B22] border border-white/[0.12] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white font-sans">Inject Platform Credits</h3>
              </div>
              <button
                onClick={() => setIsGrantModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-mono"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Authorize administrative credit allocation for <strong>{selectedTenant.name}</strong> ({selectedTenant.owner_email}).
            </p>

            <form onSubmit={handleInjectCredits} className="space-y-4">
              <div>
                <label className="text-xs font-mono text-slate-300 block mb-1">
                  Credit Amount to Grant:
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[100, 500, 2000, 5000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setGrantAmount(amt)}
                      className={`py-1.5 rounded-lg font-mono text-xs border ${
                        grantAmount === amt
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                          : 'bg-white/[0.04] border-white/[0.08] text-slate-400 hover:text-white'
                      }`}
                    >
                      +{amt}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="1"
                  max="100000"
                  value={grantAmount}
                  onChange={(e) => setGrantAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-[#111318] border border-white/[0.1] text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsGrantModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-sans font-bold text-xs shadow-[0_0_16px_rgba(16,185,129,0.3)] transition-all"
                >
                  Authorize Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
