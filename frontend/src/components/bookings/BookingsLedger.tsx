'use client';

import React, { useState } from 'react';
import {
  Hotel as HotelIcon,
  UtensilsCrossed,
  Calendar,
  Clock,
  Users,
  MapPin,
  Trash2,
  Copy,
  Check,
  ShieldCheck,
  CreditCard,
  FileText,
  AlertCircle,
  Plus
} from 'lucide-react';
import { Booking, BookingType, Trip } from '../../types';
import { bookingService } from '../../services/bookingService';
import { Button } from '../ui/Button';

interface BookingsLedgerProps {
  trip: Trip;
  bookings: Booking[];
  onBookingsUpdated: () => void;
  onNavigateToHotels: () => void;
  onNavigateToRestaurants: () => void;
}

export const BookingsLedger: React.FC<BookingsLedgerProps> = ({
  trip,
  bookings,
  onBookingsUpdated,
  onNavigateToHotels,
  onNavigateToRestaurants,
}) => {
  const [filterType, setFilterType] = useState<'ALL' | BookingType>('ALL');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const canEdit = trip.user_role === 'OWNER' || trip.user_role === 'EDITOR';

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleDeleteBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel and remove this reservation?')) return;
    try {
      setDeletingId(bookingId);
      await bookingService.deleteBooking(trip.id, bookingId);
      onBookingsUpdated();
    } catch (err) {
      console.error('Failed to cancel booking:', err);
      alert('Failed to cancel reservation. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filterType === 'ALL') return true;
    return b.booking_type === filterType;
  });

  const hotelCount = bookings.filter((b) => b.booking_type === 'HOTEL').length;
  const restaurantCount = bookings.filter((b) => b.booking_type === 'RESTAURANT').length;
  const totalSpent = bookings.reduce((sum, b) => sum + (b.total_price || 0), 0);

  return (
    <div className="space-y-6">
      {/* Ledger Metrics Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-theme-surface border border-theme-subtle flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-950 border border-blue-800 text-blue-400 flex items-center justify-center">
            <HotelIcon className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Confirmed Stays</span>
            <h4 className="text-xl font-bold text-white tracking-tight">{hotelCount} Properties</h4>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-theme-surface border border-theme-subtle flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Dining Reservations</span>
            <h4 className="text-xl font-bold text-white tracking-tight">{restaurantCount} Tables</h4>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-theme-surface border border-theme-subtle flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-400 flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Committed Stays Budget</span>
            <h4 className="text-xl font-mono font-bold text-emerald-400 tracking-tight">
              ${totalSpent.toLocaleString()} {trip.currency || 'USD'}
            </h4>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-theme-surface border border-theme-subtle">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterType === 'ALL'
                ? 'bg-theme-raised text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Reservations ({bookings.length})
          </button>
          <button
            onClick={() => setFilterType('HOTEL')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterType === 'HOTEL'
                ? 'bg-blue-950 text-blue-300 border border-blue-800'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <HotelIcon className="w-3.5 h-3.5" />
            Stays ({hotelCount})
          </button>
          <button
            onClick={() => setFilterType('RESTAURANT')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterType === 'RESTAURANT'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            Dining ({restaurantCount})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="xs"
            onClick={onNavigateToHotels}
            className="text-blue-400 border-blue-900/60 hover:border-blue-700"
          >
            <Plus className="w-3 h-3" />
            Book Stay
          </Button>
          <Button
            variant="outline"
            size="xs"
            onClick={onNavigateToRestaurants}
            className="text-cyan-400 border-cyan-900/60 hover:border-cyan-700"
          >
            <Plus className="w-3 h-3" />
            Book Dining
          </Button>
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-theme-surface border border-dashed border-theme-subtle space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-theme-raised border border-theme-subtle text-slate-400 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">No active reservations in this view</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Browse accommodations or restaurants to lock in verified confirmation codes for your trip.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-1">
            <Button variant="primary" size="sm" onClick={onNavigateToHotels} className="bg-blue-600 hover:bg-blue-500">
              Browse Hotels
            </Button>
            <Button variant="primary" size="sm" onClick={onNavigateToRestaurants} className="bg-cyan-600 hover:bg-cyan-500">
              Reserve Dining
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => {
            const isHotel = b.booking_type === 'HOTEL';
            const isDeleting = deletingId === b.id;

            return (
              <div
                key={b.id}
                className={`p-5 rounded-3xl bg-theme-surface border transition-all duration-200 ${
                  isHotel
                    ? 'border-theme-subtle hover:border-blue-500/40'
                    : 'border-theme-subtle hover:border-cyan-500/40'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Left Column: Icon & Info */}
                  <div className="flex items-start gap-3.5">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border shrink-0 mt-0.5 ${
                      isHotel
                        ? 'bg-blue-950 border-blue-800 text-blue-400'
                        : 'bg-cyan-950 border-cyan-800 text-cyan-400'
                    }`}>
                      {isHotel ? <HotelIcon className="w-5 h-5" /> : <UtensilsCrossed className="w-5 h-5" />}
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-extrabold uppercase tracking-wider ${
                          isHotel ? 'bg-blue-950 text-blue-400 border border-blue-800' : 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                        }`}>
                          {b.booking_type}
                        </span>

                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-950/60 text-emerald-400 border border-emerald-800">
                          {b.status}
                        </span>

                        {/* Confirmation Code Pill */}
                        <button
                          type="button"
                          onClick={() => handleCopyCode(b.confirmation_code)}
                          title="Click to copy confirmation code"
                          className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-theme-raised text-cyan-300 border border-theme-subtle hover:border-cyan-500 transition-colors cursor-pointer"
                        >
                          <span>{b.confirmation_code}</span>
                          {copiedCode === b.confirmation_code ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3 text-slate-400" />
                          )}
                        </button>
                      </div>

                      <h4 className="text-base font-bold text-white tracking-tight">
                        {b.title}
                      </h4>

                      {/* Location & Address */}
                      {b.address && (
                        <p className="text-xs text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>{b.address}</span>
                        </p>
                      )}

                      {/* Details & Specs */}
                      <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-300">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>
                            {b.start_date.split('T')[0]}
                            {b.end_date ? ` → ${b.end_date.split('T')[0]}` : ''}
                          </span>
                        </span>

                        {b.time_slot && (
                          <span className="flex items-center gap-1.5 font-mono text-[11px] text-cyan-300">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            <span>{b.time_slot}</span>
                          </span>
                        )}

                        <span className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-slate-500" />
                          <span>{b.party_size} Guests</span>
                        </span>

                        {b.details?.room_type && (
                          <span className="text-[11px] text-blue-300 font-semibold">
                            Tier: {b.details.room_type}
                          </span>
                        )}

                        {b.details?.cuisine && (
                          <span className="text-[11px] text-cyan-300 font-semibold">
                            Cuisine: {b.details.cuisine}
                          </span>
                        )}
                      </div>

                      {/* Special Requests Note */}
                      {b.special_requests && (
                        <p className="text-[11px] text-slate-400 italic bg-theme-raised p-2 rounded-xl border border-theme-subtle mt-2 flex items-start gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                          <span>Note: {b.special_requests}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Price & Cancel */}
                  <div className="flex md:flex-col items-center md:items-end justify-between md:justify-start gap-3 border-t md:border-t-0 pt-3 md:pt-0 border-theme-subtle shrink-0">
                    {b.total_price != null ? (
                      <div className="text-left md:text-right">
                        <span className="text-[10px] text-slate-500 uppercase block font-mono">Confirmed Rate</span>
                        <span className="text-base font-mono font-bold text-emerald-400">
                          ${b.total_price.toLocaleString()} {b.currency}
                        </span>
                      </div>
                    ) : (
                      <div className="text-left md:text-right">
                        <span className="text-[10px] text-slate-500 uppercase block font-mono">Table Status</span>
                        <span className="text-xs font-mono font-semibold text-cyan-300">Guaranteed Seat</span>
                      </div>
                    )}

                    {canEdit && (
                      <Button
                        variant="ghost"
                        size="xs"
                        loading={isDeleting}
                        onClick={() => handleDeleteBooking(b.id)}
                        className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 gap-1 text-[11px]"
                      >
                        <Trash2 className="w-3 h-3" />
                        Cancel Reservation
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
