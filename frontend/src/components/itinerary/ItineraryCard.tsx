import React, { useState } from 'react';
import { Clock, MapPin, CheckCircle2, Circle, Trash2, Edit3, Compass, Utensils, Hotel, Mountain, Footprints, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ItineraryItem, ItineraryCategory } from '../../types';
import { Badge } from '../ui/Badge';
import { gamificationService } from '../../services/gamificationService';

interface ItineraryCardProps {
  item: ItineraryItem;
  canEdit: boolean;
  onToggleComplete?: (item: ItineraryItem) => void;
  onEdit?: (item: ItineraryItem) => void;
  onDelete?: (itemId: string) => void;
  onSelectLocation?: (lat: number, lng: number, title: string) => void;
}

export const ItineraryCard: React.FC<ItineraryCardProps> = ({
  item,
  canEdit,
  onToggleComplete,
  onEdit,
  onDelete,
  onSelectLocation,
}) => {
  const [showXpGain, setShowXpGain] = useState(false);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!item.is_completed) {
      // Trigger confetti celebration
      try {
        confetti({
          particleCount: 45,
          spread: 60,
          origin: {
            x: e.clientX / window.innerWidth,
            y: e.clientY / window.innerHeight,
          },
          colors: ['#38BDF8', '#10B981', '#F59E0B', '#6366F1'],
        });
      } catch (err) {
        // Fallback
      }

      // Record gamification XP
      gamificationService.recordActivityCompleted();
      setShowXpGain(true);
      setTimeout(() => setShowXpGain(false), 2000);
    }
    if (onToggleComplete) {
      onToggleComplete(item);
    }
  };
  const getCategoryIcon = (category: ItineraryCategory) => {
    switch (category) {
      case 'FOOD':
        return <Utensils className="w-3.5 h-3.5 text-amber-400" />;
      case 'HOTEL':
        return <Hotel className="w-3.5 h-3.5 text-purple-400" />;
      case 'ACTIVITY':
        return <Mountain className="w-3.5 h-3.5 text-emerald-400" />;
      case 'TRANSPORT':
        return <Footprints className="w-3.5 h-3.5 text-cyan-400" />;
      case 'SIGHTSEEING':
      default:
        return <Compass className="w-3.5 h-3.5 text-indigo-400" />;
    }
  };

  const getCategoryBadgeVariant = (category: ItineraryCategory) => {
    switch (category) {
      case 'FOOD':
        return 'warning';
      case 'HOTEL':
        return 'purple';
      case 'ACTIVITY':
        return 'success';
      case 'TRANSPORT':
        return 'info';
      case 'SIGHTSEEING':
      default:
        return 'primary';
    }
  };

  const hasCoords = item.latitude != null && item.longitude != null;

  return (
    <div
      className={`group rounded-2xl border transition-all duration-200 p-4 ${
        item.is_completed
          ? 'bg-theme-surface/50 border-theme-subtle opacity-75'
          : 'bg-theme-surface border-theme-subtle hover:border-theme-strong hover:bg-theme-surface-raised shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left: Checkbox & Info */}
        <div className="flex items-start gap-3 flex-1 relative">
          {canEdit && onToggleComplete && (
            <div className="relative">
              <button
                onClick={handleToggle}
                className="mt-0.5 text-slate-500 hover:text-theme-accent transition-colors focus:outline-none cursor-pointer"
                title={item.is_completed ? 'Mark as incomplete' : 'Mark as completed (+25 XP)'}
              >
                {item.is_completed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </button>
              {showXpGain && (
                <span className="absolute -top-6 -left-2 px-1.5 py-0.5 rounded bg-emerald-500 text-white font-mono text-[10px] font-extrabold animate-bounce shadow-lg z-20 whitespace-nowrap">
                  +25 XP 🎯
                </span>
              )}
            </div>
          )}

          <div className="flex-1">
            {/* Badges row: Category, Time, Cost */}
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <Badge variant={getCategoryBadgeVariant(item.category)} size="sm">
                {getCategoryIcon(item.category)}
                {item.category}
              </Badge>

              {(item.start_time || item.end_time) && (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 bg-theme-surface-raised border border-theme-subtle px-2 py-0.5 rounded-md">
                  <Clock className="w-3 h-3 text-slate-500" />
                  {item.start_time || ''} {item.end_time ? `– ${item.end_time}` : ''}
                </span>
              )}

              {item.estimated_cost > 0 && (
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/30 border border-emerald-800/30 px-2 py-0.5 rounded-md">
                  {item.currency} {Number(item.estimated_cost).toFixed(2)}
                </span>
              )}
            </div>

            {/* Title & Description */}
            <h4
              className={`text-sm font-bold text-white ${
                item.is_completed ? 'line-through text-slate-400' : ''
              }`}
            >
              {item.title}
            </h4>

            {item.description && (
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {item.description}
              </p>
            )}

            {/* Location Link */}
            {item.location_name && (
              <div className="flex items-center gap-1 text-xs text-cyan-400 mt-2 font-medium">
                <MapPin className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
                {hasCoords && onSelectLocation ? (
                  <button
                    onClick={() => onSelectLocation(item.latitude!, item.longitude!, item.title)}
                    className="hover:underline text-left cursor-pointer"
                    title="View on Map"
                  >
                    {item.location_name} {item.address ? `• ${item.address}` : ''}
                  </button>
                ) : (
                  <span>{item.location_name}</span>
                )}
              </div>
            )}

            {/* Pro Tip Note */}
            {item.notes && (
              <div className="mt-2.5 p-2.5 rounded-xl bg-theme-surface-raised border border-theme-subtle text-[11px] text-theme-secondary font-medium italic">
                Tip: {item.notes}
              </div>
            )}
          </div>
        </div>

        {/* Right Action Controls */}
        {canEdit && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <button
                onClick={() => onEdit(item)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-theme-surface-raised transition-colors cursor-pointer"
                title="Edit item"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(item.id)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
                title="Delete item"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
