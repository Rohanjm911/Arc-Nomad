import React from 'react';
import { Star, MapPin, PlusCircle, Sparkles } from 'lucide-react';
import { Recommendation, ItineraryDay } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface RecommendationCardProps {
  recommendation: Recommendation;
  days: ItineraryDay[];
  onAddToDay: (rec: Recommendation, dayId: string) => void;
  onToggleSave?: (rec: Recommendation) => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  days,
  onAddToDay,
  onToggleSave,
}) => {
  const [selectedDayId, setSelectedDayId] = React.useState<string>(days[0]?.id || '');
  const [isAdding, setIsAdding] = React.useState(false);

  const handleAdd = async () => {
    if (!selectedDayId) return;
    setIsAdding(true);
    try {
      await onAddToDay(recommendation, selectedDayId);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="group rounded-2xl bg-slate-900 border border-slate-800 p-5 hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-950/20 transition-all flex flex-col justify-between">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5">
            <Badge variant="purple" size="sm">
              {recommendation.category}
            </Badge>
            <span className="text-xs font-bold text-slate-300 font-mono">
              {recommendation.price_level}
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            {recommendation.rating.toFixed(1)}
          </div>
        </div>

        {/* Name & Description */}
        <h4 className="text-base font-bold text-slate-100 group-hover:text-indigo-400 transition-colors">
          {recommendation.name}
        </h4>

        {recommendation.description && (
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            {recommendation.description}
          </p>
        )}

        {/* AI Reason Badge */}
        {recommendation.reason && (
          <div className="mt-3 p-2.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20 flex items-start gap-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-indigo-300 leading-snug">
              {recommendation.reason}
            </p>
          </div>
        )}

        {/* Address */}
        {recommendation.address && (
          <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-2.5">
            <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
            <span className="truncate">{recommendation.address}</span>
          </div>
        )}
      </div>

      {/* Footer: Day Selector + Add to Itinerary */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2">
        {days.length > 0 ? (
          <>
            <select
              value={selectedDayId}
              onChange={(e) => setSelectedDayId(e.target.value)}
              className="rounded-xl bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-xs font-semibold text-slate-200 focus:outline-none focus:border-indigo-500 flex-1 truncate"
            >
              {days.map((d) => (
                <option key={d.id} value={d.id}>
                  Add to Day {d.day_number}
                </option>
              ))}
            </select>

            <Button
              size="sm"
              variant="primary"
              onClick={handleAdd}
              loading={isAdding}
              className="text-xs gap-1 py-1.5 px-3 shrink-0"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Add
            </Button>
          </>
        ) : (
          <p className="text-[11px] text-slate-500 italic">No itinerary days created yet.</p>
        )}
      </div>
    </div>
  );
};
