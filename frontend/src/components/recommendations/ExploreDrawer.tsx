'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, AlertCircle, Bookmark, Compass, CheckCircle2 } from 'lucide-react';
import { Recommendation, ItineraryDay } from '../../types';
import { recommendationService } from '../../services/recommendationService';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { RecommendationCard } from './RecommendationCard';

interface ExploreDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: string;
  destination: string;
  days: ItineraryDay[];
  onRecommendationSaved: () => void;
}

const QUICK_CHIPS = [
  { label: '💎 Hidden Spots', category: 'Hidden Gems', vibe: 'secret alleyways, local artisan markets, hidden courtyards' },
  { label: '🍜 Local Food', category: 'Restaurants', vibe: 'authentic local street food, historic bistros, hidden taverns' },
  { label: '🍸 Rooftops & Speakeasies', category: 'Nightlife', vibe: 'secret speakeasies, skyline views, intimate listening lounges' },
  { label: '☕ Artisan Cafes', category: 'Cafes', vibe: 'specialty pour-over roasters, quiet garden cafes, matcha bakeries' },
  { label: '⛩️ Historic Landmarks', category: 'Attractions', vibe: 'sacred shrines, ancient castles, scenic heritage architecture' },
  { label: '🌿 Outdoor Adventures', category: 'Activities', vibe: 'panoramic bicycle trails, scenic coastal walks, nature lookouts' },
];

export const ExploreDrawer: React.FC<ExploreDrawerProps> = ({
  isOpen,
  onClose,
  tripId,
  destination,
  days,
  onRecommendationSaved,
}) => {
  const [category, setCategory] = useState('All');
  const [travelStyle, setTravelStyle] = useState('Balanced');
  const [customVibe, setCustomVibe] = useState('');
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingAll, setSavingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const triggerDiscovery = useCallback(
    async (overrideCategory?: string, overrideVibe?: string) => {
      setLoading(true);
      setError(null);

      const targetCategory = overrideCategory !== undefined ? overrideCategory : category;
      const targetVibe = overrideVibe !== undefined ? overrideVibe : customVibe;

      try {
        const interests = targetVibe.trim() ? [targetVibe.trim()] : [];
        const res = await recommendationService.exploreRecommendations({
          trip_id: tripId,
          destination,
          category: targetCategory !== 'All' ? targetCategory : undefined,
          travel_style: travelStyle,
          interests,
          limit: 6,
        });
        setRecommendations(res.recommendations);
      } catch (err: any) {
        setError(err.message || 'Failed to generate recommendations.');
      } finally {
        setLoading(false);
      }
    },
    [tripId, destination, category, travelStyle, customVibe]
  );

  // Auto-discover on open if recommendations are currently empty
  useEffect(() => {
    if (isOpen && recommendations.length === 0 && !loading) {
      triggerDiscovery('Hidden Gems', 'secret spots, quiet local gems');
    }
  }, [isOpen]);

  const handleExploreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerDiscovery();
  };

  const handleQuickChipClick = (chip: typeof QUICK_CHIPS[0]) => {
    setCategory(chip.category);
    setCustomVibe(chip.vibe);
    triggerDiscovery(chip.category, chip.vibe);
  };

  const handleToggleSave = async (rec: Recommendation) => {
    try {
      await recommendationService.saveRecommendation({
        trip_id: tripId,
        name: rec.name,
        category: rec.category,
        description: rec.description || undefined,
        rating: rec.rating,
        price_level: rec.price_level || undefined,
        address: rec.address || undefined,
        latitude: rec.latitude ?? undefined,
        longitude: rec.longitude ?? undefined,
        reason: rec.reason || undefined,
        tags: rec.tags || undefined,
      });

      onRecommendationSaved();
      showToast(`Saved "${rec.name}" to trip discoveries!`);
    } catch (err: any) {
      setError(err.message || 'Failed to save spot.');
    }
  };

  const handleAddToDay = async (rec: Recommendation, dayId: string) => {
    try {
      // First save recommendation record to trip
      const savedRec = await recommendationService.saveRecommendation({
        trip_id: tripId,
        name: rec.name,
        category: rec.category,
        description: rec.description || undefined,
        rating: rec.rating,
        price_level: rec.price_level || undefined,
        address: rec.address || undefined,
        latitude: rec.latitude ?? undefined,
        longitude: rec.longitude ?? undefined,
        reason: rec.reason || undefined,
        tags: rec.tags || undefined,
      });

      // Add to day
      await recommendationService.addToItinerary({
        recommendation_id: savedRec.id,
        day_id: dayId,
      });

      onRecommendationSaved();
      showToast(`Added "${rec.name}" to your itinerary!`);
    } catch (err: any) {
      setError(err.message || 'Failed to add item to day.');
    }
  };

  const handleSaveAll = async () => {
    if (recommendations.length === 0) return;
    setSavingAll(true);
    try {
      for (const rec of recommendations) {
        await recommendationService.saveRecommendation({
          trip_id: tripId,
          name: rec.name,
          category: rec.category,
          description: rec.description || undefined,
          rating: rec.rating,
          price_level: rec.price_level || undefined,
          address: rec.address || undefined,
          latitude: rec.latitude ?? undefined,
          longitude: rec.longitude ?? undefined,
          reason: rec.reason || undefined,
          tags: rec.tags || undefined,
        });
      }
      onRecommendationSaved();
      showToast(`Successfully saved all ${recommendations.length} spots to trip!`);
    } catch (err: any) {
      setError(err.message || 'Failed to save all spots.');
    } finally {
      setSavingAll(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AI Travel Discovery & Hidden Spots"
      subtitle={`Curated recommendations & secret sanctuaries for ${destination}`}
      maxWidth="3xl"
    >
      <div className="space-y-6">
        {/* Toast Notification Banner */}
        {toastMessage && (
          <div className="p-3 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between shadow-lg animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-semibold">{toastMessage}</span>
            </div>
          </div>
        )}

        {/* Quick Filter Chips */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Instant Vibe Filters
          </span>
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
            {QUICK_CHIPS.map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={() => handleQuickChipClick(chip)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                  category === chip.category
                    ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
                    : 'bg-theme-surface-raised border-theme-subtle text-slate-300 hover:border-slate-700 hover:text-white'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Discovery Search Form */}
        <form onSubmit={handleExploreSubmit} className="p-4 rounded-3xl bg-theme-surface border border-theme-subtle space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl bg-theme-surface-raised border border-theme-subtle px-3.5 py-2 text-xs font-semibold text-slate-100 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="All">All Categories</option>
                <option value="Hidden Gems">✦ Local Hidden Gems & Artisan Markets</option>
                <option value="Attractions">Iconic Attractions & Sights</option>
                <option value="Restaurants">Michelin & Authentic Food</option>
                <option value="Cafes">Artisan Cafes & Bakeries</option>
                <option value="Nightlife">Rooftops & Cocktail Speakeasies</option>
                <option value="Activities">Outdoor & Cultural Adventures</option>
                <option value="Hotels">Boutique Stays & Lodges</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Travel Persona Focus
              </label>
              <select
                value={travelStyle}
                onChange={(e) => setTravelStyle(e.target.value)}
                className="w-full rounded-xl bg-theme-surface-raised border border-theme-subtle px-3.5 py-2 text-xs font-semibold text-slate-100 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="Balanced">Balanced Highlights</option>
                <option value="Cultural">Art & Historic Focus</option>
                <option value="Culinary">Foodie & Gastronomy</option>
                <option value="Adventure">Active Outdoors</option>
                <option value="Luxury">Luxury & Fine Living</option>
                <option value="Budget">Budget & Street Culture</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Custom vibe (e.g. vinyl listening bars, lantern alleyways, specialty pour-overs)"
              value={customVibe}
              onChange={(e) => setCustomVibe(e.target.value)}
              className="bg-theme-surface-raised"
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={loading}
              className="shrink-0 gap-1.5 font-bold bg-blue-600 hover:bg-blue-500 text-white"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Discover
            </Button>
          </div>

          {error && (
            <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {error}
            </div>
          )}
        </form>

        {/* Results Grid Header */}
        <div>
          <div className="flex items-center justify-between gap-3 mb-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-blue-400" />
              AI Handpicked Discoveries ({recommendations.length})
            </h3>

            {recommendations.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveAll}
                loading={savingAll}
                className="text-xs gap-1 py-1 px-3 border-blue-500/40 text-blue-300 hover:bg-blue-950/30 font-bold"
              >
                <Bookmark className="w-3.5 h-3.5" />
                Save All to Trip
              </Button>
            )}
          </div>

          {recommendations.length === 0 ? (
            <div className="text-center py-12 rounded-3xl border border-dashed border-theme-subtle bg-theme-surface p-6 space-y-2">
              <Sparkles className="w-8 h-8 text-blue-400 mx-auto animate-pulse mb-1" />
              <p className="text-xs text-slate-300 font-bold">Discovering secret gems...</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Select a vibe chip above or click <strong>&quot;Discover&quot;</strong> to generate tailored hidden spots for {destination}.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[480px] overflow-y-auto pr-1 scrollbar-none">
              {recommendations.map((rec, idx) => (
                <RecommendationCard
                  key={idx}
                  recommendation={rec}
                  days={days}
                  onAddToDay={handleAddToDay}
                  onToggleSave={handleToggleSave}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
