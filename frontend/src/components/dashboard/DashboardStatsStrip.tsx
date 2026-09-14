'use client';

import React from 'react';
import { Compass, Calendar, DollarSign, Users, MapPin, Globe } from 'lucide-react';
import { TripSummary } from '../../types';

interface DashboardStatsStripProps {
  trips: TripSummary[];
  activeFilter: string;
  onFilterSelect: (filter: string) => void;
}

export const DashboardStatsStrip: React.FC<DashboardStatsStripProps> = ({
  trips,
  activeFilter,
  onFilterSelect,
}) => {
  const now = new Date();

  const activeTrips = trips.filter((t) => {
    const start = new Date(t.start_date);
    const end = new Date(t.end_date);
    return start <= now && end >= now;
  });

  const planningTrips = trips.filter((t) => t.status === 'PLANNING');

  // Unique destinations counted
  const uniqueDestinations = new Set(trips.map((t) => t.destination.trim().toLowerCase())).size;

  // Sum of tracked budgets
  const totalBudget = trips.reduce((acc, t) => acc + (Number(t.budget) || 0), 0);
  
  // Total travelers across expeditions
  const totalTravelers = trips.reduce((acc, t) => acc + (t.member_count || 1), 0);

  const stats = [
    {
      id: 'active',
      label: 'Active & Upcoming',
      value: activeTrips.length > 0 ? `${activeTrips.length} Active` : `${planningTrips.length} Planned`,
      subtitle: `${trips.length} total mapped`,
      icon: <Compass className="w-4 h-4 text-blue-400" />,
      filterTarget: activeTrips.length > 0 ? 'ACTIVE' : 'PLANNING',
      color: 'border-blue-500/30 hover:border-blue-500/60',
      badgeBg: 'bg-blue-950/60 text-blue-300',
    },
    {
      id: 'destinations',
      label: 'Destinations',
      value: `${uniqueDestinations} ${uniqueDestinations === 1 ? 'Locale' : 'Locales'}`,
      subtitle: 'Across your journeys',
      icon: <MapPin className="w-4 h-4 text-cyan-400" />,
      filterTarget: 'ALL',
      color: 'border-cyan-500/30 hover:border-cyan-500/60',
      badgeBg: 'bg-cyan-950/60 text-cyan-300',
    },
    {
      id: 'budget',
      label: 'Collective Budget',
      value: `$${totalBudget.toLocaleString()}`,
      subtitle: 'Tracked & monitored',
      icon: <DollarSign className="w-4 h-4 text-emerald-400" />,
      filterTarget: 'ALL',
      color: 'border-emerald-500/30 hover:border-emerald-500/60',
      badgeBg: 'bg-emerald-950/60 text-emerald-300',
    },
    {
      id: 'crew',
      label: 'Expedition Crew',
      value: `${totalTravelers} ${totalTravelers === 1 ? 'Traveler' : 'Travelers'}`,
      subtitle: 'Globetrotter collective',
      icon: <Users className="w-4 h-4 text-purple-400" />,
      filterTarget: 'ALL',
      color: 'border-purple-500/30 hover:border-purple-500/60',
      badgeBg: 'bg-purple-950/60 text-purple-300',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
      {stats.map((stat) => {
        const isSelected = activeFilter === stat.filterTarget && stat.filterTarget !== 'ALL';
        return (
          <button
            key={stat.id}
            type="button"
            onClick={() => onFilterSelect(stat.filterTarget)}
            className={`p-3.5 sm:p-4 rounded-2xl bg-theme-surface/90 border text-left transition-all duration-200 cursor-pointer group shadow-sm ${
              isSelected
                ? 'border-blue-500 bg-theme-surface-raised shadow-md ring-1 ring-blue-500/40'
                : `border-theme-subtle hover:bg-theme-surface-raised hover:border-theme-strong ${stat.color}`
            }`}
          >
            <div className="flex items-center justify-between mb-2.5">
              <div className="p-2 rounded-xl bg-theme-surface-raised/80 border border-theme-subtle group-hover:scale-105 transition-transform">
                {stat.icon}
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${stat.badgeBg}`}>
                {stat.label}
              </span>
            </div>
            <div className="space-y-0.5">
              <p className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                {stat.value}
              </p>
              <p className="text-xs text-slate-400 font-medium">{stat.subtitle}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
};
