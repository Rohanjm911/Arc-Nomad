'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  Hotel as HotelIcon,
  UtensilsCrossed,
  Sparkles,
  MapPin,
  ShieldCheck,
  CreditCard,
  Layers,
  FileText
} from 'lucide-react';
import { Button } from '../ui/Button';
import {
  Trip,
  ItineraryDay,
  HotelCatalogItem,
  RestaurantCatalogItem,
  Booking,
  BookingType
} from '../../types';
import { bookingService } from '../../services/bookingService';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: {
    type: BookingType;
    hotel?: HotelCatalogItem;
    restaurant?: RestaurantCatalogItem;
  } | null;
  trip: Trip;
  days: ItineraryDay[];
  onSuccess: (booking: Booking) => void;
}

export const ReservationModal: React.FC<ReservationModalProps> = ({
  isOpen,
  onClose,
  target,
  trip,
  days,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  // Hotel fields
  const [selectedRoomIndex, setSelectedRoomIndex] = useState(0);
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  
  // Restaurant fields
  const [diningDate, setDiningDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');

  // Common fields
  const [partySize, setPartySize] = useState(2);
  const [specialRequests, setSpecialRequests] = useState('');
  const [addToItinerary, setAddToItinerary] = useState(true);
  const [selectedDayId, setSelectedDayId] = useState<string>('');

  useEffect(() => {
    if (isOpen && target) {
      setConfirmedBooking(null);
      setError(null);
      
      const tripStart = trip.start_date ? trip.start_date.split('T')[0] : '';
      const tripEnd = trip.end_date ? trip.end_date.split('T')[0] : '';
      
      if (target.type === 'HOTEL') {
        setSelectedRoomIndex(0);
        setCheckInDate(tripStart);
        setCheckOutDate(tripEnd || tripStart);
        setPartySize(2);
      } else if (target.type === 'RESTAURANT') {
        setDiningDate(tripStart);
        const firstTime = target.restaurant?.available_times?.[0] || '19:00';
        setSelectedTimeSlot(firstTime);
        setPartySize(2);
      }

      if (days && days.length > 0) {
        setSelectedDayId(days[0].id);
      }
      setSpecialRequests('');
    }
  }, [isOpen, target, trip, days]);

  if (!isOpen || !target) return null;

  const isHotel = target.type === 'HOTEL';
  const hotel = target.hotel;
  const restaurant = target.restaurant;

  // Calculate nights and price for hotel
  let nights = 1;
  if (checkInDate && checkOutDate) {
    const diff = new Date(checkOutDate).getTime() - new Date(checkInDate).getTime();
    nights = Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)));
  }

  const selectedRoom = hotel?.room_types?.[selectedRoomIndex] || {
    name: 'Standard Room',
    price_per_night: hotel?.price_per_night || 200,
    description: 'Comfortable guest room',
    capacity: 2,
  };

  const calculatedHotelTotal = (selectedRoom.price_per_night * nights);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isHotel && hotel) {
        const startIso = `${checkInDate}T15:00:00Z`;
        const endIso = `${checkOutDate}T11:00:00Z`;
        
        const booking = await bookingService.createBooking(trip.id, {
          trip_id: trip.id,
          booking_type: 'HOTEL',
          title: hotel.name,
          start_date: startIso,
          end_date: endIso,
          time_slot: '15:00 Check-in',
          party_size: partySize,
          total_price: calculatedHotelTotal,
          currency: hotel.currency || 'USD',
          address: hotel.address,
          special_requests: specialRequests,
          details: {
            hotel_id: hotel.id,
            room_type: selectedRoom.name,
            nights: nights,
            amenities: hotel.amenities,
            neighborhood: hotel.neighborhood,
          },
          add_to_itinerary: addToItinerary,
          itinerary_day_id: selectedDayId || undefined,
        });

        setConfirmedBooking(booking);
        onSuccess(booking);
      } else if (!isHotel && restaurant) {
        const startIso = `${diningDate}T${selectedTimeSlot || '19:00'}:00Z`;

        const booking = await bookingService.createBooking(trip.id, {
          trip_id: trip.id,
          booking_type: 'RESTAURANT',
          title: restaurant.name,
          start_date: startIso,
          time_slot: selectedTimeSlot,
          party_size: partySize,
          total_price: undefined,
          currency: 'USD',
          address: restaurant.address,
          special_requests: specialRequests,
          details: {
            restaurant_id: restaurant.id,
            cuisine: restaurant.cuisine,
            vibe: restaurant.vibe,
            neighborhood: restaurant.neighborhood,
            price_tier: restaurant.price_tier,
          },
          add_to_itinerary: addToItinerary,
          itinerary_day_id: selectedDayId || undefined,
        });

        setConfirmedBooking(booking);
        onSuccess(booking);
      }
    } catch (err: any) {
      console.error('Reservation failure:', err);
      setError(err.message || 'Failed to complete reservation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-theme-surface border border-theme-subtle rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto scrollbar-none">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-theme-raised text-theme-muted hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {confirmedBooking ? (
          /* Confirmation State View */
          <div className="text-center space-y-6 py-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <span className="inline-block px-3 py-1 rounded-full text-[11px] font-mono tracking-widest font-extrabold uppercase bg-blue-950 text-blue-400 border border-blue-800">
                Verified Reservation Confirmed
              </span>
              <h3 className="text-2xl font-bold text-white tracking-tight">
                {confirmedBooking.title}
              </h3>
              <p className="text-xs text-slate-400">
                {isHotel ? 'Your hotel stay is confirmed with guaranteed late check-in.' : 'Your dining table reservation has been locked with the venue.'}
              </p>
            </div>

            {/* Reference Badge Card */}
            <div className="p-4 rounded-2xl bg-theme-raised border border-theme-subtle text-left space-y-3 font-mono">
              <div className="flex items-center justify-between pb-2 border-b border-theme-subtle">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider">Confirmation Code</span>
                <span className="text-sm font-bold text-cyan-400 tracking-wider">
                  {confirmedBooking.confirmation_code}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Type</span>
                  <span className="text-white font-sans font-semibold">{confirmedBooking.booking_type}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Party</span>
                  <span className="text-white font-sans font-semibold">{confirmedBooking.party_size} Guests</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Date / Time</span>
                  <span className="text-white font-sans font-semibold">
                    {confirmedBooking.start_date.split('T')[0]} {confirmedBooking.time_slot ? `(${confirmedBooking.time_slot})` : ''}
                  </span>
                </div>
                {confirmedBooking.total_price != null && (
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Estimated Total</span>
                    <span className="text-emerald-400 font-sans font-bold">
                      ${confirmedBooking.total_price} {confirmedBooking.currency}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {addToItinerary && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-950/40 border border-blue-900/50 text-left text-xs text-blue-300">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Synced automatically into your trip day planner timetable.</span>
              </div>
            )}

            <div className="pt-2 flex gap-3">
              <Button
                variant="primary"
                size="md"
                onClick={onClose}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold"
              >
                Done & View in Ledger
              </Button>
            </div>
          </div>
        ) : (
          /* Booking Form View */
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
                isHotel 
                  ? 'bg-blue-950 border-blue-800 text-blue-400' 
                  : 'bg-cyan-950 border-cyan-800 text-cyan-400'
              }`}>
                {isHotel ? <HotelIcon className="w-6 h-6" /> : <UtensilsCrossed className="w-6 h-6" />}
              </div>
              <div>
                <span className={`text-[10px] font-extrabold uppercase tracking-widest ${
                  isHotel ? 'text-blue-400' : 'text-cyan-400'
                }`}>
                  {isHotel ? 'Instant Stay Reservation' : 'Table Reservation'}
                </span>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  {isHotel ? hotel?.name : restaurant?.name}
                </h3>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-slate-500" />
                  {isHotel ? `${hotel?.neighborhood}, ${hotel?.destination}` : `${restaurant?.neighborhood}, ${restaurant?.destination}`}
                </p>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-950/50 border border-red-800 text-xs text-red-300">
                {error}
              </div>
            )}

            {/* Hotel Specific: Room Selection */}
            {isHotel && hotel && hotel.room_types && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-400" />
                  Select Room Tier
                </label>
                <div className="space-y-2">
                  {hotel.room_types.map((room, idx) => {
                    const isSelected = selectedRoomIndex === idx;
                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedRoomIndex(idx)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-blue-950/60 border-blue-500 text-white shadow-sm'
                            : 'bg-theme-raised border-theme-subtle text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-white">{room.name}</span>
                          <span className="text-xs font-mono font-bold text-blue-400">
                            ${room.price_per_night} / night
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">{room.description}</p>
                        <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-500">
                          <span>Max {room.capacity} Guests</span>
                          <span>•</span>
                          <span>Instant Confirmation</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Hotel Specific: Dates */}
            {isHotel && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-400" />
                    Check-In Date
                  </label>
                  <input
                    type="date"
                    required
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-theme-raised border border-theme-subtle text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-400" />
                    Check-Out Date
                  </label>
                  <input
                    type="date"
                    required
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-theme-raised border border-theme-subtle text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Restaurant Specific: Date & Time Slots */}
            {!isHotel && restaurant && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                    Reservation Date
                  </label>
                  <input
                    type="date"
                    required
                    value={diningDate}
                    onChange={(e) => setDiningDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-theme-raised border border-theme-subtle text-white text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    Available Seating Times
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                    {restaurant.available_times?.map((slot) => {
                      const isSelected = selectedTimeSlot === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedTimeSlot(slot)}
                          className={`py-2 px-2 text-center rounded-xl text-xs font-mono font-bold transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-cyan-600 text-white border border-cyan-400'
                              : 'bg-theme-raised text-slate-300 border border-theme-subtle hover:border-slate-700'
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Party Size */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-400" />
                Number of Guests
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setPartySize(num)}
                    className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      partySize === num
                        ? 'bg-blue-600 text-white border border-blue-400'
                        : 'bg-theme-raised text-slate-300 border border-theme-subtle hover:border-slate-700'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Special Requests */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                Special Requests or Dietary Notes
              </label>
              <input
                type="text"
                placeholder={isHotel ? "e.g. Quiet room away from elevator, feather-free pillows" : "e.g. Anniversary celebration, window booth, nut allergy"}
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-theme-raised border border-theme-subtle text-white text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Sync to Itinerary Checkbox */}
            <div className="p-3.5 rounded-2xl bg-theme-raised border border-theme-subtle space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <div>
                    <span className="text-xs font-bold text-white block">Sync directly to Day Planner</span>
                    <span className="text-[11px] text-slate-400 block">
                      Auto-creates an itinerary entry for your reservation
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={addToItinerary}
                  onChange={(e) => setAddToItinerary(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-slate-900 border-slate-700 cursor-pointer"
                />
              </div>

              {addToItinerary && days && days.length > 0 && (
                <div className="pt-2 border-t border-theme-subtle">
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    Assign to Trip Day:
                  </label>
                  <select
                    value={selectedDayId}
                    onChange={(e) => setSelectedDayId(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-theme-subtle text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    {days.map((day) => (
                      <option key={day.id} value={day.id}>
                        Day {day.day_number} {day.date ? `(${day.date.split('T')[0]})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Hotel Cost Summary */}
            {isHotel && (
              <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-900/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-mono">Estimated Total</span>
                  <span className="text-xs text-slate-300">{nights} Night(s) × ${selectedRoom.price_per_night}</span>
                </div>
                <div className="text-right">
                  <span className="text-base font-mono font-bold text-blue-400">
                    ${calculatedHotelTotal} {hotel?.currency || 'USD'}
                  </span>
                  <span className="text-[10px] text-slate-500 block">Pay at hotel or card on file</span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={loading}
                className={isHotel ? "bg-blue-600 hover:bg-blue-500 text-white font-bold" : "bg-cyan-600 hover:bg-cyan-500 text-white font-bold"}
              >
                {isHotel ? 'Confirm Stay Reservation' : 'Confirm Table Booking'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
