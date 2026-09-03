'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { Trip, TripStatus } from '../../types';
import { tripService } from '../../services/tripService';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { CurrencySelect } from '../ui/CurrencySelect';

interface TripSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
  onTripUpdated: (updated: Trip) => void;
}

export const TripSettingsModal: React.FC<TripSettingsModalProps> = ({
  isOpen,
  onClose,
  trip,
  onTripUpdated,
}) => {
  const router = useRouter();
  const [title, setTitle] = useState(trip.title);
  const [destination, setDestination] = useState(trip.destination);
  const [startDate, setStartDate] = useState(trip.start_date.split('T')[0]);
  const [endDate, setEndDate] = useState(trip.end_date.split('T')[0]);
  const [budget, setBudget] = useState(trip.budget.toString());
  const [currency, setCurrency] = useState(trip.currency);
  const [status, setStatus] = useState<TripStatus>(trip.status);
  const [coverImage, setCoverImage] = useState(trip.cover_image || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOwner = trip.user_role === 'OWNER';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const updated = await tripService.updateTrip(trip.id, {
        title,
        destination,
        start_date: startDate,
        end_date: endDate,
        budget: parseFloat(budget) || 0,
        currency,
        status,
        cover_image: coverImage || undefined,
      });
      onTripUpdated(updated);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update trip settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this entire trip and all associated itinerary items and expenses? This action cannot be undone.')) {
      return;
    }
    setLoading(true);
    try {
      await tripService.deleteTrip(trip.id);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to delete trip.');
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Trip Settings"
      subtitle="Update trip overview, budget baseline, dates and status"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-red-950/50 border border-red-800 text-xs text-red-200">
            {error}
          </div>
        )}

        <Input
          label="Trip Name"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <Input
          label="Destination"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          required
        />

        <div className="grid grid-cols-2 gap-3 items-start">
          <Input
            label="Total Budget"
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
          />
          <CurrencySelect
            label="Currency"
            value={currency}
            onChange={(val) => setCurrency(val)}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Trip Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as TripStatus)}
            className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
          >
            <option value="PLANNING">Planning (Drafting)</option>
            <option value="ACTIVE">Active (In Progress)</option>
            <option value="COMPLETED">Completed</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>

        <Input
          label="Cover Image URL (Optional)"
          value={coverImage}
          placeholder="https://images.unsplash.com/..."
          onChange={(e) => setCoverImage(e.target.value)}
        />

        {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}

        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          {isOwner ? (
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handleDelete}
              className="gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Trip
            </Button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={loading}>
              Save Changes
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
