'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Compass,
  PlusCircle,
  Calendar,
  MapPin,
  Plane,
  Sparkles,
  Users,
  User,
  ArrowRight,
  Filter,
  Search,
  LayoutGrid,
  ListOrdered,
  ArrowUpDown,
  X,
  DollarSign,
} from 'lucide-react';
import { useAuth } from '../../store/AuthContext';
import { useTheme } from '../../store/ThemeContext';
import { tripService } from '../../services/tripService';
import { flightService } from '../../services/flightService';
import { TripSummary, Flight } from '../../types';
import { TripCard } from '../../components/dashboard/TripCard';
import { QuickActions } from '../../components/dashboard/QuickActions';
import { UpcomingFlightsWidget } from '../../components/dashboard/UpcomingFlightsWidget';
import { UpcomingBriefingWidget } from '../../components/dashboard/UpcomingBriefingWidget';
import { DashboardStatsStrip } from '../../components/dashboard/DashboardStatsStrip';
import { TripTimelineView } from '../../components/dashboard/TripTimelineView';
import { QuickCurrencyConverter } from '../../components/dashboard/QuickCurrencyConverter';
import { LevelProgressPill } from '../../components/gamification/LevelProgressPill';
import { gamificationService } from '../../services/gamificationService';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';

type SortOption = 'date-asc' | 'date-desc' | 'budget-desc' | 'title-asc';
type ViewMode = 'grid' | 'timeline';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { setTripDestination } = useTheme();
  const [trips, setTrips] = useState<TripSummary[]>([]);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('date-asc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const tripsData = await tripService.getTrips();
      setTrips(tripsData);

      // Fetch flights from the first trip
      if (tripsData.length > 0) {
        try {
          const flightsData = await flightService.getFlights(tripsData[0].id);
          setFlights(flightsData);
        } catch (e) {
          // Flights optional
        }
      } else {
        setFlights([]);
      }
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      if (err?.status === 401 || err?.message === 'Not authenticated') {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      fetchDashboardData();
    }
  }, [user, authLoading, router]);

  // Sync atmospheric theme with the current user's active expedition
  useEffect(() => {
    if (trips.length > 0) {
      const activeOrUpcoming = trips.find((t) => t.status === 'ACTIVE') || trips[0];
      if (activeOrUpcoming?.destination) {
        setTripDestination(activeOrUpcoming.destination);
      }
    }
  }, [trips, setTripDestination]);

  const activeTrip = useMemo(() => {
    return trips.find((t) => t.status === 'ACTIVE') || trips[0] || null;
  }, [trips]);

  // Handle stat strip click to filter
  const handleStatFilterSelect = (filterTarget: string) => {
    setStatusFilter(filterTarget);
    // Smooth scroll to journeys section
    const journeysSection = document.getElementById('journeys-section');
    if (journeysSection) {
      journeysSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Filter and sort trips
  const processedTrips = useMemo(() => {
    let result = [...trips];

    // Status filter
    if (statusFilter !== 'ALL') {
      result = result.filter((t) => t.status === statusFilter);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.destination.toLowerCase().includes(q) ||
          t.user_role.toLowerCase().includes(q)
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'date-asc') {
        return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
      }
      if (sortBy === 'date-desc') {
        return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
      }
      if (sortBy === 'budget-desc') {
        return (Number(b.budget) || 0) - (Number(a.budget) || 0);
      }
      if (sortBy === 'title-asc') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    return result;
  }, [trips, statusFilter, searchQuery, sortBy]);

  const gamificationStats = useMemo(() => {
    return gamificationService.calculateStats(trips);
  }, [trips]);

  const filterOptions = [
    { label: 'All Journeys', value: 'ALL', count: trips.length },
    { label: 'Planning', value: 'PLANNING', count: trips.filter((t) => t.status === 'PLANNING').length },
    { label: 'Active', value: 'ACTIVE', count: trips.filter((t) => t.status === 'ACTIVE').length },
    { label: 'Completed', value: 'COMPLETED', count: trips.filter((t) => t.status === 'COMPLETED').length },
  ];

  if (authLoading || (loading && trips.length === 0)) {
    return (
      <div className="space-y-6 py-6 animate-pulse">
        <div className="h-10 w-64 bg-slate-800 rounded-xl" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="h-24 bg-slate-900 rounded-2xl" />
          <div className="h-24 bg-slate-900 rounded-2xl" />
          <div className="h-24 bg-slate-900 rounded-2xl" />
          <div className="h-24 bg-slate-900 rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-64 bg-slate-900 rounded-2xl" />
          <div className="h-64 bg-slate-900 rounded-2xl" />
          <div className="h-64 bg-slate-900 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-4">
      {/* 1. Top Greeting & Primary Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-theme-subtle">
        <div className="space-y-2">
          {/* Main Title & Status Badge */}
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.full_name.split(' ')[0]} 👋
            </h1>
            {user?.travel_style && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-950/70 border border-blue-800/40 text-blue-300">
                {user.travel_style} Explorer
              </span>
            )}
          </div>

          {/* Subtitle with Journey summary */}
          <p className="text-xs sm:text-sm text-slate-400">
            You have <span className="font-semibold text-white">{trips.length} {trips.length === 1 ? 'journey' : 'journeys'}</span> mapped in your collective.
          </p>
        </div>

        {/* Right side: XP Level Badge, Passport link, & Plan New Journey CTA */}
        <div className="flex flex-wrap items-center gap-2.5 sm:self-center">
          <LevelProgressPill stats={gamificationStats} />

          <Link
            href="/profile"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-theme-surface border border-theme-subtle text-xs font-semibold text-slate-300 hover:text-white hover:border-theme-strong hover:bg-theme-surface-raised transition-all"
            title="View your private explorer passport"
          >
            <User className="w-3.5 h-3.5 text-blue-400" />
            <span>Passport</span>
          </Link>

          <Link href="/trips/create">
            <Button variant="primary" size="md" className="gap-2 text-xs sm:text-sm font-bold shadow-lg shadow-blue-500/20">
              <PlusCircle className="w-4 h-4" />
              Plan New Journey
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Interactive Dashboard Stats Strip */}
      {trips.length > 0 && (
        <DashboardStatsStrip
          trips={trips}
          activeFilter={statusFilter}
          onFilterSelect={handleStatFilterSelect}
        />
      )}

      {/* 3. Upcoming Expeditions & Destination Intelligence Briefing */}
      <UpcomingBriefingWidget trips={trips} />

      {/* 4. Quick Action Tiles & Travel Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-4">
          <QuickActions />
        </div>
        <div className="lg:col-span-1">
          <QuickCurrencyConverter
            defaultFrom={activeTrip?.currency || 'USD'}
            defaultTo="EUR"
          />
        </div>
      </div>

      {/* 5. Trips Section with Interactive Search, Filter, Sort & View Controls */}
      <div id="journeys-section" className="space-y-4 scroll-mt-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white">Your Journeys</h2>
            <p className="text-xs text-slate-400">All planned, active, and completed travels</p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-theme-surface border border-theme-subtle overflow-x-auto">
            {filterOptions.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  statusFilter === f.value
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-theme-surface-raised'
                }`}
              >
                <span>{f.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                    statusFilter === f.value
                      ? 'bg-blue-800 text-white'
                      : 'bg-theme-surface-raised text-slate-300'
                  }`}
                >
                  {f.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Search, Sort & View Mode Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2.5 rounded-2xl bg-theme-surface border border-theme-subtle">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by destination, trip title, or role..."
              className="w-full bg-theme-surface-raised border border-theme-subtle rounded-xl pl-9 pr-8 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort & View Options */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-theme-surface-raised border border-theme-subtle text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                aria-label="Sort Journeys"
                className="bg-transparent text-xs text-white font-medium focus:outline-none cursor-pointer"
              >
                <option value="date-asc" className="bg-slate-900 text-white">Departure (Soonest)</option>
                <option value="date-desc" className="bg-slate-900 text-white">Departure (Latest)</option>
                <option value="budget-desc" className="bg-slate-900 text-white">Budget (Highest)</option>
                <option value="title-asc" className="bg-slate-900 text-white">Title (A – Z)</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-theme-surface-raised border border-theme-subtle">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                title="Grid Card View"
                className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-theme-surface'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('timeline')}
                title="Chronological Timeline View"
                className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  viewMode === 'timeline'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-theme-surface'
                }`}
              >
                <ListOrdered className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Trips Content (Grid or Timeline) */}
        {processedTrips.length === 0 ? (
          <Card className="py-12 text-center space-y-3">
            <Compass className="w-10 h-10 text-slate-500 mx-auto" />
            <h3 className="text-sm font-bold text-white">No journeys match your criteria</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchQuery
                ? `No journeys found matching "${searchQuery}". Try adjusting your keywords or clearing the search.`
                : 'Ready for your next adventure? Create a new trip with custom dates and AI suggestions.'}
            </p>
            <div className="pt-2 flex items-center justify-center gap-2">
              {searchQuery && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                  className="text-xs border-theme-subtle"
                >
                  Clear Search
                </Button>
              )}
              <Link href="/trips/create">
                <Button variant="primary" size="sm" className="gap-1.5 font-bold">
                  <PlusCircle className="w-3.5 h-3.5" />
                  Plan Journey
                </Button>
              </Link>
            </div>
          </Card>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {processedTrips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        ) : (
          <div className="p-4 sm:p-6 rounded-3xl bg-theme-surface border border-theme-subtle shadow-xl">
            <TripTimelineView trips={processedTrips} />
          </div>
        )}
      </div>

      {/* 6. Upcoming Flights Widget */}
      {flights.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Plane className="w-4 h-4 text-blue-400" />
              Upcoming Flights
            </h2>
            {activeTrip && (
              <Link href={`/trips/${activeTrip.id}?tab=flights`} className="text-xs text-blue-400 hover:underline font-semibold">
                View All Flights &rarr;
              </Link>
            )}
          </div>
          <UpcomingFlightsWidget flights={flights} />
        </div>
      )}
    </div>
  );
}
