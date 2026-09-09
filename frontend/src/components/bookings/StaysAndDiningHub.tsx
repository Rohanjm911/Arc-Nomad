'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Hotel as HotelIcon,
  UtensilsCrossed,
  ShieldCheck,
  Compass,
  Plus,
  Navigation,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import {
  Trip,
  ItineraryDay,
  Booking,
  HotelCatalogItem,
  RestaurantCatalogItem,
  BookingType
} from '../../types';
import { HotelBrowser } from './HotelBrowser';
import { RestaurantBrowser } from './RestaurantBrowser';
import { BookingsLedger } from './BookingsLedger';
import { ReservationModal } from './ReservationModal';
import { NearbyHotelsPanel } from './NearbyHotelsPanel';
import { NearbyDiningPanel } from './NearbyDiningPanel';

interface StaysAndDiningHubProps {
  trip: Trip;
  days: ItineraryDay[];
  bookings: Booking[];
  onBookingsUpdated: () => void;
}

type HubSection = 'hotels' | 'nearbyhotels' | 'restaurants' | 'nearbyrestaurants' | 'ledger';

export const StaysAndDiningHub: React.FC<StaysAndDiningHubProps> = ({
  trip,
  days,
  bookings,
  onBookingsUpdated,
}) => {
  const [activeSection, setActiveSection] = useState<HubSection>('hotels');
  const [modalTarget, setModalTarget] = useState<{
    type: BookingType;
    hotel?: HotelCatalogItem;
    restaurant?: RestaurantCatalogItem;
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Auto side-scroll for sub-navigation buttons
  const subNavContainerRef = React.useRef<HTMLDivElement>(null);
  const sectionRefs = React.useRef<Map<HubSection, HTMLButtonElement>>(new Map());
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = React.useCallback(() => {
    const el = subNavContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  React.useEffect(() => {
    const container = subNavContainerRef.current;
    const button = sectionRefs.current.get(activeSection);
    if (container && button) {
      const containerWidth = container.clientWidth;
      const targetScroll = button.offsetLeft - (containerWidth / 2) + (button.offsetWidth / 2);
      container.scrollTo({ left: Math.max(0, targetScroll), behavior: 'smooth' });
    }
    const timer = setTimeout(checkScroll, 300);
    return () => clearTimeout(timer);
  }, [activeSection, checkScroll]);

  React.useEffect(() => {
    const container = subNavContainerRef.current;
    if (!container) return;
    checkScroll();
    const handleScroll = () => checkScroll();
    container.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [checkScroll]);

  const handleOpenHotelReservation = (hotel: HotelCatalogItem) => {
    setModalTarget({ type: 'HOTEL', hotel });
    setIsModalOpen(true);
  };

  const handleOpenRestaurantReservation = (restaurant: RestaurantCatalogItem) => {
    setModalTarget({ type: 'RESTAURANT', restaurant });
    setIsModalOpen(true);
  };

  const handleBookingSuccess = (newBooking: Booking) => {
    onBookingsUpdated();
  };

  return (
    <div className="space-y-6">
      {/* Sub-navigation Controls with Auto Side Scroll */}
      <div className="relative group/hubnav">
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => subNavContainerRef.current?.scrollBy({ left: -160, behavior: 'smooth' })}
            className="absolute left-1 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-lg bg-theme-surface/90 backdrop-blur-md border border-theme-strong shadow-md flex items-center justify-center text-white hover:bg-theme-accent transition-all cursor-pointer"
            aria-label="Scroll options left"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        )}

        {canScrollRight && (
          <button
            type="button"
            onClick={() => subNavContainerRef.current?.scrollBy({ left: 160, behavior: 'smooth' })}
            className="absolute right-1 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-lg bg-theme-surface/90 backdrop-blur-md border border-theme-strong shadow-md flex items-center justify-center text-white hover:bg-theme-accent transition-all cursor-pointer"
            aria-label="Scroll options right"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-2 rounded-2xl bg-theme-surface border border-theme-subtle">
          <div
            ref={subNavContainerRef}
            className="flex items-center gap-1.5 overflow-x-auto scrollbar-none scroll-smooth w-full"
          >
            <button
              ref={(n) => { if (n) sectionRefs.current.set('hotels', n); else sectionRefs.current.delete('hotels'); }}
              onClick={() => setActiveSection('hotels')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeSection === 'hotels'
                  ? 'bg-blue-600 text-white border border-blue-500 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-theme-raised'
              }`}
            >
              <HotelIcon className="w-4 h-4" />
              <span>Browse Accommodations</span>
            </button>

            <button
              ref={(n) => { if (n) sectionRefs.current.set('nearbyhotels', n); else sectionRefs.current.delete('nearbyhotels'); }}
              onClick={() => setActiveSection('nearbyhotels')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeSection === 'nearbyhotels'
                  ? 'bg-violet-600 text-white border border-violet-500 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-theme-raised'
              }`}
            >
              <Navigation className="w-4 h-4" />
              <span>Hotels Near Your Spots</span>
            </button>

            <button
              ref={(n) => { if (n) sectionRefs.current.set('restaurants', n); else sectionRefs.current.delete('restaurants'); }}
              onClick={() => setActiveSection('restaurants')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeSection === 'restaurants'
                  ? 'bg-cyan-600 text-white border border-cyan-500 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-theme-raised'
              }`}
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span>Fine Dining & Tables</span>
            </button>

            <button
              ref={(n) => { if (n) sectionRefs.current.set('nearbyrestaurants', n); else sectionRefs.current.delete('nearbyrestaurants'); }}
              onClick={() => setActiveSection('nearbyrestaurants')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeSection === 'nearbyrestaurants'
                  ? 'bg-amber-600 text-white border border-amber-500 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-theme-raised'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Dining Near Your Spots</span>
            </button>

            <button
              ref={(n) => { if (n) sectionRefs.current.set('ledger', n); else sectionRefs.current.delete('ledger'); }}
              onClick={() => setActiveSection('ledger')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeSection === 'ledger'
                  ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-theme-raised'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Reservations Ledger</span>
              {bookings.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-emerald-950 text-emerald-400 border border-emerald-800">
                  {bookings.length}
                </span>
              )}
            </button>
          </div>

          <div className="hidden xl:flex items-center gap-3 px-3 text-xs text-slate-400 shrink-0">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Stays</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-violet-500" />
              <span>Nearby Hotels</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Nearby Dining</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Section Content */}
      {activeSection === 'hotels' && (
        <HotelBrowser
          destination={trip.destination}
          onSelectHotel={handleOpenHotelReservation}
        />
      )}

      {activeSection === 'nearbyhotels' && (
        <NearbyHotelsPanel
          tripId={trip.id}
          destination={trip.destination}
          onSelectHotel={handleOpenHotelReservation}
        />
      )}

      {activeSection === 'restaurants' && (
        <RestaurantBrowser
          destination={trip.destination}
          onSelectRestaurant={handleOpenRestaurantReservation}
        />
      )}

      {activeSection === 'nearbyrestaurants' && (
        <NearbyDiningPanel
          tripId={trip.id}
          destination={trip.destination}
          onSelectRestaurant={handleOpenRestaurantReservation}
        />
      )}

      {activeSection === 'ledger' && (
        <BookingsLedger
          trip={trip}
          bookings={bookings}
          onBookingsUpdated={onBookingsUpdated}
          onNavigateToHotels={() => setActiveSection('hotels')}
          onNavigateToRestaurants={() => setActiveSection('restaurants')}
        />
      )}

      {/* Reservation & Booking Modal */}
      <ReservationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        target={modalTarget}
        trip={trip}
        days={days}
        onSuccess={handleBookingSuccess}
      />
    </div>
  );
};
