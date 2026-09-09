'use client';

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
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
  Hotel as HotelIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { TravelLogo } from '../../../components/ui/TravelLogo';
import { useAuth } from '../../../store/AuthContext';
import { useTheme } from '../../../store/ThemeContext';
import { tripService } from '../../../services/tripService';
import { itineraryService } from '../../../services/itineraryService';
import { recommendationService } from '../../../services/recommendationService';
import { flightService } from '../../../services/flightService';
import { expenseService } from '../../../services/expenseService';
import { bookingService } from '../../../services/bookingService';
import {
  Trip,
  ItineraryDay,
  Recommendation,
  Flight,
  Expense,
  ExpenseAnalyticsSummary,
  Booking,
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
import { StaysAndDiningHub } from '../../../components/bookings/StaysAndDiningHub';
import { Button } from '../../../components/ui/Button';

type TabKey = 'itinerary' | 'map' | 'bookings' | 'recommendations' | 'flights' | 'expenses' | 'chat';

function TripDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { setTripDestination } = useTheme();
  const tripId = params.tripId as string;

  const initialTab = (searchParams.get('tab') as TabKey) || 'itinerary';
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);

  // Core Trip State
  const [trip, setTrip] = useState<Trip | null>(null);
  const [days, setDays] = useState<ItineraryDay[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
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

  // Auto-scroll the active tab into view within the tab bar container
  const tabRefs = useRef<Map<TabKey, HTMLButtonElement>>(new Map());
  const tabContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollability = useCallback(() => {
    const el = tabContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  const scrollToTab = useCallback((key: TabKey, smooth = true) => {
    const container = tabContainerRef.current;
    const button = tabRefs.current.get(key);
    if (!container || !button) return;

    const containerWidth = container.clientWidth;
    const buttonOffsetLeft = button.offsetLeft;
    const buttonWidth = button.offsetWidth;

    // Calculate target scroll position to center the active button nicely in container
    const targetScrollLeft = buttonOffsetLeft - (containerWidth / 2) + (buttonWidth / 2);

    container.scrollTo({
      left: Math.max(0, targetScrollLeft),
      behavior: smooth ? 'smooth' : 'auto',
    });
  }, []);

  useEffect(() => {
    scrollToTab(activeTab, true);
    // Recheck scroll state after smooth scroll completes
    const timer = setTimeout(checkScrollability, 350);
    return () => clearTimeout(timer);
  }, [activeTab, scrollToTab, checkScrollability]);

  useEffect(() => {
    const container = tabContainerRef.current;
    if (!container) return;

    checkScrollability();
    const handleScroll = () => checkScrollability();
    container.addEventListener('scroll', handleScroll, { passive: true });

    // Enable horizontal mouse wheel / trackpad shift
    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return; // Already horizontal
      if (container.scrollWidth <= container.clientWidth) return; // No overflow
      e.preventDefault();
      container.scrollLeft += e.deltaY;
    };
    container.addEventListener('wheel', handleWheel, { passive: false });

    const handleResize = () => checkScrollability();
    window.addEventListener('resize', handleResize);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      container.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', handleResize);
    };
  }, [checkScrollability]);

  const fetchTripData = useCallback(async () => {
    if (!tripId) return;
    try {
      setLoading(true);
      setError(null);

      const [tripData, daysData, recsData, flightsData, expensesData, analyticsData, bookingsData] =
        await Promise.all([
          tripService.getTrip(tripId),
          itineraryService.getItineraryDays(tripId).catch(() => []),
          recommendationService.getRecommendations(tripId).catch(() => []),
          flightService.getFlights(tripId).catch(() => []),
          expenseService.getExpenses(tripId).catch(() => []),
          expenseService.getAnalytics(tripId).catch(() => null),
          bookingService.getBookings(tripId).catch(() => []),
        ]);

      setTrip(tripData);
      if (tripData?.destination) {
        setTripDestination(tripData.destination);
      }
      setDays(daysData);
      setRecommendations(recsData);
      setFlights(flightsData);
      setExpenses(expensesData);
      setAnalytics(analyticsData);
      setBookings(bookingsData);
    } catch (err: any) {
      console.error('Failed to load trip details:', err);
      setError(err.message || 'Failed to load trip details. Verify you have access.');
    } finally {
      setLoading(false);
    }
  }, [tripId, setTripDestination]);

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
        day_id: days[0].id,
        recommendation_id: recId,
      });
      fetchTripData();
      setActiveTab('itinerary');
    } catch (err) {
      console.error('Failed to add recommendation to itinerary:', err);
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
      <div className="space-y-6 py-6 animate-pulse">
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
    { key: 'bookings', label: 'Stays & Dining', icon: <HotelIcon className="w-4 h-4 text-blue-400" />, badge: bookings.length },
    { key: 'recommendations', label: 'AI Discoveries', icon: <Sparkles className="w-4 h-4 text-purple-400" />, badge: recommendations.length },
    { key: 'flights', label: 'Flights & Tracking', icon: <Plane className="w-4 h-4 text-sky-400" />, badge: flights.length },
    { key: 'expenses', label: 'Expenses & Splits', icon: <Receipt className="w-4 h-4 text-emerald-400" />, badge: expenses.length },
    { key: 'chat', label: 'Real-Time Chat', icon: <MessageSquare className="w-4 h-4 text-amber-400" /> },
  ];

  const scrollByAmount = (offset: number) => {
    if (!tabContainerRef.current) return;
    tabContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

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

      {/* Navigation Tab Bar with Travel Logo Emblem & Side Auto-Scroll */}
      <div className="relative group/tabbar">
        {/* Left Side Scroll Indicator / Shifter */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scrollByAmount(-200)}
            className="absolute left-1 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-xl bg-theme-surface/90 backdrop-blur-md border border-theme-strong shadow-lg flex items-center justify-center text-white hover:bg-theme-accent transition-all cursor-pointer"
            title="Scroll left"
            aria-label="Scroll tabs left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        {/* Right Side Scroll Indicator / Shifter */}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => scrollByAmount(200)}
            className="absolute right-1 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-xl bg-theme-surface/90 backdrop-blur-md border border-theme-strong shadow-lg flex items-center justify-center text-white hover:bg-theme-accent transition-all cursor-pointer"
            title="Scroll right"
            aria-label="Scroll tabs right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        <div
          ref={tabContainerRef}
          className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-theme-surface border border-theme-subtle overflow-x-auto scrollbar-none scroll-smooth"
        >
          <div className="hidden md:flex items-center gap-2 pl-2 pr-3 border-r border-theme-subtle shrink-0">
            <TravelLogo size="xs" />
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-theme-muted">Trip Hub</span>
          </div>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                ref={(node) => {
                  if (node) {
                    tabRefs.current.set(tab.key, node);
                  } else {
                    tabRefs.current.delete(tab.key);
                  }
                }}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-theme-accent text-white border border-theme-strong shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-theme-raised'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge != null && tab.badge > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-theme-raised text-slate-300'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
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
          days={days}
          itineraryItems={allItineraryItems}
          recommendations={recommendations}
          selectedLocation={selectedMapLocation}
          onAddRecommendationToItinerary={handleAddRecommendationToItinerary}
        />
      )}

      {/* Tab 3: Stays & Dining Hub */}
      {activeTab === 'bookings' && (
        <StaysAndDiningHub
          trip={trip}
          days={days}
          bookings={bookings}
          onBookingsUpdated={fetchTripData}
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
