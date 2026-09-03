'use client';

import React, { useState } from 'react';
import { Plane, Clock, AlertTriangle, Play, Trash2 } from 'lucide-react';
import { Flight, FlightStatusType } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { SimulateStatusModal } from './SimulateStatusModal';

interface FlightBoardingPassProps {
  flight: Flight;
  canEdit: boolean;
  onFlightUpdated: () => void;
  onDeleteFlight?: (flightId: string) => void;
}

export const FlightBoardingPass: React.FC<FlightBoardingPassProps> = ({
  flight,
  canEdit,
  onFlightUpdated,
  onDeleteFlight,
}) => {
  const [simulateModalOpen, setSimulateModalOpen] = useState(false);

  const depTime = new Date(flight.departure_time);
  const arrTime = new Date(flight.arrival_time);

  const statusVariantMap: Record<FlightStatusType, 'primary' | 'success' | 'warning' | 'danger' | 'neutral' | 'info' | 'teal' | 'amber'> = {
    SCHEDULED: 'info',
    BOARDING: 'amber',
    DEPARTED: 'teal',
    DELAYED: 'danger',
    CANCELLED: 'danger',
    LANDED: 'success',
  };

  const isDelayed = flight.status === 'DELAYED';
  const isCancelled = flight.status === 'CANCELLED';

  return (
    <>
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-lg transition-colors hover:border-slate-700">
        {/* Top Header Strip (Solid Dark Surface, NO gradients) */}
        <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-950 border border-blue-600/30 flex items-center justify-center text-blue-400">
              <Plane className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white">{flight.airline}</span>
              <p className="text-[11px] font-mono text-blue-400 font-semibold">{flight.flight_number}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={statusVariantMap[flight.status] || 'neutral'} size="md">
              {flight.status}
            </Badge>

            {canEdit && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSimulateModalOpen(true)}
                className="text-xs gap-1 py-1 px-2.5 bg-slate-900 text-amber-300 border-amber-600/30 hover:bg-slate-800"
                title="Simulate Status Change"
              >
                <Play className="w-3 h-3 fill-amber-300" />
                Simulate
              </Button>
            )}

            {canEdit && onDeleteFlight && (
              <button
                onClick={() => onDeleteFlight(flight.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors cursor-pointer"
                title="Delete Flight"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Boarding Pass Main Body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Departure */}
          <div>
            <span className="text-3xl font-extrabold text-white font-mono tracking-tight">
              {flight.departure_airport}
            </span>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">
              {flight.departure_city || 'Origin'}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-slate-300 font-bold mt-2">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>
                {depTime.toLocaleDateString([], { month: 'short', day: 'numeric' })},{' '}
                {depTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          {/* Flight Path Center Indicator */}
          <div className="flex flex-col items-center justify-center py-2">
            <div className="flex items-center gap-2 w-full max-w-[180px]">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
              <div className="flex-1 border-t-2 border-dashed border-slate-700" />
              <Plane className="w-4 h-4 text-blue-400 shrink-0 rotate-90" />
              <div className="flex-1 border-t-2 border-dashed border-slate-700" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
            </div>
            <span className="text-[10px] text-slate-400 font-semibold mt-2 uppercase tracking-wider">
              {flight.status === 'LANDED' ? 'Arrived at Destination' : 'Direct Flight Route'}
            </span>
          </div>

          {/* Arrival */}
          <div className="md:text-right">
            <span className="text-3xl font-extrabold text-white font-mono tracking-tight">
              {flight.arrival_airport}
            </span>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">
              {flight.arrival_city || 'Destination'}
            </p>
            <div className="flex items-center md:justify-end gap-1.5 text-xs text-slate-300 font-bold mt-2">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>
                {arrTime.toLocaleDateString([], { month: 'short', day: 'numeric' })},{' '}
                {arrTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>

        {/* Boarding Pass Footer Details */}
        <div className="bg-slate-950/70 p-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Terminal</span>
              <span className="font-bold text-slate-200">{flight.terminal || 'TBD'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Gate</span>
              <span className="font-bold text-slate-200">{flight.gate || 'TBD'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Seat</span>
              <span className="font-bold text-teal-400 font-mono">{flight.seat || 'Unassigned'}</span>
            </div>
            {flight.booking_reference && (
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">PNR / Ref</span>
                <span className="font-bold text-white font-mono">{flight.booking_reference}</span>
              </div>
            )}
          </div>

          {isDelayed && (
            <div className="flex items-center gap-1.5 text-red-400 font-bold bg-red-950/40 border border-red-800/40 px-2.5 py-1 rounded-lg">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Flight Delayed • Check Airport Monitors</span>
            </div>
          )}
        </div>
      </div>

      {/* Simulator Modal */}
      {simulateModalOpen && (
        <SimulateStatusModal
          isOpen={simulateModalOpen}
          onClose={() => setSimulateModalOpen(false)}
          flight={flight}
          onStatusUpdated={() => {
            setSimulateModalOpen(false);
            onFlightUpdated();
          }}
        />
      )}
    </>
  );
};
