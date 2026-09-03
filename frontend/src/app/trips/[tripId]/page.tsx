'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  Calendar,
  MapPin,
  Sparkles,
  Plane,
  Receipt,
  MessageSquare,
  AlertCircle,
  Compass,
  Globe,
} from 'lucide-react';
import { TravelLogo } from '../../../components/ui/TravelLogo';
import { useAuth } from '../../../store/AuthContext';
import { tripService } from '../../../services/tripService';
import { itineraryService } from '../../../services/itineraryService';
import { recommendationService } from '../../../services/recommendationService';
import { flightService } from '../../../services/flightService';
import { expenseService } from '../../../services/expenseService';
import {
  Trip,
  ItineraryDay,
  Recommendation,
  Flight,
  Expense,
  ExpenseAnalyticsSummary,
} from '../../../types';
import { TripHeader } from '../../../components/trip/TripHeader';
import { WeatherWidget } from '../../../components/trip/WeatherWidget';
import { DayPlanner } from '../../../components/itinerary/DayPlanner';
import { InteractiveMap } from '../../../components/map/InteractiveMap';
import { RecommendationList } from '../../../components/recommendations/RecommendationList';
import { FlightBoardingPass } from '../../../components/flights/FlightBoardingPass';
import { AddFlightModal } from '../../../components/flights/AddFlightModal';
import { ExpenseList } from '../../../components/expenses/ExpenseList';
import { GroupChatRoom } from '../../../components/chat/GroupChatRoom';
import { AIGeneratorModal } from '../../../components/itinerary/AIGeneratorModal';
import { Button } from '../../../components/ui/Button';

type TabKey = 'itinerary' | 'map' | 'recommendations' | 'flights' | 'expenses' | 'chat';

function TripDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const tripId = params.tripId as string;

  const initialTab = (searchParams.get('tab') as TabKey) || 'itinerary';
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);

  // Core Trip State
  const [trip, setTrip] = useState<Trip | null>(null);
  const [days, setDays] = useState<ItineraryDay[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [analytics, setAnalytics] = useState<ExpenseAnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals & Map Selection
  const [addFlightModalOpen, setAddFlightModalOpen] = useState(false);
  const [aiGeneratorOpen, setAiGeneratorOpen] = useState(false);
  const [selectedMapLocation, setSelectedMapLocation] = useState<{
    lat: number;
    lng: number;
    title: string;
  } | null>(null);

  const fetchTripData = useCallback(async () => {
    if (!tripId) return;
    try {
      setLoading(true);
      setError(null);

      const [tripData, daysData, recsData, flightsData, expensesData, analyticsData] =
        await Promise.all([
          tripService.getTrip(tripId),
          itineraryService.getItineraryDays(tripId).catch(() => []),
          recommendationService.getRecommendations(tripId).catch(() => []),
          flightService.getFlights(tripId).catch(() => []),
          expenseService.getExpenses(tripId).catch(() => []),
          expenseService.getAnalytics(tripId).catch(() => null),
        ]);

      setTrip(tripData);
      setDays(daysData);
      setRecommendations(recsData);
      setFlights(flightsData);
      setExpenses(expensesData);
      setAnalytics(analyticsData);
    } catch (err: any) {
      console.error('Failed to load trip details:', err);
      setError(err.message || 'Failed to load trip details. Verify you have access.');
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user && tripId) {
      fetchTripData();
    }
  }, [user, authLoading, tripId, router, fetchTripData]);

  const handleSelectLocation = (lat: number, lng: number, title: string) => {
    setSelectedMapLocation({ lat, lng, title });
    setActiveTab('map');
  };

  const handleAddRecommendationToItinerary = async (recId: string) => {
    if (days.length === 0) {
      alert('Create at least one day in your itinerary first!');
      return;
    }
    try {
      await recommendationService.addToItinerary({
        recommendation_id: recId,
        day_id: days[0].id,
      });
      fetchTripData();
      alert('Added recommendation to Day 1 of your itinerary!');
    } catch (err: any) {
      alert(err.message || 'Failed to add recommendation.');
    }
  };

  const handleDeleteFlight = async (flightId: string) => {
    if (!confirm('Are you sure you want to delete this flight?')) return;
    try {
      await flightService.deleteFlight(flightId);
      fetchTripData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading && !trip) {
    return (
      <div className="space-y-6 animate-pulse py-6">
        <div className="h-64 bg-slate-900 rounded-3xl" />
        <div className="h-12 bg-slate-900 rounded-2xl w-3/4" />
        <div className="h-96 bg-slate-900 rounded-3xl" />
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">Unable to Load Trip</h2>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">{error}</p>
        <Button variant="primary" size="sm" onClick={() => router.push('/dashboard')}>
          Return to Dashboard
        </Button>
      </div>
    );
  }

  const canEdit = trip.user_role === 'OWNER' || trip.user_role === 'EDITOR';

  // Consolidate all itinerary items for the map view
  const allItineraryItems = days.flatMap((d) => d.items || []);

  const tabs: { key: TabKey; label: string; icon: React.ReactNode; badge?: number }[] = [
    { key: 'itinerary', label: 'Day Planner', icon: <Compass className="w-4 h-4 text-cyan-400" />, badge: allItineraryItems.length },
    { key: 'map', label: 'Interactive Map', icon: <Globe className="w-4 h-4 text-blue-400" /> },
    { key: 'recommendations', label: 'AI Discoveries', icon: <Sparkles className="w-4 h-4 text-purple-400" />, badge: recommendations.length },
    { key: 'flights', label: 'Flights & Tracking', icon: <Plane className="w-4 h-4 text-sky-400" />, badge: flights.length },
    { key: 'expenses', label: 'Expenses & Splits', icon: <Receipt className="w-4 h-4 text-emerald-400" />, badge: expenses.length },
    { key: 'chat', label: 'Real-Time Chat', icon: <MessageSquare className="w-4 h-4 text-amber-400" /> },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Trip Header Banner */}
      <TripHeader
        trip={trip}
        onTripUpdated={(updated) => setTrip(updated)}
        onOpenAIGenerator={() => setAiGeneratorOpen(true)}
      />

      {/* Destination Weather Bar */}
      <WeatherWidget tripId={trip.id} />

      {/* Navigation Tab Bar with Travel Logo Emblem */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-800">
        <div className="hidden md:flex items-center gap-2 pl-2 pr-3 border-r border-slate-800 shrink-0">
          <TravelLogo size="xs" />
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Trip Hub</span>
        </div>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-blue-600 text-white border border-blue-500'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge != null && tab.badge > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Day Planner & Itinerary */}
      {activeTab === 'itinerary' && (
        <DayPlanner
          trip={trip}
          days={days}
          onDaysUpdated={fetchTripData}
          onSelectLocation={handleSelectLocation}
        />
      )}

      {/* Tab 2: Interactive Spatial Map */}
      {activeTab === 'map' && (
        <InteractiveMap
          destination={trip.destination}
          centerLat={trip.destination_lat || 35.6762}
          centerLng={trip.destination_lng || 139.6503}
          itineraryItems={allItineraryItems}
          recommendations={recommendations}
          selectedLocation={selectedMapLocation}
          onAddRecommendationToItinerary={handleAddRecommendationToItinerary}
        />
      )}

      {/* Tab 3: Recommendations */}
      {activeTab === 'recommendations' && (
        <RecommendationList
          trip={trip}
          recommendations={recommendations}
          days={days}
          onRecommendationsUpdated={fetchTripData}
        />
      )}

      {/* Tab 4: Flights & Live Tracking */}
      {activeTab === 'flights' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Flight Tracking & Logistics</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Live gate updates, delay monitoring, and simulated flight operations
              </p>
            </div>

            {canEdit && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setAddFlightModalOpen(true)}
                className="gap-1.5 text-xs shadow-indigo-600/20"
              >
                <Plane className="w-4 h-4" />
                Add Flight
              </Button>
            )}
          </div>

          {flights.length === 0 ? (
            <div className="text-center py-16 rounded-3xl border border-dashed border-slate-800 bg-slate-950/40 p-6 space-y-3">
              <Plane className="w-10 h-10 text-indigo-400 mx-auto" />
              <h4 className="text-sm font-bold text-slate-200">No flights logged</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Add your group flights to monitor boarding status and receive live gate change alerts.
              </p>
              {canEdit && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setAddFlightModalOpen(true)}
                  className="gap-1.5 text-xs"
                >
                  <Plane className="w-3.5 h-3.5" />
                  Add Flight
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {flights.map((flight) => (
                <FlightBoardingPass
                  key={flight.id}
                  flight={flight}
                  canEdit={canEdit}
                  onFlightUpdated={fetchTripData}
                  onDeleteFlight={handleDeleteFlight}
                />
              ))}
            </div>
          )}

          <AddFlightModal
            isOpen={addFlightModalOpen}
            onClose={() => setAddFlightModalOpen(false)}
            tripId={trip.id}
            onFlightAdded={fetchTripData}
          />
        </div>
      )}

      {/* Tab 5: Expenses & Debt Simplification */}
      {activeTab === 'expenses' && (
        <ExpenseList
          trip={trip}
          expenses={expenses}
          analytics={analytics}
          onExpensesUpdated={fetchTripData}
        />
      )}

      {/* Tab 6: Group Real-Time Chat */}
      {activeTab === 'chat' && <GroupChatRoom trip={trip} />}

      {/* Global AI Generator Modal */}
      <AIGeneratorModal
        isOpen={aiGeneratorOpen}
        onClose={() => setAiGeneratorOpen(false)}
        trip={trip}
        onItineraryGenerated={fetchTripData}
      />
    </div>
  );
}

export default function TripDetailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading trip details...</div>}>
      <TripDetailContent />
    </Suspense>
  );
}
