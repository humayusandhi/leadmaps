'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import type { BusinessDTO, SearchCriteriaDTO } from '@leadmap/shared-types';
import { BusinessResultCard } from '@/components/finder/BusinessResultCard';
import { LeadAnalysisModal } from '@/components/finder/LeadAnalysisModal';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api/client';
import {
  Compass,
  Filter,
  Globe,
  HelpCircle,
  Layers,
  Map as MapIcon,
  MapPin,
  RefreshCw,
  Search as SearchIcon,
  Sliders,
  SlidersHorizontal,
  Sparkles,
  Star,
  Zap,
} from 'lucide-react';

// Dynamic import for Leaflet Map Canvas to ensure zero SSR errors
const MapCanvas = dynamic(
  () => import('@/components/finder/MapCanvas').then((mod) => mod.MapCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[420px] rounded-2xl bg-[#090A0D] border border-white/[0.08] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          <span className="font-mono text-xs text-zinc-500">Initializing Dark Vector Map...</span>
        </div>
      </div>
    ),
  }
);

const PRESET_CATEGORIES = [
  'Roofing Contractors',
  'Dental Clinics',
  'HVAC Specialists',
  'Plumbing Services',
  'Law Firms',
  'Accounting & CPA',
];

// Fallback initial dataset for instantaneous demonstration in Denver, CO
const INITIAL_DEMO_BUSINESSES: BusinessDTO[] = [
  {
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
    is_saved: false,
  },
  {
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
  {
    id: 'biz-003',
    google_place_id: 'ChIJ_summit_roof_repair',
    name: 'Summit Roof Repair & Restoration',
    formatted_address: '850 Lincoln St, Denver, CO 80203, USA',
    city: 'Denver',
    country: 'USA',
    phone_number: '+1 303-555-0134',
    website_url: null, // Deficit: No Website!
    rating: 4.2,
    review_count: 34,
    latitude: 39.7302,
    longitude: -104.9863,
    is_saved: false,
  },
  {
    id: 'biz-004',
    google_place_id: 'ChIJ_front_range_exteriors',
    name: 'Front Range Architectural Exteriors',
    formatted_address: '1750 15th St, Denver, CO 80202, USA',
    city: 'Denver',
    country: 'USA',
    phone_number: '+1 303-555-0215',
    website_url: 'https://www.frontrangeexteriors.com',
    rating: 4.8,
    review_count: 215,
    latitude: 39.7529,
    longitude: -105.0021,
    is_saved: false,
  },
  {
    id: 'biz-005',
    google_place_id: 'ChIJ_precision_roof_care',
    name: 'Precision Shingle & Tile Masters',
    formatted_address: '3200 Tejon St, Denver, CO 80211, USA',
    city: 'Denver',
    country: 'USA',
    phone_number: '+1 303-555-0178',
    website_url: 'https://www.precisionrooftile.com',
    rating: 4.6,
    review_count: 78,
    latitude: 39.7621,
    longitude: -105.0112,
    is_saved: false,
  },
  {
    id: 'biz-006',
    google_place_id: 'ChIJ_integrity_roof_pros',
    name: 'Integrity Solar & Metal Roofing',
    formatted_address: '1100 E 17th Ave, Denver, CO 80218, USA',
    city: 'Denver',
    country: 'USA',
    phone_number: '+1 303-555-0163',
    website_url: 'https://www.integritysolarcolorado.com',
    rating: 5.0,
    review_count: 63,
    latitude: 39.7434,
    longitude: -104.9734,
    is_saved: false,
  },
  {
    id: 'biz-007',
    google_place_id: 'ChIJ_colorado_heritage_roof',
    name: 'Colorado Heritage Roof Crafters',
    formatted_address: '500 Santa Fe Dr, Denver, CO 80204, USA',
    city: 'Denver',
    country: 'USA',
    phone_number: '+1 303-555-0199',
    website_url: null, // Deficit: No Website!
    rating: 3.9,
    review_count: 22,
    latitude: 39.7245,
    longitude: -104.9988,
    is_saved: false,
  },
];

export default function FinderPage() {
  const { activeWorkspace, consumeCredits, refundCredits } = useAuth();

  // Toast Notification State for Credit / Pipeline actions
  const [toast, setToast] = React.useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  React.useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Handle Save Lead with 1 Credit Per Lead Rule
  const handleSaveLead = (b: BusinessDTO): boolean => {
    if (b.is_saved) {
      const success = consumeCredits(1);
      if (!success) {
        setToast({
          message: 'Insufficient credits! Saving a lead costs 1 credit. Please top up in Billing.',
          type: 'error',
        });
        return false;
      }
      setToast({
        message: `✓ Saved "${b.name}" to pipeline (1 credit used).`,
        type: 'success',
      });
    } else {
      refundCredits(1);
      setToast({
        message: `Removed "${b.name}" from pipeline (1 credit refunded).`,
        type: 'info',
      });
    }

    setBusinesses((prev) =>
      prev.map((item) => (item.id === b.id ? { ...item, is_saved: b.is_saved } : item))
    );
    return true;
  };

  // Search State
  const [category, setCategory] = React.useState('Roofing Contractors');
  const [location, setLocation] = React.useState('Denver, CO');
  const [radiusKm, setRadiusKm] = React.useState(15);
  const [hasWebsiteFilter, setHasWebsiteFilter] = React.useState<'ALL' | 'YES' | 'NO'>('ALL');
  const [minRatingFilter, setMinRatingFilter] = React.useState<number>(0);
  const [minReviewsFilter, setMinReviewsFilter] = React.useState<number>(0);
  const [showFilterDrawer, setShowFilterDrawer] = React.useState(false);

  // Execution & Results State
  const [isSearching, setIsSearching] = React.useState(false);
  const [businesses, setBusinesses] = React.useState<BusinessDTO[]>(INITIAL_DEMO_BUSINESSES);
  const [selectedBusinessId, setSelectedBusinessId] = React.useState<string | null>(
    INITIAL_DEMO_BUSINESSES[0]?.id || null
  );
  const [analyzingBusiness, setAnalyzingBusiness] = React.useState<BusinessDTO | null>(null);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = React.useState<boolean>(false);
  const [searchSummary, setSearchSummary] = React.useState({
    total: INITIAL_DEMO_BUSINESSES.length,
    query: 'Roofing Contractors in Denver, CO',
  });

  // Mobile View Tab (List vs Map)
  const [mobileTab, setMobileTab] = React.useState<'LIST' | 'MAP'>('LIST');

  // Handle Search Submission
  const handleExecuteSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!category.trim() || !location.trim()) return;

    setIsSearching(true);

    try {
      // Execute via backend API client
      const response = await apiClient<{
        search: { id: string; query: string; total_results: number };
        businesses: BusinessDTO[];
      }>('/searches', {
        method: 'POST',
        body: JSON.stringify({
          category,
          location,
          radius_km: radiusKm,
          has_website: hasWebsiteFilter === 'ALL' ? null : hasWebsiteFilter === 'YES',
          min_rating: minRatingFilter > 0 ? minRatingFilter : null,
          min_reviews: minReviewsFilter > 0 ? minReviewsFilter : null,
          sync: true,
        }),
      });

      if (response.success && response.data?.businesses) {
        setBusinesses(response.data.businesses);
        setSearchSummary({
          total: response.data.businesses.length,
          query: `${category} in ${location}`,
        });
        if (response.data.businesses.length > 0) {
          setSelectedBusinessId(response.data.businesses[0].id);
        }
      } else {
        // Mock fallback simulation if backend is not running locally
        simulateLocalSearch();
      }
    } catch {
      // Fallback local simulation for smooth offline developer experience
      simulateLocalSearch();
    } finally {
      setIsSearching(false);
    }
  };

  const simulateLocalSearch = () => {
    const slug = category.toLowerCase().replace(/[^a-z0-9]/g, '');
    const simulated: BusinessDTO[] = Array.from({ length: 12 }).map((_, i) => {
      const latOffset = (Math.sin(i * 1.5) * (radiusKm / 111)) * 0.7;
      const lngOffset = (Math.cos(i * 1.5) * (radiusKm / 111)) * 0.7;
      const hasWeb = i % 4 !== 3;

      return {
        id: `sim-${i + 1}`,
        google_place_id: `ChIJ_sim_${slug}_${i + 1}`,
        name: `${['Apex', 'Summit', 'Mile High', 'Front Range', 'Precision', 'Integrity', 'Vanguard', 'Paramount'][i % 8]} ${category}`,
        formatted_address: `${1000 + i * 150} Main St, ${location}, USA`,
        city: location.split(',')[0].trim(),
        country: 'USA',
        phone_number: `+1 303-555-01${10 + i}`,
        website_url: hasWeb ? `https://www.${slug}-pro${i + 1}.com` : null,
        rating: Number((3.8 + ((i * 3) % 13) * 0.1).toFixed(1)),
        review_count: 15 + i * 18,
        latitude: Number((39.7392 + latOffset).toFixed(5)),
        longitude: Number((-104.9903 + lngOffset).toFixed(5)),
        is_saved: i === 1,
      };
    });

    // Filter simulation
    let filtered = simulated;
    if (hasWebsiteFilter === 'YES') {
      filtered = filtered.filter((b) => b.website_url !== null);
    } else if (hasWebsiteFilter === 'NO') {
      filtered = filtered.filter((b) => b.website_url === null);
    }
    if (minRatingFilter > 0) {
      filtered = filtered.filter((b) => (b.rating ?? 0) >= minRatingFilter);
    }
    if (minReviewsFilter > 0) {
      filtered = filtered.filter((b) => b.review_count >= minReviewsFilter);
    }

    setBusinesses(filtered);
    setSearchSummary({
      total: filtered.length,
      query: `${category} in ${location}`,
    });
    if (filtered.length > 0) {
      setSelectedBusinessId(filtered[0].id);
    }
  };

  // Client-side instant filter application
  const filteredBusinesses = React.useMemo(() => {
    return businesses.filter((b) => {
      if (hasWebsiteFilter === 'YES' && !b.website_url) return false;
      if (hasWebsiteFilter === 'NO' && b.website_url) return false;
      if (minRatingFilter > 0 && (b.rating ?? 0) < minRatingFilter) return false;
      if (minReviewsFilter > 0 && b.review_count < minReviewsFilter) return false;
      return true;
    });
  }, [businesses, hasWebsiteFilter, minRatingFilter, minReviewsFilter]);

  return (
    <div className="h-[calc(100dvh-5.5rem)] flex flex-col max-w-[1700px] mx-auto px-2 sm:px-4 pb-2">
      {/* Search Header Bar (Sticky Top) */}
      <header className="shrink-0 mb-3 rounded-2xl bg-[#111318]/90 backdrop-blur-xl border border-white/[0.08] p-3 shadow-xl">
        <form onSubmit={handleExecuteSearch} className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2.5">
          {/* Category Input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-zinc-500">
              <Compass className="w-4 h-4 text-emerald-400" />
            </div>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Business category (e.g. Roofing, Dentists, HVAC)..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#181B22] border border-white/[0.08] text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 transition-all"
            />
          </div>

          {/* Location Input */}
          <div className="relative w-full lg:w-64">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-zinc-500">
              <MapPin className="w-4 h-4 text-emerald-400" />
            </div>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, State (e.g. Denver, CO)"
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#181B22] border border-white/[0.08] text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 transition-all font-sans"
            />
          </div>

          {/* Radius Slider Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#181B22] border border-white/[0.08] shrink-0">
            <span className="text-xs font-mono text-zinc-400 whitespace-nowrap">Radius:</span>
            <input
              type="range"
              min={1}
              max={50}
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              className="w-20 sm:w-24 accent-emerald-500 cursor-pointer"
            />
            <span className="font-mono text-xs font-bold text-emerald-400 w-11 text-right">
              {radiusKm} km
            </span>
          </div>

          {/* Filter Toggle Button */}
          <button
            type="button"
            onClick={() => setShowFilterDrawer(!showFilterDrawer)}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-sans font-medium transition-spring btn-tactile shrink-0 ${
              hasWebsiteFilter !== 'ALL' || minRatingFilter > 0 || minReviewsFilter > 0
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                : 'bg-[#181B22] border-white/[0.08] text-zinc-300 hover:text-white hover:border-white/20'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
            Filters
            {(hasWebsiteFilter !== 'ALL' || minRatingFilter > 0 || minReviewsFilter > 0) && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            )}
          </button>

          {/* Primary Action CTA */}
          <button
            type="submit"
            disabled={isSearching}
            className="flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-sans font-semibold text-sm shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_28px_rgba(16,185,129,0.5)] transition-all btn-tactile disabled:opacity-60 shrink-0"
          >
            {isSearching ? (
              <RefreshCw className="w-4 h-4 animate-spin text-black" />
            ) : (
              <SearchIcon className="w-4 h-4 text-black" />
            )}
            <span>{isSearching ? 'Discovering...' : 'Search Places'}</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/15 font-bold" title="1 credit consumed per lead saved">
              1 Credit / Lead
            </span>
          </button>
        </form>

        {/* Filter Drawer / Expanded Bar */}
        {showFilterDrawer && (
          <div className="mt-3 pt-3 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
              <span className="text-zinc-500 font-mono text-[11px] uppercase mr-1">Presets:</span>
              {PRESET_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setCategory(cat);
                  }}
                  className={`px-2.5 py-1 rounded-lg border text-xs whitespace-nowrap transition-colors ${
                    category === cat
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-medium'
                      : 'bg-white/[0.04] border-white/[0.06] text-zinc-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Threshold Toggles */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Website Presence Filter */}
              <div className="flex items-center rounded-lg bg-[#181B22] p-0.5 border border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setHasWebsiteFilter('ALL')}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-mono transition-colors ${
                    hasWebsiteFilter === 'ALL' ? 'bg-white/[0.1] text-white' : 'text-zinc-400'
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setHasWebsiteFilter('YES')}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-mono transition-colors ${
                    hasWebsiteFilter === 'YES' ? 'bg-emerald-500/20 text-emerald-300 font-medium' : 'text-zinc-400'
                  }`}
                >
                  Has Web
                </button>
                <button
                  type="button"
                  onClick={() => setHasWebsiteFilter('NO')}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-mono transition-colors ${
                    hasWebsiteFilter === 'NO' ? 'bg-rose-500/20 text-rose-300 font-medium' : 'text-zinc-400'
                  }`}
                >
                  No Web
                </button>
              </div>

              {/* Star Rating Threshold */}
              <div className="flex items-center gap-1 bg-[#181B22] px-2 py-1 rounded-lg border border-white/[0.08]">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <select
                  value={minRatingFilter}
                  onChange={(e) => setMinRatingFilter(Number(e.target.value))}
                  className="bg-transparent text-xs text-zinc-300 focus:outline-none font-mono"
                >
                  <option value={0} className="bg-[#181B22]">Any Rating</option>
                  <option value={3.5} className="bg-[#181B22]">3.5+ Stars</option>
                  <option value={4.0} className="bg-[#181B22]">4.0+ Stars</option>
                  <option value={4.5} className="bg-[#181B22]">4.5+ Stars</option>
                </select>
              </div>

              {/* Reset Filters */}
              {(hasWebsiteFilter !== 'ALL' || minRatingFilter > 0 || minReviewsFilter > 0) && (
                <button
                  type="button"
                  onClick={() => {
                    setHasWebsiteFilter('ALL');
                    setMinRatingFilter(0);
                    setMinReviewsFilter(0);
                  }}
                  className="text-zinc-500 hover:text-rose-400 text-xs underline font-mono"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Mobile Tab Switcher (< 768px) */}
      <div className="flex md:hidden items-center justify-center mb-2 shrink-0">
        <div className="flex rounded-xl bg-[#111318] p-1 border border-white/[0.08] w-full max-w-xs shadow-md">
          <button
            onClick={() => setMobileTab('LIST')}
            className={`flex-1 py-2 rounded-lg text-xs font-sans font-semibold flex items-center justify-center gap-1.5 transition-colors ${
              mobileTab === 'LIST'
                ? 'bg-emerald-500 text-black shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Feed ({filteredBusinesses.length})
          </button>
          <button
            onClick={() => setMobileTab('MAP')}
            className={`flex-1 py-2 rounded-lg text-xs font-sans font-semibold flex items-center justify-center gap-1.5 transition-colors ${
              mobileTab === 'MAP'
                ? 'bg-emerald-500 text-black shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            Interactive Map
          </button>
        </div>
      </div>

      {/* Split Cockpit Content Area (50/50 Desktop) */}
      <div className="flex-1 flex flex-col md:flex-row gap-3 min-h-0">
        {/* Left Panel: Scrollable Stream (480px–560px on desktop) */}
        <section
          className={`flex flex-col w-full md:w-[480px] lg:w-[540px] shrink-0 h-full min-h-0 rounded-2xl bg-[#111318]/50 backdrop-blur-md border border-white/[0.08] p-3 shadow-xl ${
            mobileTab === 'MAP' ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Header Counter & Active Query */}
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/[0.08] shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="font-sans font-semibold text-sm text-white">
                {searchSummary.total} {searchSummary.total === 1 ? 'Business' : 'Businesses'} Discovered
              </h2>
            </div>
            <span className="font-mono text-xs text-zinc-400 truncate max-w-[200px]">
              {searchSummary.query}
            </span>
          </div>

          {/* Scrollable Feed List */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-3 scrollbar-thin scrollbar-thumb-zinc-800">
            {filteredBusinesses.length > 0 ? (
              filteredBusinesses.map((business, index) => (
                <div
                  key={business.id}
                  style={{
                    animationDelay: `${index * 40}ms`,
                  }}
                  className="animate-fade-in"
                >
                  <BusinessResultCard
                    business={business}
                    rank={index + 1}
                    isSelected={business.id === selectedBusinessId}
                    onSelect={(id) => setSelectedBusinessId(id)}
                    onAnalyze={(b) => {
                      setAnalyzingBusiness(b);
                      setIsAnalysisModalOpen(true);
                    }}
                    onSave={handleSaveLead}
                  />
                </div>
              ))
            ) : (
              /* Empty Search State per docs/TEST_PLAN.md Section 2 */
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center p-6 text-center rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div className="w-12 h-12 rounded-full bg-amber-400/10 border border-amber-400/20 flex items-center justify-center mb-3">
                  <HelpCircle className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="font-sans font-semibold text-base text-white mb-1">
                  No businesses found matching criteria
                </h3>
                <p className="font-sans text-xs text-zinc-400 max-w-sm mb-4 leading-relaxed">
                  No local businesses match your current filters. Try expanding your search radius (e.g. from 5 km to 25 km) or broadening category keywords.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    onClick={() => {
                      setRadiusKm(30);
                      setHasWebsiteFilter('ALL');
                      setMinRatingFilter(0);
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-black text-xs font-semibold border border-emerald-500/30 transition-all btn-tactile"
                  >
                    Expand Radius to 30 km
                  </button>
                  <button
                    onClick={() => {
                      setHasWebsiteFilter('ALL');
                      setMinRatingFilter(0);
                      setMinReviewsFilter(0);
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-zinc-300 text-xs font-medium border border-white/[0.08] transition-all"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Right Panel: Full-Bleed Map View */}
        <section
          className={`flex-1 h-full min-h-0 relative ${
            mobileTab === 'LIST' ? 'hidden md:block' : 'block'
          }`}
        >
          <MapCanvas
            businesses={filteredBusinesses}
            selectedBusinessId={selectedBusinessId}
            onSelectBusiness={(id) => {
              setSelectedBusinessId(id);
              // On mobile, keep track of selection
            }}
            onSearchArea={(lat, lng) => {
              // Trigger discovery query centered at newly panned coordinates
              handleExecuteSearch();
            }}
          />
        </section>
      </div>

      {/* Interactive Website Intelligence & AI Scoring Modal */}
      <LeadAnalysisModal
        business={analyzingBusiness}
        isOpen={isAnalysisModalOpen}
        onClose={() => {
          setIsAnalysisModalOpen(false);
          setAnalyzingBusiness(null);
        }}
        onSaveLead={handleSaveLead}
      />

      {/* Dynamic Toast Feedback */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-2xl transition-all duration-300 animate-fade-in text-xs font-mono font-medium ${
            toast.type === 'error'
              ? 'bg-rose-950/90 border-rose-500/40 text-rose-200'
              : toast.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
              : 'bg-zinc-900/90 border-white/20 text-zinc-200'
          }`}
        >
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="text-zinc-400 hover:text-white ml-2 text-sm"
          >
            &times;
          </button>
        </div>
      )}
    </div>
  );
}
