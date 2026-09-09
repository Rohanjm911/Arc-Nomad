'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  UtensilsCrossed,
  Star,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  Flame,
  Leaf
} from 'lucide-react';
import { RestaurantCatalogItem } from '../../types';
import { bookingService } from '../../services/bookingService';
import { Button } from '../ui/Button';

interface RestaurantBrowserProps {
  destination: string;
  onSelectRestaurant: (restaurant: RestaurantCatalogItem) => void;
}

const POPULAR_DESTINATIONS = ['Tokyo', 'Paris', 'Rome', 'New York', 'Swiss Alps', 'Reykjavik'];
const CUISINE_FILTERS = ['ALL', 'Japanese', 'French', 'Italian', 'American', 'Nordic'];

export const RestaurantBrowser: React.FC<RestaurantBrowserProps> = ({
  destination,
  onSelectRestaurant,
}) => {
  const [searchQuery, setSearchQuery] = useState(destination || '');
  const [restaurants, setRestaurants] = useState<RestaurantCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCuisine, setSelectedCuisine] = useState<string>('ALL');

  const fetchRestaurants = async (targetDest?: string) => {
    try {
      setLoading(true);
      const data = await bookingService.browseRestaurants(targetDest);
      setRestaurants(data);
    } catch (err) {
      console.error('Failed to fetch restaurants:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSearchQuery(destination || '');
    fetchRestaurants(destination);
  }, [destination]);

  const currentDisplayDestination = searchQuery.trim() || destination || 'Popular';

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRestaurants(searchQuery);
  };

  const handleQuickChip = (dest: string) => {
    setSearchQuery(dest);
    fetchRestaurants(dest);
  };

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((r) => {
      const matchesCuisine =
        selectedCuisine === 'ALL' ||
        r.cuisine.toLowerCase().includes(selectedCuisine.toLowerCase());
      const matchesQuery =
        searchQuery === '' ||
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.neighborhood.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.cuisine.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCuisine && matchesQuery;
    });
  }, [restaurants, selectedCuisine, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Search & Filter Header Bar */}
      <div className="p-5 rounded-3xl bg-theme-surface border border-theme-subtle space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest font-extrabold text-cyan-400">
              Fine Dining & Local Flavors
            </span>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Culinary Experiences & Table Reservations
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Explore Michelin-starred icons, rustic taverns, and farm-to-table bistros with verified seating slots
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-md w-full">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search cuisine, city, or restaurant..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-theme-raised border border-theme-subtle text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <Button type="submit" variant="primary" size="sm" className="bg-cyan-600 hover:bg-cyan-500 text-white shrink-0">
              Search
            </Button>
          </form>
        </div>

        {/* Quick Destination Chips */}
        <div className="flex items-center gap-2 pt-2 border-t border-theme-subtle overflow-x-auto scrollbar-none">
          <span className="text-[11px] font-bold text-slate-400 shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-400" /> Cities:
          </span>
          {POPULAR_DESTINATIONS.map((dest) => (
            <button
              key={dest}
              onClick={() => handleQuickChip(dest)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                searchQuery.toLowerCase() === dest.toLowerCase()
                  ? 'bg-cyan-600 text-white border border-cyan-400'
                  : 'bg-theme-raised text-slate-300 border border-theme-subtle hover:border-slate-700'
              }`}
            >
              {dest}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count & Cuisine Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <span className="text-xs font-semibold text-slate-400">
          Showing <span className="text-white font-bold">{filteredRestaurants.length}</span> curated dining venues
        </span>

        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {CUISINE_FILTERS.map((cuisine) => (
            <button
              key={cuisine}
              onClick={() => setSelectedCuisine(cuisine)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedCuisine === cuisine
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {cuisine}
            </button>
          ))}
        </div>
      </div>

      {/* Restaurants Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-96 rounded-3xl bg-theme-surface border border-theme-subtle" />
          ))}
        </div>
      ) : filteredRestaurants.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-theme-surface border border-dashed border-theme-subtle space-y-3">
          <UtensilsCrossed className="w-10 h-10 text-slate-500 mx-auto" />
          <h4 className="text-sm font-bold text-white">No dining venues found</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try searching for a different destination or clearing your cuisine filter.
          </p>
          <div className="flex items-center justify-center gap-2 pt-1">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSelectedCuisine('ALL');
                handleQuickChip(currentDisplayDestination);
              }}
            >
              Explore {currentDisplayDestination} Dining
            </Button>
            {currentDisplayDestination !== destination && destination && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedCuisine('ALL');
                  handleQuickChip(destination);
                }}
              >
                Reset to {destination}
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRestaurants.map((res) => (
            <div
              key={res.id}
              className="group flex flex-col rounded-3xl bg-theme-surface border border-theme-subtle overflow-hidden hover:border-cyan-500/50 transition-all duration-200 hover:shadow-xl"
            >
              {/* Photo Banner */}
              <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                <img
                  src={res.image_url}
                  alt={res.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1000&q=80';
                  }}
                />
                {/* Price Tier & Cuisine Badge */}
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-950/90 text-cyan-400 border border-cyan-900/60">
                    {res.price_tier}
                  </span>
                </div>

                {/* Rating Badge */}
                <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-950/90 text-white border border-slate-800">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{res.rating}</span>
                  <span className="text-[10px] text-slate-400">({res.reviews_count})</span>
                </div>

                {/* Bottom Photo Details (Solid Matte Chip, Strictly Zero Gradients) */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-200 bg-slate-950/90 px-2.5 py-1 rounded-lg border border-slate-800">
                    <MapPin className="w-3 h-3 text-cyan-400" />
                    {res.neighborhood}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  <div>
                    <span className="text-[11px] font-bold text-cyan-400 block">
                      {res.cuisine}
                    </span>
                    <h4 className="text-base font-bold text-white tracking-tight group-hover:text-cyan-300 transition-colors">
                      {res.name}
                    </h4>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {res.description}
                  </p>

                  {/* Vibe / Atmosphere */}
                  <div className="p-2.5 rounded-xl bg-theme-raised border border-theme-subtle text-[11px] text-slate-300 flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span className="italic leading-snug">{res.vibe}</span>
                  </div>

                  {/* Signature Dishes */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Flame className="w-3 h-3 text-amber-400" /> Signature Dishes:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {res.signature_dishes.slice(0, 2).map((dish, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-theme-raised text-slate-300 border border-theme-subtle"
                        >
                          {dish}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Dietary tags */}
                  {res.dietary_options && res.dietary_options.length > 0 && (
                    <div className="flex items-center gap-1 text-[10px] text-emerald-400">
                      <Leaf className="w-3 h-3 shrink-0" />
                      <span className="truncate">{res.dietary_options.join(' • ')}</span>
                    </div>
                  )}
                </div>

                {/* Time Slots Preview & Action */}
                <div className="pt-3 border-t border-theme-subtle space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      Next Available Slots:
                    </span>
                    <span className="text-[11px] font-mono text-cyan-300 font-semibold">
                      {res.available_times.slice(0, 3).join(', ')}
                    </span>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onSelectRestaurant(res)}
                    className="w-full bg-cyan-600 hover:bg-cyan-500 text-white gap-1.5 text-xs font-bold"
                  >
                    <span>Reserve Table</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
