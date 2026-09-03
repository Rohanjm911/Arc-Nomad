'use client';

import React, { useState } from 'react';
import { Play, Bell, AlertTriangle } from 'lucide-react';
import { Flight, FlightStatusType } from '../../types';
import { flightService } from '../../services/flightService';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface SimulateStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  flight: Flight;
  onStatusUpdated: () => void;
}

export const SimulateStatusModal: React.FC<SimulateStatusModalProps> = ({
  isOpen,
  onClose,
  flight,
  onStatusUpdated,
}) => {
  const [newStatus, setNewStatus] = useState<FlightStatusType>(flight.status);
  const [gate, setGate] = useState(flight.gate || '');
  const [terminal, setTerminal] = useState(flight.terminal || '');
  const [delayMinutes, setDelayMinutes] = useState('25');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await flightService.simulateStatus(flight.id, {
        new_status: newStatus,
        gate: gate || undefined,
        terminal: terminal || undefined,
        delay_minutes: newStatus === 'DELAYED' ? parseInt(delayMinutes) || 0 : undefined,
        message: message || undefined,
      });

      onStatusUpdated();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Simulation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Simulate Flight Status Event"
      subtitle={`Trigger background tracking event for ${flight.airline} ${flight.flight_number}`}
      maxWidth="md"
    >
      <form onSubmit={handleSimulate} className="space-y-4">
        <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-300 flex items-start gap-2">
          <Bell className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <p>
            Changing status simulates real-time airline API dispatch and immediately generates in-app notifications for all trip members.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            New Flight Status
          </label>
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value as FlightStatusType)}
            className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 font-semibold"
          >
            <option value="SCHEDULED">Scheduled</option>
            <option value="BOARDING">Boarding Open</option>
            <option value="DEPARTED">Departed (Airborne)</option>
            <option value="DELAYED">Delayed ⚠️</option>
            <option value="CANCELLED">Cancelled 🚨</option>
            <option value="LANDED">Landed / Arrived</option>
          </select>
        </div>

        {newStatus === 'DELAYED' && (
          <Input
            label="Delay Duration (Minutes)"
            type="number"
            value={delayMinutes}
            onChange={(e) => setDelayMinutes(e.target.value)}
            required
          />
        )}

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Gate Update"
            placeholder="e.g. C22"
            value={gate}
            onChange={(e) => setGate(e.target.value)}
          />
          <Input
            label="Terminal Update"
            placeholder="e.g. T2"
            value={terminal}
            onChange={(e) => setTerminal(e.target.value)}
          />
        </div>

        <Input
          label="Status Message / Reason (Optional)"
          placeholder="e.g. Inbound aircraft turnaround delay"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" loading={loading} className="gap-1.5">
            <Play className="w-3.5 h-3.5" />
            Trigger Simulation
          </Button>
        </div>
      </form>
    </Modal>
  );
};
