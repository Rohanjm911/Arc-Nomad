'use client';

import React from 'react';
import Link from 'next/link';
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  ArrowRight,
  Shield,
  Clock,
  Compass,
  CheckCircle2,
  BookOpen,
  Map as MapIcon,
  Receipt,
} from 'lucide-react';
import { TripSummary } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface TripTimelineViewProps {
  trips: TripSummary[];
}

export const TripTimelineView: React.FC<TripTimelineViewProps> = ({ trips }) => {
  const now = new Date();

  // Sort trips chronologically
  const sortedTrips = [...trips].sort(
    (a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
  );

  return (
    <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2 sm:before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-theme-subtle">
      {sortedTrips.map((trip, idx) => {
        const startDate = new Date(trip.start_date);
        const endDate = new Date(trip.end_date);
        const daysUntil = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const isPast = endDate < now;
        const isActive = startDate <= now && endDate >= now;
        const durationDays = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);

        const statusVariant = isActive ? 'success' : isPast ? 'neutral' : 'info';
        const statusLabel = isActive ? 'Active Now' : isPast ? 'Completed' : daysUntil === 0 ? 'Departs Today' : `Departs in ${daysUntil}d`;

        return (
          <div key={trip.id} className="relative group">
            {/* Timeline node icon on left axis */}
            <div
              className={`absolute -left-[30px] sm:-left-[38px] top-4 w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold transition-transform group-hover:scale-110 z-10 ${
                isActive
                  ? 'bg-emerald-600 border-emerald-400 text-white ring-4 ring-emerald-950'
                  : isPast
                  ? 'bg-slate-800 border-slate-600 text-slate-400'
                  : 'bg-blue-600 border-blue-400 text-white ring-4 ring-blue-950'
              }`}
            >
              {idx + 1}
            </div>

            {/* Timeline Item Content Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-theme-surface border border-theme-subtle group-hover:border-theme-strong group-hover:bg-theme-surface-raised transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={statusVariant} size="sm">
                    {statusLabel}
                  </Badge>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-cyan-950 border border-cyan-800/40 text-cyan-300 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-cyan-400" />
                    {trip.destination}
                  </span>
                  <Badge variant="primary" size="sm">
                    <Shield className="w-3 h-3" />
                    {trip.user_role}
                  </Badge>
                </div>

                <Link href={`/trips/${trip.id}`}>
                  <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                    {trip.title}
                  </h3>
                </Link>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <Calendar className="w-3.5 h-3.5 text-blue-400" />
                    {startDate.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} –{' '}
                    {endDate.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    <span className="text-slate-500">({durationDays} days)</span>
                  </span>

                  <span className="flex items-center gap-1.5 text-slate-300">
                    <Users className="w-3.5 h-3.5 text-cyan-400" />
                    {trip.member_count} {trip.member_count === 1 ? 'Explorer' : 'Explorers'}
                  </span>

                  <span className="flex items-center gap-1 text-slate-300 font-semibold">
                    <span className="text-slate-500">Budget:</span>
                    <strong className="text-emerald-400 font-mono">
                      {trip.currency} {Number(trip.budget).toLocaleString()}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Quick Tab Jump Actions */}
              <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-theme-subtle">
                <Link href={`/trips/${trip.id}?tab=itinerary`}>
                  <button
                    type="button"
                    title="Open Itinerary"
                    className="p-2 rounded-xl bg-theme-surface-raised border border-theme-subtle hover:border-theme-strong text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                    <span className="hidden sm:inline">Itinerary</span>
                  </button>
                </Link>

                <Link href={`/trips/${trip.id}?tab=map`}>
                  <button
                    type="button"
                    title="Spatial Map"
                    className="p-2 rounded-xl bg-theme-surface-raised border border-theme-subtle hover:border-theme-strong text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                  >
                    <MapIcon className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="hidden sm:inline">Map</span>
                  </button>
                </Link>

                <Link href={`/trips/${trip.id}?tab=expenses`}>
                  <button
                    type="button"
                    title="Expense Ledger"
                    className="p-2 rounded-xl bg-theme-surface-raised border border-theme-subtle hover:border-theme-strong text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                  >
                    <Receipt className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="hidden sm:inline">Expenses</span>
                  </button>
                </Link>

                <Link href={`/trips/${trip.id}`}>
                  <Button variant="primary" size="sm" className="gap-1.5 font-bold text-xs">
                    Workspace
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
