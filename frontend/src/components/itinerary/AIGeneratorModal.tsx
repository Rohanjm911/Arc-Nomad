'use client';

import React, { useState } from 'react';
import { Sparkles, AlertCircle } from 'lucide-react';
import { Trip } from '../../types';
import { itineraryService } from '../../services/itineraryService';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

interface AIGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
  onItineraryGenerated: () => void;
}

export const AIGeneratorModal: React.FC<AIGeneratorModalProps> = ({
  isOpen,
  onClose,
  trip,
  onItineraryGenerated,
}) => {
  const [destination, setDestination] = useState(trip.destination);
  const [daysCount, setDaysCount] = useState<number>(3);
  const [travelStyle, setTravelStyle] = useState('Balanced');
  const [pace, setPace] = useState('Moderate');
  const [budgetTier, setBudgetTier] = useState('Moderate');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    'Culinary',
    'Sightseeing',
    'Culture',
  ]);
  const [customNotes, setCustomNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const interestOptions = [
    'Culinary',
    'Sightseeing',
    'Culture',
    'Photography',
    'Architecture',
    'Nightlife',
    'Nature & Outdoors',
    'Hidden Gems',
    'Art & Museums',
    'Shopping',
  ];

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await itineraryService.aiGenerateItinerary({
        trip_id: trip.id,
        destination,
        days_count: daysCount,
        travel_style: travelStyle,
        pace,
        budget_tier: budgetTier,
        interests: selectedInterests,
        custom_notes: customNotes || undefined,
      });

      onItineraryGenerated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to generate itinerary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AI Travel Architect"
      subtitle="AI suggests, you decide — customize your timetable parameters"
      maxWidth="lg"
    >
      <form onSubmit={handleGenerate} className="space-y-4">
        {/* Banner with solid violet accent */}
        <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-600/30 text-purple-200 text-xs flex items-center gap-2.5">
          <Sparkles className="w-5 h-5 text-purple-400 shrink-0" />
          <span>
            The AI Travel Architect will formulate structured daily agendas, geocoded stops, and approximate budgets tailored for <strong>{destination}</strong>.
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Destination Focus"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            required
          />

          <Select
            label="Duration to Architect"
            value={daysCount}
            onChange={(e) => setDaysCount(parseInt(e.target.value) || 3)}
          >
            {[1, 2, 3, 4, 5, 6, 7].map((d) => (
              <option key={d} value={d}>
                {d} {d === 1 ? 'Day' : 'Days'} Plan
              </option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select
            label="Travel Style"
            value={travelStyle}
            onChange={(e) => setTravelStyle(e.target.value)}
          >
            <option value="Balanced">Balanced</option>
            <option value="Adventure">Adventure & Outdoors</option>
            <option value="Cultural">Cultural & Historic</option>
            <option value="Luxury">Luxury & Comfort</option>
            <option value="Budget">Budget Backpacker</option>
          </Select>

          <Select
            label="Daily Pace"
            value={pace}
            onChange={(e) => setPace(e.target.value)}
          >
            <option value="Relaxed">Relaxed (3 items/day)</option>
            <option value="Moderate">Moderate (5 items/day)</option>
            <option value="Packed">Packed (Sprint)</option>
          </Select>

          <Select
            label="Budget Tier"
            value={budgetTier}
            onChange={(e) => setBudgetTier(e.target.value)}
          >
            <option value="Budget">$ Budget Friendly</option>
            <option value="Moderate">$$ Moderate</option>
            <option value="Luxury">$$$ High-End</option>
          </Select>
        </div>

        {/* Interests Pills (Solid state transitions) */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
            Interests & Highlights
          </label>
          <div className="flex flex-wrap gap-1.5">
            {interestOptions.map((interest) => {
              const isSelected = selectedInterests.includes(interest);
              return (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-purple-600 text-white border border-purple-500'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {interest}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            Special Instructions (Optional)
          </label>
          <textarea
            value={customNotes}
            onChange={(e) => setCustomNotes(e.target.value)}
            rows={2}
            placeholder="e.g. Include local breakfast cafes, scenic sunset viewpoints, and avoid high-traffic tour groups..."
            className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-950/50 border border-red-800/50 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <p className="text-[11px] text-slate-400">
            You can modify, move, or delete any generated stops after creation.
          </p>
          <div className="flex items-center gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="ai" size="sm" loading={loading} className="gap-1.5 font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              Generate Itinerary
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
