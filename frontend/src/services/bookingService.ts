import { apiClient } from './api';
import {
  Booking,
  BookingCreateInput,
  HotelCatalogItem,
  RestaurantCatalogItem,
  NearbyHotelResult,
  NearbyRestaurantResult
} from '../types';

export const bookingService = {
  async getBookings(tripId: string): Promise<Booking[]> {
    return apiClient<Booking[]>(`/trips/${tripId}/bookings`);
  },

  async createBooking(tripId: string, data: BookingCreateInput): Promise<Booking> {
    return apiClient<Booking>(`/trips/${tripId}/bookings`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async deleteBooking(tripId: string, bookingId: string): Promise<{ message: string; id: string }> {
    return apiClient<{ message: string; id: string }>(`/trips/${tripId}/bookings/${bookingId}`, {
      method: 'DELETE',
    });
  },

  async browseHotels(destination?: string): Promise<HotelCatalogItem[]> {
    const query = destination ? `?destination=${encodeURIComponent(destination)}` : '';
    return apiClient<HotelCatalogItem[]>(`/catalog/hotels${query}`);
  },

  async browseRestaurants(destination?: string): Promise<RestaurantCatalogItem[]> {
    const query = destination ? `?destination=${encodeURIComponent(destination)}` : '';
    return apiClient<RestaurantCatalogItem[]>(`/catalog/restaurants${query}`);
  },

  async browseNearbyHotels(tripId: string): Promise<NearbyHotelResult[]> {
    return apiClient<NearbyHotelResult[]>(`/catalog/hotels/nearby?trip_id=${encodeURIComponent(tripId)}`);
  },

  async browseNearbyRestaurants(tripId: string): Promise<NearbyRestaurantResult[]> {
    return apiClient<NearbyRestaurantResult[]>(`/catalog/restaurants/nearby?trip_id=${encodeURIComponent(tripId)}`);
  },
};
