'use client';

import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Star,
  ArrowRight,
  Navigation,
  Hotel as HotelIcon,
  Compass,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { HotelCatalogItem, NearbyHotelResult } from '../../types';
import { bookingService } from '../../services/bookingService';
import { Button } from '../ui/Button';

interface NearbyHotelsPanelProps {
  tripId: string;
  destination: string;
  onSelectHotel: (hotel: HotelCatalogItem) => void;
}

export const NearbyHotelsPanel: React.FC<NearbyHotelsPanelProps> = ({
  tripId,
  destination,
  onSelectHotel,
}) => {
  const [results, setResults] = useState<NearbyHotelResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNearby = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await bookingService.browseNearbyHotels(tripId);
      setResults(data);
    } catch (err: any) {
      console.error('Failed to fetch nearby hotels:', err);
      setError(err.message || 'Failed to load nearby hotels.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNearby();
  }, [tripId]);

  // Format distance for display
  const formatDistance = (km: number): string => {
    if (km < 1) return `${Math.round(km * 1000)}m`;
    if (km < 10) return `${km.toFixed(1)} km`;
    return `${Math.round(km)} km`;
  };

  // Get color for distance badge
  const getDistanceBadgeStyle = (km: number): string => {
    if (km < 2) return 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60';
    if (km < 5) return 'bg-blue-950/80 text-blue-300 border-blue-700/60';
    if (km < 15) return 'bg-amber-950/80 text-amber-300 border-amber-700/60';
    return 'bg-slate-900/80 text-slate-300 border-slate-700/60';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="p-5 rounded-3xl bg-theme-surface border border-theme-subtle animate-pulse">
          <div className="h-4 w-48 bg-slate-800 rounded-lg mb-2" />
          <div className="h-3 w-80 bg-slate-800/60 rounded-lg" />
        </div>
        {/* Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-3xl bg-theme-surface border border-theme-subtle overflow-hidden">
              <div className="h-48 bg-slate-800 animate-pulse" />
              <div className="p-5 space-y-3 animate-pulse">
                <div className="h-4 w-3/4 bg-slate-800 rounded-lg" />
                <div className="h-3 w-full bg-slate-800/60 rounded-lg" />
                <div className="h-3 w-1/2 bg-slate-800/60 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-12 text-center rounded-3xl bg-theme-surface border border-dashed border-rose-800/40 space-y-3">
        <HotelIcon className="w-10 h-10 text-rose-400 mx-auto" />
        <h4 className="text-sm font-bold text-white">Failed to load nearby hotels</h4>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">{error}</p>
        <Button variant="secondary" size="sm" onClick={fetchNearby}>
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          Retry
        </Button>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="p-5 rounded-3xl bg-theme-surface border border-theme-subtle">
          <span className="text-[10px] font-mono uppercase tracking-widest font-extrabold text-violet-400">
            Location-Aware Hotels
          </span>
          <h3 className="text-xl font-bold text-white tracking-tight">
            Hotels Near Your Spots
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            We match hotels to the tourist spots in your itinerary using geo-proximity
          </p>
        </div>

        {/* Empty State */}
        <div className="text-center py-16 rounded-3xl border border-dashed border-theme-subtle bg-theme-surface p-6 space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-theme-surface-raised border border-theme-strong flex items-center justify-center">
              <Navigation className="w-7 h-7 text-violet-400" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-slate-900 border border-theme-subtle flex items-center justify-center">
              <MapPin className="w-3 h-3 text-blue-400" />
            </div>
          </div>
          <div className="space-y-1.5">
            <h4 className="text-sm font-bold text-slate-200">No tourist spots with coordinates yet</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Add landmarks and sights to your <strong>Day Planner</strong> with location coordinates, 
              and we&apos;ll automatically recommend hotels near those spots in {destination}.
            </p>
          </div>
          <div className="flex items-center justify-center gap-4 pt-2">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
              Powered by Haversine geo-matching
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-3xl bg-theme-surface border border-theme-subtle">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest font-extrabold text-violet-400">
              Location-Aware Hotels
            </span>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Hotels Near Your Spots
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {results.length} {results.length === 1 ? 'hotel' : 'hotels'} ranked by proximity to your {destination} itinerary spots
            </p>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={fetchNearby}
            className="shrink-0 gap-1.5 text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </Button>
        </div>

        {/* Proximity Legend */}
        <div className="flex items-center gap-3 pt-3 mt-3 border-t border-theme-subtle overflow-x-auto scrollbar-none">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0">
            Proximity:
          </span>
          <span className="flex items-center gap-1 text-[10px] text-emerald-400 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            &lt;2 km (Walking)
          </span>
          <span className="flex items-center gap-1 text-[10px] text-blue-400 shrink-0">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            2–5 km (Short Ride)
          </span>
          <span className="flex items-center gap-1 text-[10px] text-amber-400 shrink-0">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            5–15 km (Moderate)
          </span>
          <span className="flex items-center gap-1 text-[10px] text-slate-400 shrink-0">
            <span className="w-2 h-2 rounded-full bg-slate-500" />
            15+ km (Far)
          </span>
        </div>
      </div>

      {/* Hotels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((result, idx) => {
          const hotel = result.hotel;
          return (
            <div
              key={hotel.id}
              className="group flex flex-col rounded-3xl bg-theme-surface border border-theme-subtle overflow-hidden hover:border-violet-500/50 transition-all duration-200 hover:shadow-xl hover:shadow-violet-950/20"
            >
              {/* Hotel Photo Banner */}
              <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                <img
                  src={hotel.image_url}
                  alt={hotel.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80';
                  }}
                />

                {/* Ranking Badge */}
                {idx < 3 && (
                  <div className="absolute top-3 left-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-sm border ${
                      idx === 0
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : idx === 1
                        ? 'bg-slate-400/20 text-slate-200 border-slate-400/40'
                        : 'bg-orange-800/20 text-orange-300 border-orange-600/40'
                    }`}>
                      {idx === 0 ? '🥇 Closest' : idx === 1 ? '🥈 2nd' : '🥉 3rd'}
                    </span>
                  </div>
                )}

                {/* Rating Badge */}
                <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-950/80 text-white border border-slate-800 backdrop-blur-sm">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{hotel.rating}</span>
                  <span className="text-[10px] text-slate-400">({hotel.reviews_count})</span>
                </div>

                {/* Proximity Badge — the core visual differentiator */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border backdrop-blur-sm ${getDistanceBadgeStyle(result.distance_km)}`}>
                    <Navigation className="w-3 h-3" />
                    <span>{formatDistance(result.distance_km)}</span>
                    <span className="opacity-70">from</span>
                    <span className="max-w-[120px] truncate">{result.nearest_spot}</span>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  {/* Tier Badge */}
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-violet-950/60 text-violet-300 border border-violet-700/40 inline-block">
                    {hotel.tier}
                  </span>

                  <h4 className="text-base font-bold text-white tracking-tight group-hover:text-violet-300 transition-colors">
                    {hotel.name}
                  </h4>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {hotel.description}
                  </p>

                  {/* Location Context */}
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <MapPin className="w-3 h-3 text-violet-400 shrink-0" />
                    <span className="truncate">{hotel.neighborhood}</span>
                  </div>

                  {/* Amenities Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {hotel.amenities.slice(0, 3).map((amenity, aidx) => (
                      <span
                        key={aidx}
                        className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-theme-raised text-slate-300 border border-theme-subtle"
                      >
                        {amenity}
                      </span>
                    ))}
                    {hotel.amenities.length > 3 && (
                      <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold text-slate-500">
                        +{hotel.amenities.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer: Pricing & Action */}
                <div className="pt-3 border-t border-theme-subtle flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-mono">From</span>
                    <span className="text-base font-mono font-bold text-white">
                      ${hotel.price_per_night}
                    </span>
                    <span className="text-[10px] text-slate-400"> / night</span>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onSelectHotel(hotel)}
                    className="bg-violet-600 hover:bg-violet-500 text-white gap-1.5 text-xs font-bold"
                  >
                    <span>Reserve Room</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
