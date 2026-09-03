import React from 'react';
import Link from 'next/link';
import { Plane, ArrowRight, Clock, AlertTriangle } from 'lucide-react';
import { Flight } from '../../types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface UpcomingFlightsWidgetProps {
  flights: Flight[];
}

export const UpcomingFlightsWidget: React.FC<UpcomingFlightsWidgetProps> = ({ flights }) => {
  if (!flights || flights.length === 0) {
    return null;
  }

  const statusVariantMap: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'neutral' | 'info'> = {
    SCHEDULED: 'info',
    BOARDING: 'warning',
    DEPARTED: 'primary',
    DELAYED: 'danger',
    CANCELLED: 'danger',
    LANDED: 'success',
  };

  return (
    <Card className="p-4 border-slate-800 bg-slate-900/90">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-600/20 text-indigo-400">
            <Plane className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
            Flight Status Monitor
          </h3>
        </div>
        <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live Tracking Active
        </span>
      </div>

      <div className="space-y-2.5">
        {flights.slice(0, 2).map((flight) => {
          const depTime = new Date(flight.departure_time);
          const isDelayed = flight.status === 'DELAYED';

          return (
            <Link
              key={flight.id}
              href={`/trips/${flight.trip_id}?tab=flights`}
              className="block p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-indigo-500/40 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-white">
                    {flight.airline} {flight.flight_number}
                  </span>
                  <Badge variant={statusVariantMap[flight.status] || 'neutral'} size="sm">
                    {flight.status}
                  </Badge>
                </div>
                <div className="text-right text-xs text-slate-300 font-semibold">
                  {depTime.toLocaleDateString([], { month: 'short', day: 'numeric' })},{' '}
                  {depTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              <div className="flex items-center justify-between mt-2 text-xs">
                <div className="flex items-center gap-2 font-mono font-bold text-slate-200">
                  <span>{flight.departure_airport}</span>
                  <span className="text-slate-500">→</span>
                  <span>{flight.arrival_airport}</span>
                </div>

                <div className="text-[11px] text-slate-400">
                  {flight.terminal ? `Term: ${flight.terminal} | ` : ''}
                  {flight.gate ? `Gate: ${flight.gate}` : ''}
                  {flight.seat ? ` | Seat: ${flight.seat}` : ''}
                </div>
              </div>

              {isDelayed && (
                <div className="mt-2 p-1.5 rounded-lg bg-rose-950/40 border border-rose-800/40 flex items-center gap-1.5 text-[11px] text-rose-300 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>Flight status is marked as delayed. Check gate monitors.</span>
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </Card>
  );
};
