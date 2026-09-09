'use client';

import React, { useState, useEffect } from 'react';
import { Star, MapPin, PlusCircle, Sparkles, Bookmark, BookmarkCheck, Trash2, Check } from 'lucide-react';
import { Recommendation, ItineraryDay } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface RecommendationCardProps {
  recommendation: Recommendation;
  days: ItineraryDay[];
  onAddToDay: (rec: Recommendation, dayId: string) => Promise<void> | void;
  onToggleSave?: (rec: Recommendation) => Promise<void> | void;
  onDelete?: (recId: string) => Promise<void> | void;
  isSavedInTrip?: boolean;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  days,
  onAddToDay,
  onToggleSave,
  onDelete,
  isSavedInTrip = false,
}) => {
  const [selectedDayId, setSelectedDayId] = useState<string>(days[0]?.id || '');
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(isSavedInTrip || recommendation.is_saved);

  // Sync selectedDayId when days array loads or changes
  useEffect(() => {
    if (days.length > 0) {
      if (!selectedDayId || !days.some((d) => d.id === selectedDayId)) {
        setSelectedDayId(days[0].id);
      }
    }
  }, [days, selectedDayId]);

  useEffect(() => {
    setSavedSuccess(isSavedInTrip || recommendation.is_saved);
  }, [isSavedInTrip, recommendation.is_saved]);

  const handleAdd = async () => {
    // If selectedDayId is still empty but days has items, fallback to days[0].id
    const targetDayId = selectedDayId || days[0]?.id;
    if (!targetDayId) return;

    setIsAdding(true);
    try {
      await onAddToDay(recommendation, targetDayId);
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 2500);
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleSave = async () => {
    if (!onToggleSave) return;
    setIsSaving(true);
    try {
      await onToggleSave(recommendation);
      setSavedSuccess(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete || !recommendation.id) return;
    setIsDeleting(true);
    try {
      await onDelete(recommendation.id);
    } finally {
      setIsDeleting(false);
    }
  };

  const isHiddenGem = recommendation.category?.toLowerCase().includes('hidden') ||
    recommendation.tags?.some((t) => t.toLowerCase().includes('hidden') || t.toLowerCase().includes('gem'));

  return (
    <div className="group rounded-3xl bg-theme-surface border border-theme-subtle p-5 hover:border-theme-strong hover:shadow-xl transition-all flex flex-col justify-between relative">
      <div>
        {/* Top Badges & Actions */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold uppercase tracking-wider border ${
                isHiddenGem
                  ? 'bg-cyan-950/80 border-cyan-700/60 text-cyan-300'
                  : 'bg-blue-950/80 border-blue-800/60 text-blue-300'
              }`}
            >
              {recommendation.category}
            </span>

            {isHiddenGem && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono">
                ✦ HIDDEN SPOT
              </span>
            )}

            {recommendation.price_level && (
              <span className="text-xs font-bold text-slate-300 font-mono px-1.5 py-0.5 rounded bg-theme-surface-raised border border-theme-subtle">
                {recommendation.price_level}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              {Number(recommendation.rating || 4.8).toFixed(1)}
            </div>

            {/* Save / Bookmark Button */}
            {onToggleSave && (
              <button
                type="button"
                onClick={handleToggleSave}
                disabled={isSaving}
                title={savedSuccess ? 'Saved to Trip Discoveries' : 'Save Spot to Trip'}
                className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                  savedSuccess
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-theme-surface-raised border-theme-subtle text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                {savedSuccess ? (
                  <BookmarkCheck className="w-4 h-4" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
              </button>
            )}

            {/* Remove / Delete Button (for saved items) */}
            {onDelete && recommendation.id && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                title="Remove spot from trip"
                className="p-1.5 rounded-xl bg-theme-surface-raised border border-theme-subtle text-slate-500 hover:text-rose-400 hover:border-rose-800/50 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Name & Description */}
        <h4 className="text-base font-bold text-slate-100 group-hover:text-blue-400 transition-colors leading-snug">
          {recommendation.name}
        </h4>

        {recommendation.description && (
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            {recommendation.description}
          </p>
        )}

        {/* AI Reason Badge */}
        {recommendation.reason && (
          <div className="mt-3 p-2.5 rounded-xl bg-theme-surface-raised border border-blue-500/20 flex items-start gap-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-blue-200 leading-snug">
              {recommendation.reason}
            </p>
          </div>
        )}

        {/* Address & Coordinates */}
        {recommendation.address && (
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-2.5">
            <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate">{recommendation.address}</span>
          </div>
        )}
      </div>

      {/* Footer: Add to Itinerary Day or Save Spot */}
      <div className="mt-4 pt-3 border-t border-theme-subtle flex items-center gap-2">
        {days.length > 0 ? (
          <>
            <select
              value={selectedDayId}
              onChange={(e) => setSelectedDayId(e.target.value)}
              className="rounded-xl bg-theme-surface-raised border border-theme-subtle px-2.5 py-1.5 text-xs font-semibold text-slate-200 focus:outline-none focus:border-blue-500 flex-1 truncate cursor-pointer"
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
              className={`text-xs gap-1 py-1.5 px-3.5 shrink-0 font-bold transition-all ${
                addedSuccess ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              {addedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Added!
                </>
              ) : (
                <>
                  <PlusCircle className="w-3.5 h-3.5" />
                  Add
                </>
              )}
            </Button>
          </>
        ) : (
          <div className="w-full flex items-center justify-between gap-2">
            <p className="text-[11px] text-slate-500 italic">No itinerary days yet.</p>
            {onToggleSave && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleToggleSave}
                loading={isSaving}
                className="text-xs gap-1 py-1 px-3 border-blue-500/40 text-blue-300 hover:bg-blue-950/30"
              >
                <Bookmark className="w-3 h-3" />
                {savedSuccess ? 'Saved in Trip' : 'Save to Trip'}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
