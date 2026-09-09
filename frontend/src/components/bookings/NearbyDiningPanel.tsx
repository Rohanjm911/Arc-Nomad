'use client';

import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Star,
  ArrowRight,
  Navigation,
  UtensilsCrossed,
  RefreshCw,
  Sparkles,
  Flame,
  Clock
} from 'lucide-react';
import { RestaurantCatalogItem, NearbyRestaurantResult } from '../../types';
import { bookingService } from '../../services/bookingService';
import { Button } from '../ui/Button';

interface NearbyDiningPanelProps {
  tripId: string;
  destination: string;
  onSelectRestaurant: (restaurant: RestaurantCatalogItem) => void;
}

export const NearbyDiningPanel: React.FC<NearbyDiningPanelProps> = ({
  tripId,
  destination,
  onSelectRestaurant,
}) => {
  const [results, setResults] = useState<NearbyRestaurantResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNearby = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await bookingService.browseNearbyRestaurants(tripId);
      setResults(data);
    } catch (err: any) {
      console.error('Failed to fetch nearby restaurants:', err);
      setError(err.message || 'Failed to load nearby dining spots.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNearby();
  }, [tripId]);

  const formatDistance = (km: number): string => {
    if (km < 1) return `${Math.round(km * 1000)}m`;
    if (km < 10) return `${km.toFixed(1)} km`;
    return `${Math.round(km)} km`;
  };

  const getDistanceBadgeStyle = (km: number): string => {
    if (km < 2) return 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60';
    if (km < 5) return 'bg-cyan-950/80 text-cyan-300 border-cyan-700/60';
    if (km < 15) return 'bg-amber-950/80 text-amber-300 border-amber-700/60';
    return 'bg-slate-900/80 text-slate-300 border-slate-700/60';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="p-5 rounded-3xl bg-theme-surface border border-theme-subtle animate-pulse">
          <div className="h-4 w-48 bg-slate-800 rounded-lg mb-2" />
          <div className="h-3 w-80 bg-slate-800/60 rounded-lg" />
        </div>
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
        <UtensilsCrossed className="w-10 h-10 text-rose-400 mx-auto" />
        <h4 className="text-sm font-bold text-white">Failed to load nearby dining spots</h4>
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
        <div className="p-5 rounded-3xl bg-theme-surface border border-theme-subtle">
          <span className="text-[10px] font-mono uppercase tracking-widest font-extrabold text-cyan-400">
            Location-Aware Dining
          </span>
          <h3 className="text-xl font-bold text-white tracking-tight">
            Dining Spots Near Your Sights
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Auto-matched top eateries and culinary gems closest to your scheduled activities
          </p>
        </div>

        <div className="text-center py-16 rounded-3xl border border-dashed border-theme-subtle bg-theme-surface p-6 space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-theme-surface-raised border border-theme-strong flex items-center justify-center">
              <UtensilsCrossed className="w-7 h-7 text-cyan-400" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-slate-900 border border-theme-subtle flex items-center justify-center">
              <MapPin className="w-3 h-3 text-amber-400" />
            </div>
          </div>
          <div className="space-y-1.5">
            <h4 className="text-sm font-bold text-slate-200">No tourist spots with coordinates yet</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Add sights, museums, or landmarks to your <strong>Day Planner</strong> with location coordinates, 
              and we&apos;ll automatically recommend culinary spots within walking or short driving distance in {destination}.
            </p>
          </div>
          <div className="flex items-center justify-center gap-4 pt-2">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
              Powered by Haversine geo-proximity ranking
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
            <span className="text-[10px] font-mono uppercase tracking-widest font-extrabold text-cyan-400">
              Location-Aware Dining
            </span>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Dining Spots Near Your Sights
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Ranked by distance to the closest tourist spot in your itinerary
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">
              Found <strong className="text-cyan-400">{results.length}</strong> dining venues
            </span>
            <button
              onClick={fetchNearby}
              className="p-2 rounded-xl bg-theme-surface-raised border border-theme-subtle hover:border-theme-strong text-slate-400 hover:text-white transition-all cursor-pointer"
              title="Refresh nearby search"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map(({ restaurant: r, distance_km, nearest_spot }) => (
          <div
            key={r.id}
            className="group rounded-3xl bg-theme-surface border border-theme-subtle hover:border-cyan-500/50 transition-all duration-300 overflow-hidden flex flex-col shadow-lg hover:shadow-cyan-950/20"
          >
            {/* Image Banner */}
            <div className="relative h-48 w-full overflow-hidden bg-slate-900">
              <img
                src={r.image_url}
                alt={r.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Nearest Spot Pill */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border backdrop-blur-md shadow-lg ${getDistanceBadgeStyle(
                    distance_km
                  )}`}
                >
                  <Navigation className="w-3 h-3" />
                  <span>{formatDistance(distance_km)} away</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700/60 text-white text-[11px] font-bold">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span>{r.rating}</span>
                </div>
              </div>

              {/* Nearest spot label at bottom of image */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center gap-1.5 text-xs text-slate-200">
                <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="truncate">
                  Nearest spot: <strong className="text-white">{nearest_spot}</strong>
                </span>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-400 font-mono">
                      {r.cuisine} · {r.price_tier}
                    </span>
                    <h4 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors leading-snug">
                      {r.name}
                    </h4>
                  </div>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {r.description}
                </p>

                {/* Vibe & Signature Dish */}
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-theme-surface-raised border border-theme-subtle text-slate-300">
                    {r.vibe}
                  </span>
                  {r.signature_dishes && r.signature_dishes.length > 0 && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-950/30 border border-amber-800/40 text-amber-300 flex items-center gap-1">
                      <Flame className="w-2.5 h-2.5" />
                      {r.signature_dishes[0]}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Footer */}
              <div className="pt-3 border-t border-theme-subtle flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>{r.available_times ? r.available_times.length : 4} tables today</span>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onSelectRestaurant(r)}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold"
                >
                  <span>Reserve Table</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
