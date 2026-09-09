'use client';

import React, { useState, useEffect } from 'react';
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
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { setTripDestination } = useTheme();
  const [trips, setTrips] = useState<TripSummary[]>([]);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
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
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
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

  if (authLoading || (loading && trips.length === 0)) {
    return (
      <div className="space-y-6 py-6 animate-pulse">
        <div className="h-10 w-64 bg-slate-800 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-64 bg-slate-900 rounded-2xl" />
          <div className="h-64 bg-slate-900 rounded-2xl" />
          <div className="h-64 bg-slate-900 rounded-2xl" />
        </div>
      </div>
    );
  }

  const activeTrip = trips.find((t) => t.status === 'ACTIVE') || trips[0];
  const filteredTrips = statusFilter === 'ALL'
    ? trips
    : trips.filter((t) => t.status === statusFilter);

  const filterOptions = [
    { label: 'All Journeys', value: 'ALL', count: trips.length },
    { label: 'Planning', value: 'PLANNING', count: trips.filter((t) => t.status === 'PLANNING').length },
    { label: 'Active', value: 'ACTIVE', count: trips.filter((t) => t.status === 'ACTIVE').length },
    { label: 'Completed', value: 'COMPLETED', count: trips.filter((t) => t.status === 'COMPLETED').length },
  ];

  return (
    <div className="space-y-8 py-4">
      {/* 1. Top Greeting & Quick Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-theme-subtle">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.full_name.split(' ')[0]} 👋
            </h1>
            {user?.travel_style && (
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-950 border border-blue-800/40 text-blue-300">
                {user.travel_style}
              </span>
            )}
            <Link
              href="/profile"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-theme-surface border border-theme-subtle text-xs font-semibold text-slate-300 hover:text-white hover:border-theme-strong hover:bg-theme-surface-raised transition-colors"
              title="View your private explorer passport"
            >
              <User className="w-3.5 h-3.5 text-blue-400" />
              <span>View Profile</span>
            </Link>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            You have <strong className="text-blue-400">{trips.length} journeys</strong> mapped in your collective.
          </p>
        </div>

        <Link href="/trips/create">
          <Button variant="primary" size="md" className="gap-2 text-xs sm:text-sm font-bold">
            <PlusCircle className="w-4 h-4" />
            Plan New Journey
          </Button>
        </Link>
      </div>

      {/* 2. Upcoming Expeditions & Destination Intelligence Briefing */}
      <UpcomingBriefingWidget trips={trips} />

      {/* 3. Quick Action Tiles */}
      <QuickActions />

      {/* 4. Trips Section with Filter Tabs */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                  statusFilter === f.value ? 'bg-blue-800 text-white' : 'bg-theme-surface-raised text-slate-300'
                }`}>
                  {f.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Trips Grid */}
        {filteredTrips.length === 0 ? (
          <Card className="py-12 text-center space-y-3">
            <Compass className="w-10 h-10 text-slate-500 mx-auto" />
            <h3 className="text-sm font-bold text-white">No journeys found in this view</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Ready for your next adventure? Create a new trip with custom dates and AI suggestions.
            </p>
            <div className="pt-2">
              <Link href="/trips/create">
                <Button variant="primary" size="sm" className="gap-1.5 font-bold">
                  <PlusCircle className="w-3.5 h-3.5" />
                  Plan Journey
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        )}
      </div>

      {/* 5. Upcoming Flights Widget */}
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
