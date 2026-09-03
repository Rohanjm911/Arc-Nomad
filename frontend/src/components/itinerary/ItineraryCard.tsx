import React from 'react';
import { Clock, MapPin, CheckCircle2, Circle, Trash2, Edit3, Compass, Utensils, Hotel, Mountain, Footprints } from 'lucide-react';
import { ItineraryItem, ItineraryCategory } from '../../types';
import { Badge } from '../ui/Badge';

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
          ? 'bg-slate-950/40 border-slate-800/50 opacity-75'
          : 'bg-slate-900/80 border-slate-800 hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-950/20'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left: Checkbox & Info */}
        <div className="flex items-start gap-3 flex-1">
          {canEdit && onToggleComplete && (
            <button
              onClick={() => onToggleComplete(item)}
              className="mt-0.5 text-slate-500 hover:text-indigo-400 transition-colors focus:outline-none"
              title={item.is_completed ? 'Mark as incomplete' : 'Mark as completed'}
            >
              {item.is_completed ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <Circle className="w-5 h-5" />
              )}
            </button>
          )}

          <div className="flex-1">
            {/* Badges row: Category, Time, Cost */}
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <Badge variant={getCategoryBadgeVariant(item.category)} size="sm">
                {getCategoryIcon(item.category)}
                {item.category}
              </Badge>

              {(item.start_time || item.end_time) && (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md">
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
              className={`text-sm font-bold text-slate-100 ${
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
                    className="hover:underline text-left"
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
              <div className="mt-2.5 p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-indigo-300 font-medium italic">
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
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
                title="Edit item"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(item.id)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
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
