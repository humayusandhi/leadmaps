'use client';

import * as React from 'react';
import type { BusinessDTO } from '@leadmap/shared-types';
import { Compass, ExternalLink, MapPin, RefreshCw, Star } from 'lucide-react';
import L from 'leaflet';

interface MapCanvasProps {
  businesses: BusinessDTO[];
  selectedBusinessId: string | null;
  onSelectBusiness: (id: string) => void;
  center?: [number, number];
  zoom?: number;
  onSearchArea?: (lat: number, lng: number) => void;
}

export function MapCanvas({
  businesses,
  selectedBusinessId,
  onSelectBusiness,
  center = [39.7392, -104.9903],
  zoom = 12,
  onSearchArea,
}: MapCanvasProps) {
  const mapContainerRef = React.useRef<HTMLDivElement>(null);
  const mapInstanceRef = React.useRef<L.Map | null>(null);
  const markersRef = React.useRef<Map<string, L.Marker>>(new Map());
  const [showSearchArea, setShowSearchArea] = React.useState(false);
  const [mapLoaded, setMapLoaded] = React.useState(false);

  // Initialize Leaflet Map
  React.useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialCenter = businesses.length > 0 && businesses[0].latitude && businesses[0].longitude
      ? [businesses[0].latitude, businesses[0].longitude] as [number, number]
      : center;

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom,
      zoomControl: false,
      attributionControl: false,
    });

    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

    if (mapboxToken) {
      // High-resolution Mapbox Dark v11 tiles matching Void Obsidian palette
      L.tileLayer(
        `https://api.mapbox.com/styles/v1/mapbox/dark-v11/tiles/{z}/{x}/{y}?access_token=${mapboxToken}`,
        {
          maxZoom: 20,
          tileSize: 512,
          zoomOffset: -1,
        }
      ).addTo(map);
    } else {
      // Dark-Matter CartoDB Tiles matching Void Obsidian (#090A0D)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);
    }

    // Zoom Controls in bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Attribution in subtle bottom left
    L.control.attribution({
      position: 'bottomleft',
      prefix: `<span class="text-[10px] text-zinc-600 font-mono">${
        mapboxToken ? 'Mapbox &bull; OpenStreetMap' : 'CARTO &bull; OpenStreetMap'
      }</span>`,
    }).addTo(map);

    map.on('moveend', () => {
      setShowSearchArea(true);
    });

    mapInstanceRef.current = map;
    setMapLoaded(true);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Sync Markers with Businesses
  React.useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    if (businesses.length === 0) return;

    const bounds = L.latLngBounds([]);

    businesses.forEach((b, index) => {
      if (!b.latitude || !b.longitude) return;

      const isSelected = b.id === selectedBusinessId;
      const rank = index + 1;

      // Create Custom Signal Emerald Marker Pin
      const iconHtml = `
        <div class="relative flex items-center justify-center group cursor-pointer" data-id="${b.id}">
          <div class="absolute -inset-2 rounded-full bg-emerald-500/20 blur-[3px] transition-all ${
            isSelected ? 'scale-150 bg-emerald-400/40 opacity-100' : 'opacity-0 group-hover:opacity-100'
          }"></div>
          <div class="relative flex items-center justify-center w-7 h-7 rounded-full transition-all duration-300 ${
            isSelected
              ? 'bg-emerald-500 text-black shadow-[0_0_16px_rgba(16,185,129,0.8)] scale-110 ring-2 ring-white'
              : 'bg-[#111318] text-emerald-400 border border-emerald-500/50 hover:bg-emerald-500 hover:text-black shadow-lg'
          }">
            <span class="font-mono text-xs font-bold">${rank}</span>
          </div>
          ${
            b.is_saved
              ? '<span class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-[#111318]" title="Saved in pipeline"></span>'
              : ''
          }
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-emerald-pin',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -18],
      });

      const marker = L.marker([b.latitude, b.longitude], { icon: customIcon }).addTo(map);

      // Popup content
      const popupHtml = `
        <div class="p-3.5 space-y-2 min-w-[220px]">
          <div class="flex items-start justify-between gap-2">
            <h4 class="font-sans font-semibold text-sm text-white leading-tight">${b.name}</h4>
            ${
              b.rating
                ? `<div class="flex items-center gap-1 font-mono text-xs font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20 shrink-0">
                    ★ ${b.rating}
                  </div>`
                : ''
            }
          </div>
          <p class="font-sans text-xs text-zinc-400 leading-relaxed">${b.formatted_address}</p>
          <div class="pt-2 flex items-center justify-between border-t border-white/[0.08] text-xs">
            ${
              b.website_url
                ? `<a href="${b.website_url}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 text-emerald-400 hover:underline">
                    Website &rarr;
                  </a>`
                : '<span class="text-zinc-500 font-mono text-[11px]">No Website</span>'
            }
            ${
              b.phone_number
                ? `<span class="font-mono text-[11px] text-zinc-300">${b.phone_number}</span>`
                : ''
            }
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        closeButton: false,
        autoPan: true,
      });

      marker.on('click', () => {
        onSelectBusiness(b.id);
      });

      markersRef.current.set(b.id, marker);
      bounds.extend([b.latitude, b.longitude]);
    });

    // Fit bounds if multiple points
    if (bounds.isValid() && businesses.length > 1) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, [businesses, mapLoaded]);

  // Center on Selected Business
  React.useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedBusinessId) return;

    const selected = businesses.find((b) => b.id === selectedBusinessId);
    if (!selected || !selected.latitude || !selected.longitude) return;

    map.flyTo([selected.latitude, selected.longitude], 15, {
      duration: 0.8,
      easeLinearity: 0.25,
    });

    const marker = markersRef.current.get(selectedBusinessId);
    if (marker && !marker.isPopupOpen()) {
      marker.openPopup();
    }
  }, [selectedBusinessId, businesses]);

  const handleSearchThisArea = () => {
    if (!mapInstanceRef.current || !onSearchArea) return;
    const center = mapInstanceRef.current.getCenter();
    onSearchArea(center.lat, center.lng);
    setShowSearchArea(false);
  };

  return (
    <div className="relative w-full h-full min-h-[420px] bg-[#090A0D] overflow-hidden rounded-2xl border border-white/[0.08] shadow-2xl">
      {/* Map Element Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating "Search this area" Pill */}
      {showSearchArea && onSearchArea && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 transition-all">
          <button
            onClick={handleSearchThisArea}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#111318]/90 backdrop-blur-md border border-white/[0.12] text-xs font-sans font-medium text-white shadow-xl hover:bg-[#181B22] hover:border-emerald-500/50 hover:text-emerald-400 transition-spring btn-tactile"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
            Search this area
          </button>
        </div>
      )}

      {/* Subtle Map Status Watermark */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111318]/80 backdrop-blur-md border border-white/[0.08] text-[11px] font-mono text-zinc-400">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>{businesses.length} Places Plotted</span>
      </div>
    </div>
  );
}
