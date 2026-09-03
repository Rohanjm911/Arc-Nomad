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
  ArrowRight,
  Filter,
} from 'lucide-react';
import { useAuth } from '../../store/AuthContext';
import { tripService } from '../../services/tripService';
import { flightService } from '../../services/flightService';
import { TripSummary, Flight } from '../../types';
import { TripCard } from '../../components/dashboard/TripCard';
import { QuickActions } from '../../components/dashboard/QuickActions';
import { UpcomingFlightsWidget } from '../../components/dashboard/UpcomingFlightsWidget';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.full_name.split(' ')[0]} 👋
            </h1>
            {user?.travel_style && (
              <Badge variant="purple" size="sm">
                {user.travel_style}
              </Badge>
            )}
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

      {/* 2. Active Trip Spotlight (If trips exist) */}
      {activeTrip && (
        <Card className="p-6 bg-slate-900 border-slate-800">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant={activeTrip.status === 'ACTIVE' ? 'success' : 'primary'} size="sm">
                  {activeTrip.status === 'ACTIVE' ? 'CURRENT ACTIVE EXPEDITION' : 'NEXT UPCOMING EXPEDITION'}
                </Badge>
                <Badge variant="teal" size="sm">
                  <MapPin className="w-3 h-3" />
                  {activeTrip.destination}
                </Badge>
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                {activeTrip.title}
              </h2>

              <p className="text-xs text-slate-400 flex flex-wrap items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  {new Date(activeTrip.start_date).toLocaleDateString([], { month: 'short', day: 'numeric' })} –{' '}
                  {new Date(activeTrip.end_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <span>Budget: <strong className="text-white">{activeTrip.currency} {Number(activeTrip.budget).toLocaleString()}</strong></span>
                <span>Crew: <strong className="text-white">{activeTrip.member_count} Members</strong></span>
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link href={`/trips/${activeTrip.id}`}>
                <Button variant="primary" size="md" className="gap-2 font-bold text-xs sm:text-sm">
                  Open Trip Workspace
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      )}

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
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 overflow-x-auto">
            {filterOptions.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  statusFilter === f.value
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span>{f.label}</span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                  statusFilter === f.value ? 'bg-blue-800 text-white' : 'bg-slate-800 text-slate-300'
                }`}>
                  {f.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Trips Grid */}
        {filteredTrips.length === 0 ? (
          <Card className="py-12 text-center space-y-3 bg-slate-900 border-slate-800">
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
