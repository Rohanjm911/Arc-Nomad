'use client';

import React, { useState } from 'react';
import { Sparkles, Search, Compass } from 'lucide-react';
import { Recommendation, ItineraryDay, Trip } from '../../types';
import { recommendationService } from '../../services/recommendationService';
import { RecommendationCard } from './RecommendationCard';
import { ExploreDrawer } from './ExploreDrawer';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface RecommendationListProps {
  trip: Trip;
  recommendations: Recommendation[];
  days: ItineraryDay[];
  onRecommendationsUpdated: () => void;
}

export const RecommendationList: React.FC<RecommendationListProps> = ({
  trip,
  recommendations,
  days,
  onRecommendationsUpdated,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [exploreDrawerOpen, setExploreDrawerOpen] = useState(false);

  const categories = [
    'All',
    'Attractions',
    'Restaurants',
    'Cafes',
    'Nightlife',
    'Activities',
    'Hidden Gems',
  ];

  const filtered = recommendations.filter((rec) => {
    const matchesCategory =
      activeCategory === 'All' || rec.category.toLowerCase().includes(activeCategory.toLowerCase());
    const matchesSearch =
      searchQuery === '' ||
      rec.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.reason?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToDay = async (rec: Recommendation, dayId: string) => {
    try {
      await recommendationService.addToItinerary({
        recommendation_id: rec.id,
        day_id: dayId,
      });
      onRecommendationsUpdated();
      alert(`Added "${rec.name}" to your itinerary!`);
    } catch (err: any) {
      alert(err.message || 'Failed to add recommendation to day.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Curated Recommendations</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            AI handpicked sights, eateries, and local experiences for {trip.destination}
          </p>
        </div>

        <Button
          variant="ai"
          size="sm"
          onClick={() => setExploreDrawerOpen(true)}
          className="gap-1.5 self-start sm:self-auto shrink-0 font-bold"
        >
          <Sparkles className="w-4 h-4" />
          AI Explore More
        </Button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-thin scrollbar-thumb-slate-800 pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                activeCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="w-full md:w-64">
          <Input
            icon={<Search className="w-4 h-4 text-slate-500" />}
            placeholder="Search spots..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-slate-800 bg-slate-950 p-6 space-y-3">
          <Compass className="w-10 h-10 text-blue-400 mx-auto" />
          <h4 className="text-sm font-bold text-slate-200">No matching recommendations</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Use Gemini AI to discover tailored hidden gems, local spots, and unique sights.
          </p>
          <Button
            variant="ai"
            size="sm"
            onClick={() => setExploreDrawerOpen(true)}
            className="gap-1.5 text-xs font-bold"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Launch AI Discovery
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((rec) => (
            <RecommendationCard
              key={rec.id}
              recommendation={rec}
              days={days}
              onAddToDay={handleAddToDay}
            />
          ))}
        </div>
      )}

      {/* Explore Drawer Modal */}
      <ExploreDrawer
        isOpen={exploreDrawerOpen}
        onClose={() => setExploreDrawerOpen(false)}
        tripId={trip.id}
        destination={trip.destination}
        days={days}
        onRecommendationSaved={onRecommendationsUpdated}
      />
    </div>
  );
};
