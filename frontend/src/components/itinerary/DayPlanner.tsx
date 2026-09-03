'use client';

import React, { useState } from 'react';
import { Plus, Sparkles, PlusCircle, Compass } from 'lucide-react';
import { Trip, ItineraryDay, ItineraryItem } from '../../types';
import { itineraryService } from '../../services/itineraryService';
import { ItineraryCard } from './ItineraryCard';
import { AddItemModal } from './AddItemModal';
import { AIGeneratorModal } from './AIGeneratorModal';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface DayPlannerProps {
  trip: Trip;
  days: ItineraryDay[];
  onDaysUpdated: () => void;
  onSelectLocation?: (lat: number, lng: number, title: string) => void;
  onOpenAIGenerator?: () => void;
}

export const DayPlanner: React.FC<DayPlannerProps> = ({
  trip,
  days,
  onDaysUpdated,
  onSelectLocation,
}) => {
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [addItemModalOpen, setAddItemModalOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ItineraryItem | null>(null);

  const canEdit = trip.user_role === 'OWNER' || trip.user_role === 'EDITOR';
  const activeDay = days[activeDayIndex] || days[0];

  const handleCreateNewDay = async () => {
    try {
      const nextDayNum = days.length + 1;
      await itineraryService.createDay(trip.id, {
        day_number: nextDayNum,
        notes: `Day ${nextDayNum} explorations in ${trip.destination}`,
      });
      onDaysUpdated();
      setActiveDayIndex(days.length);
    } catch (err) {
      console.error('Failed to create day:', err);
    }
  };

  const handleToggleComplete = async (item: ItineraryItem) => {
    try {
      await itineraryService.updateItem(item.id, {
        is_completed: !item.is_completed,
      });
      onDaysUpdated();
    } catch (err) {
      console.error('Failed to toggle completion:', err);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this activity?')) return;
    try {
      await itineraryService.deleteItem(itemId);
      onDaysUpdated();
    } catch (err) {
      console.error('Failed to delete item:', err);
    }
  };

  const handleEditItem = (item: ItineraryItem) => {
    setEditingItem(item);
    setAddItemModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Day Selector Tabs Bar (Solid Blue active state, clear borders) */}
      <div className="flex items-center justify-between gap-4 pb-2 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-800">
        <div className="flex items-center gap-2">
          {days.map((day, idx) => {
            const isActive = idx === activeDayIndex;
            const itemsCount = day.items?.length || 0;

            return (
              <button
                key={day.id || idx}
                onClick={() => setActiveDayIndex(idx)}
                className={`flex flex-col items-center justify-center px-4 py-2.5 rounded-xl border transition-colors cursor-pointer min-w-[90px] ${
                  isActive
                    ? 'bg-blue-600 text-white border-blue-500'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span className="text-xs font-bold uppercase tracking-wider">
                  Day {day.day_number}
                </span>
                <span className="text-[10px] opacity-80 mt-0.5">
                  {itemsCount} {itemsCount === 1 ? 'spot' : 'spots'}
                </span>
              </button>
            );
          })}

          {canEdit && (
            <button
              onClick={handleCreateNewDay}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-dashed border-slate-700 text-slate-400 hover:text-white hover:border-blue-500 hover:bg-slate-800 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Day
            </button>
          )}
        </div>

        {/* AI Generator Trigger */}
        {canEdit && (
          <Button
            variant="ai"
            size="sm"
            onClick={() => setAiModalOpen(true)}
            className="gap-1.5 text-xs shrink-0 font-bold"
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Itinerary Architect
          </Button>
        )}
      </div>

      {/* Active Day Header Card */}
      {activeDay && (
        <Card className="p-4 border-slate-800 bg-slate-900">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Day {activeDay.day_number} Schedule
                </h3>
                {activeDay.date && (
                  <span className="text-xs text-slate-400 font-medium">
                    ({new Date(activeDay.date).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })})
                  </span>
                )}
              </div>
              {activeDay.notes && (
                <p className="text-xs text-slate-300 mt-1 italic leading-relaxed">
                  {activeDay.notes}
                </p>
              )}
            </div>

            {canEdit && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setEditingItem(null);
                  setAddItemModalOpen(true);
                }}
                className="gap-1.5 shrink-0 text-xs font-bold"
              >
                <PlusCircle className="w-4 h-4" />
                Add Activity
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Itinerary Items List */}
      {activeDay && (!activeDay.items || activeDay.items.length === 0) ? (
        <div className="text-center py-12 rounded-2xl border border-dashed border-slate-800 bg-slate-950 p-6 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-950 border border-blue-600/30 flex items-center justify-center mx-auto text-blue-400">
            <Compass className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-200">No activities scheduled for Day {activeDay.day_number}</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Add landmarks, restaurants, or experiences manually, or generate a structured plan with the AI Architect.
          </p>
          {canEdit && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setEditingItem(null);
                  setAddItemModalOpen(true);
                }}
                className="gap-1.5 text-xs font-bold"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Add First Stop
              </Button>
              <Button
                variant="ai"
                size="sm"
                onClick={() => setAiModalOpen(true)}
                className="gap-1.5 text-xs font-bold"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Generate with AI
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {activeDay?.items?.map((item) => (
            <ItineraryCard
              key={item.id}
              item={item}
              canEdit={canEdit}
              onToggleComplete={() => handleToggleComplete(item)}
              onEdit={() => handleEditItem(item)}
              onDelete={() => handleDeleteItem(item.id)}
              onSelectLocation={onSelectLocation}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Activity Modal */}
      {addItemModalOpen && activeDay && (
        <AddItemModal
          isOpen={addItemModalOpen}
          onClose={() => {
            setAddItemModalOpen(false);
            setEditingItem(null);
          }}
          dayId={activeDay.id}
          tripCurrency={trip.currency}
          editItem={editingItem}
          onItemSaved={() => {
            setAddItemModalOpen(false);
            setEditingItem(null);
            onDaysUpdated();
          }}
        />
      )}

      {/* AI Generator Modal */}
      {aiModalOpen && (
        <AIGeneratorModal
          isOpen={aiModalOpen}
          onClose={() => setAiModalOpen(false)}
          trip={trip}
          onItineraryGenerated={onDaysUpdated}
        />
      )}
    </div>
  );
};
