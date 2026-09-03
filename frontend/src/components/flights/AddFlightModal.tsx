'use client';

import React, { useState } from 'react';
import { Plane, AlertCircle } from 'lucide-react';
import { flightService } from '../../services/flightService';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface AddFlightModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: string;
  onFlightAdded: () => void;
}

export const AddFlightModal: React.FC<AddFlightModalProps> = ({
  isOpen,
  onClose,
  tripId,
  onFlightAdded,
}) => {
  const [airline, setAirline] = useState('');
  const [flightNumber, setFlightNumber] = useState('');
  const [depAirport, setDepAirport] = useState('');
  const [arrAirport, setArrAirport] = useState('');
  const [depCity, setDepCity] = useState('');
  const [arrCity, setArrCity] = useState('');
  const [depTime, setDepTime] = useState('');
  const [arrTime, setArrTime] = useState('');
  const [terminal, setTerminal] = useState('');
  const [gate, setGate] = useState('');
  const [seat, setSeat] = useState('');
  const [bookingRef, setBookingRef] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!airline || !flightNumber || !depAirport || !arrAirport || !depTime || !arrTime) {
      setError('Please fill in all mandatory flight fields.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await flightService.createFlight({
        trip_id: tripId,
        airline,
        flight_number: flightNumber,
        departure_airport: depAirport,
        arrival_airport: arrAirport,
        departure_city: depCity || undefined,
        arrival_city: arrCity || undefined,
        departure_time: new Date(depTime).toISOString(),
        arrival_time: new Date(arrTime).toISOString(),
        terminal: terminal || undefined,
        gate: gate || undefined,
        seat: seat || undefined,
        booking_reference: bookingRef || undefined,
        notes: notes || undefined,
      });

      onFlightAdded();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add flight.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Flight to Itinerary"
      subtitle="Track live boarding times, gate updates, and monitoring alerts"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Airline"
            placeholder="e.g. All Nippon Airways / Delta"
            value={airline}
            onChange={(e) => setAirline(e.target.value)}
            required
          />
          <Input
            label="Flight Number"
            placeholder="e.g. NH11 / DL274"
            value={flightNumber}
            onChange={(e) => setFlightNumber(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Departure Airport (IATA)"
            placeholder="e.g. ORD / JFK"
            maxLength={4}
            value={depAirport}
            onChange={(e) => setDepAirport(e.target.value.toUpperCase())}
            required
          />
          <Input
            label="Arrival Airport (IATA)"
            placeholder="e.g. HND / NRT"
            maxLength={4}
            value={arrAirport}
            onChange={(e) => setArrAirport(e.target.value.toUpperCase())}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Departure City"
            placeholder="e.g. Chicago"
            value={depCity}
            onChange={(e) => setDepCity(e.target.value)}
          />
          <Input
            label="Arrival City"
            placeholder="e.g. Tokyo"
            value={arrCity}
            onChange={(e) => setArrCity(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Departure Date & Time"
            type="datetime-local"
            value={depTime}
            onChange={(e) => setDepTime(e.target.value)}
            required
          />
          <Input
            label="Arrival Date & Time"
            type="datetime-local"
            value={arrTime}
            onChange={(e) => setArrTime(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Input
            label="Terminal"
            placeholder="T3"
            value={terminal}
            onChange={(e) => setTerminal(e.target.value)}
          />
          <Input
            label="Gate"
            placeholder="B14"
            value={gate}
            onChange={(e) => setGate(e.target.value)}
          />
          <Input
            label="Seat"
            placeholder="12A"
            value={seat}
            onChange={(e) => setSeat(e.target.value)}
          />
        </div>

        <Input
          label="Booking Reference / PNR"
          placeholder="e.g. NH-8829104"
          value={bookingRef}
          onChange={(e) => setBookingRef(e.target.value)}
        />

        {error && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" loading={loading}>
            Save Flight
          </Button>
        </div>
      </form>
    </Modal>
  );
};
