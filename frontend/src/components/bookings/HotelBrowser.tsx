'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Hotel as HotelIcon,
  Star,
  MapPin,
  Wifi,
  Sparkles,
  ArrowRight,
  Filter,
  DollarSign
} from 'lucide-react';
import { HotelCatalogItem } from '../../types';
import { bookingService } from '../../services/bookingService';
import { Button } from '../ui/Button';

interface HotelBrowserProps {
  destination: string;
  onSelectHotel: (hotel: HotelCatalogItem) => void;
}

const POPULAR_DESTINATIONS = ['Tokyo', 'Paris', 'Rome', 'New York', 'Swiss Alps', 'Reykjavik'];

export const HotelBrowser: React.FC<HotelBrowserProps> = ({
  destination,
  onSelectHotel,
}) => {
  const [searchQuery, setSearchQuery] = useState(destination || '');
  const [hotels, setHotels] = useState<HotelCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState<string>('ALL');
  const [maxPrice, setMaxPrice] = useState<number>(1500);

  const fetchHotels = async (targetDest?: string) => {
    try {
      setLoading(true);
      const data = await bookingService.browseHotels(targetDest);
      setHotels(data);
    } catch (err) {
      console.error('Failed to fetch hotels:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSearchQuery(destination || '');
    fetchHotels(destination);
  }, [destination]);

  const currentDisplayDestination = searchQuery.trim() || destination || 'Popular';

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchHotels(searchQuery);
  };

  const handleQuickChip = (dest: string) => {
    setSearchQuery(dest);
    fetchHotels(dest);
  };

  const filteredHotels = useMemo(() => {
    return hotels.filter((h) => {
      const matchesTier = selectedTier === 'ALL' || h.tier.toLowerCase().includes(selectedTier.toLowerCase());
      const matchesPrice = h.price_per_night <= maxPrice;
      const matchesQuery = searchQuery === '' || 
        h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.neighborhood.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTier && matchesPrice && matchesQuery;
    });
  }, [hotels, selectedTier, maxPrice, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Search & Filter Header Bar */}
      <div className="p-5 rounded-3xl bg-theme-surface border border-theme-subtle space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest font-extrabold text-blue-400">
              Curated Accommodations
            </span>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Stays & Architectural Sanctuaries
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Verified boutique hotels, alpine retreats, and luxury stays with instant room reservation
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-md w-full">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search destination (e.g. Tokyo, Paris)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-theme-raised border border-theme-subtle text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <Button type="submit" variant="primary" size="sm" className="bg-blue-600 hover:bg-blue-500 shrink-0">
              Search
            </Button>
          </form>
        </div>

        {/* Quick Destination Chips */}
        <div className="flex items-center gap-2 pt-2 border-t border-theme-subtle overflow-x-auto scrollbar-none">
          <span className="text-[11px] font-bold text-slate-400 shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-blue-400" /> Popular:
          </span>
          {POPULAR_DESTINATIONS.map((dest) => (
            <button
              key={dest}
              onClick={() => handleQuickChip(dest)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                searchQuery.toLowerCase() === dest.toLowerCase()
                  ? 'bg-blue-600 text-white border border-blue-400'
                  : 'bg-theme-raised text-slate-300 border border-theme-subtle hover:border-slate-700'
              }`}
            >
              {dest}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count & Tier Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <span className="text-xs font-semibold text-slate-400">
          Showing <span className="text-white font-bold">{filteredHotels.length}</span> verified stays
        </span>

        <div className="flex items-center gap-2">
          {['ALL', 'Luxury', 'Boutique', 'Modern'].map((tier) => (
            <button
              key={tier}
              onClick={() => setSelectedTier(tier)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                selectedTier === tier
                  ? 'bg-blue-950 text-blue-300 border border-blue-800'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tier}
            </button>
          ))}
        </div>
      </div>

      {/* Hotels Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-96 rounded-3xl bg-theme-surface border border-theme-subtle" />
          ))}
        </div>
      ) : filteredHotels.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-theme-surface border border-dashed border-theme-subtle space-y-3">
          <HotelIcon className="w-10 h-10 text-slate-500 mx-auto" />
          <h4 className="text-sm font-bold text-white">No accommodations found</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try searching for a different destination or adjusting your price filters.
          </p>
          <div className="flex items-center justify-center gap-2 pt-1">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSelectedTier('ALL');
                setMaxPrice(1500);
                handleQuickChip(currentDisplayDestination);
              }}
            >
              Explore {currentDisplayDestination} Stays
            </Button>
            {currentDisplayDestination !== destination && destination && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedTier('ALL');
                  setMaxPrice(1500);
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
          {filteredHotels.map((hotel) => (
            <div
              key={hotel.id}
              className="group flex flex-col rounded-3xl bg-theme-surface border border-theme-subtle overflow-hidden hover:border-blue-500/50 transition-all duration-200 hover:shadow-xl"
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
                {/* Tier Badge */}
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-950/90 text-blue-400 border border-blue-900/60">
                    {hotel.tier}
                  </span>
                </div>

                {/* Rating Badge */}
                <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-950/90 text-white border border-slate-800">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{hotel.rating}</span>
                  <span className="text-[10px] text-slate-400">({hotel.reviews_count})</span>
                </div>

                {/* Bottom Photo Details (Solid Matte Chip, Strictly Zero Gradients) */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-200 bg-slate-950/90 px-2.5 py-1 rounded-lg border border-slate-800">
                    <MapPin className="w-3 h-3 text-blue-400" />
                    {hotel.neighborhood}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h4 className="text-base font-bold text-white tracking-tight group-hover:text-blue-300 transition-colors">
                    {hotel.name}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {hotel.description}
                  </p>

                  {/* Amenities Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {hotel.amenities.slice(0, 3).map((amenity, idx) => (
                      <span
                        key={idx}
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

                {/* Room Pricing & Action */}
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
                    className="bg-blue-600 hover:bg-blue-500 text-white gap-1.5 text-xs font-bold"
                  >
                    <span>Reserve Room</span>
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
