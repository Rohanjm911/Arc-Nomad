'use client';

import React, { useState } from 'react';
import { Sparkles, AlertCircle } from 'lucide-react';
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
  const [error, setError] = useState<string | null>(null);

  const handleExplore = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const interests = customVibe.trim() ? [customVibe.trim()] : [];
      const res = await recommendationService.exploreRecommendations({
        trip_id: tripId,
        destination,
        category: category !== 'All' ? category : undefined,
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
      alert(`Added "${rec.name}" to your itinerary!`);
    } catch (err: any) {
      alert(err.message || 'Failed to add item to day.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AI Travel Discovery & Hidden Spots"
      subtitle={`Curated recommendations for ${destination}`}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        <form onSubmit={handleExplore} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2 text-xs font-semibold text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="All">All Categories</option>
                <option value="Attractions">Iconic Attractions & Landmarks</option>
                <option value="Restaurants">Michelin & Authentic Restaurants</option>
                <option value="Cafes">Artisan Cafes & Bakeries</option>
                <option value="Nightlife">Rooftops & Cocktail Speakeasies</option>
                <option value="Activities">Outdoor & Cultural Adventures</option>
                <option value="Hidden Gems">Local Hidden Gems & Artisan Markets</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Travel Style Focus
              </label>
              <select
                value={travelStyle}
                onChange={(e) => setTravelStyle(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2 text-xs font-semibold text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="Balanced">Balanced</option>
                <option value="Cultural">Art & Historic</option>
                <option value="Culinary">Foodie Gastronomy</option>
                <option value="Adventure">Active Adventure</option>
                <option value="Luxury">Luxury & Fine Living</option>
                <option value="Budget">Budget & Street Culture</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Custom vibe (e.g. cozy record bars, lantern alleyways, specialty pour-overs)"
              value={customVibe}
              onChange={(e) => setCustomVibe(e.target.value)}
            />
            <Button type="submit" variant="ai" size="sm" loading={loading} className="shrink-0 gap-1.5 font-bold">
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

        {/* Results Grid */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            AI Handpicked Discoveries ({recommendations.length})
          </h3>

          {recommendations.length === 0 ? (
            <div className="text-center py-12 rounded-2xl border border-dashed border-slate-800 bg-slate-950/30">
              <Sparkles className="w-8 h-8 text-indigo-400 mx-auto animate-pulse mb-2" />
              <p className="text-xs text-slate-400">
                Click <strong>"Discover"</strong> to search for recommendations matching your exact vibe.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[450px] overflow-y-auto pr-1">
              {recommendations.map((rec, idx) => (
                <RecommendationCard
                  key={idx}
                  recommendation={rec}
                  days={days}
                  onAddToDay={handleAddToDay}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
