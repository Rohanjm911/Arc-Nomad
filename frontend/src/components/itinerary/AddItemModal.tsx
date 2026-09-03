'use client';

import React, { useState, useEffect } from 'react';
import { ItineraryItem, ItineraryCategory } from '../../types';
import { itineraryService } from '../../services/itineraryService';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayId: string;
  tripCurrency: string;
  editItem?: ItineraryItem | null;
  onItemSaved: () => void;
}

export const AddItemModal: React.FC<AddItemModalProps> = ({
  isOpen,
  onClose,
  dayId,
  tripCurrency,
  editItem,
  onItemSaved,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('11:00');
  const [category, setCategory] = useState<ItineraryCategory>('SIGHTSEEING');
  const [estimatedCost, setEstimatedCost] = useState('0');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editItem) {
      setTitle(editItem.title);
      setDescription(editItem.description || '');
      setLocationName(editItem.location_name || '');
      setAddress(editItem.address || '');
      setLatitude(editItem.latitude?.toString() || '');
      setLongitude(editItem.longitude?.toString() || '');
      setStartTime(editItem.start_time || '09:00');
      setEndTime(editItem.end_time || '11:00');
      setCategory(editItem.category || 'SIGHTSEEING');
      setEstimatedCost(editItem.estimated_cost?.toString() || '0');
      setNotes(editItem.notes || '');
    } else {
      setTitle('');
      setDescription('');
      setLocationName('');
      setAddress('');
      setLatitude('');
      setLongitude('');
      setStartTime('09:00');
      setEndTime('11:00');
      setCategory('SIGHTSEEING');
      setEstimatedCost('0');
      setNotes('');
    }
    setError(null);
  }, [editItem, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const payload = {
        title,
        description: description || undefined,
        location_name: locationName || undefined,
        address: address || undefined,
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
        start_time: startTime || undefined,
        end_time: endTime || undefined,
        category,
        estimated_cost: parseFloat(estimatedCost) || 0,
        currency: tripCurrency,
        notes: notes || undefined,
      };

      if (editItem) {
        await itineraryService.updateItem(editItem.id, payload);
      } else {
        await itineraryService.createItem({
          day_id: dayId,
          ...payload,
        });
      }

      onItemSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save itinerary item.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editItem ? 'Edit Itinerary Item' : 'Add Itinerary Activity'}
      subtitle="Schedule a landmark, meal, tour, or experience"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Activity Title"
          placeholder="e.g. Senso-ji Temple & Morning Rituals"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Brief details or agenda for this activity..."
            className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ItineraryCategory)}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              <option value="SIGHTSEEING">Sightseeing</option>
              <option value="FOOD">Food & Dining</option>
              <option value="ACTIVITY">Activity / Adventure</option>
              <option value="TRANSPORT">Transport / Transit</option>
              <option value="HOTEL">Hotel / Stay</option>
              <option value="RELAXATION">Relaxation</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <Input
            label="Start Time"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />

          <Input
            label="End Time"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Location Name"
            placeholder="e.g. Senso-ji Temple"
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
          />

          <Input
            label="Street Address / Area"
            placeholder="e.g. Asakusa, Taito City"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label={`Est. Cost (${tripCurrency})`}
            type="number"
            step="0.01"
            value={estimatedCost}
            onChange={(e) => setEstimatedCost(e.target.value)}
          />

          <Input
            label="Latitude (Optional)"
            placeholder="35.6762"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
          />

          <Input
            label="Longitude (Optional)"
            placeholder="139.6503"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
          />
        </div>

        <Input
          label="Traveler Notes / Pro Tip"
          placeholder="e.g. Cash only, arrive early for photography"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" loading={loading}>
            {editItem ? 'Update Item' : 'Add to Day'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
