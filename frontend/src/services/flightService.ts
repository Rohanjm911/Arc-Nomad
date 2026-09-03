import { apiClient } from './api';
import { Flight } from '../types';

export const flightService = {
  async getFlights(tripId: string): Promise<Flight[]> {
    return apiClient<Flight[]>(`/flights/${tripId}`);
  },

  async createFlight(data: {
    trip_id: string;
    user_id?: string;
    airline: string;
    flight_number: string;
    departure_airport: string;
    arrival_airport: string;
    departure_city?: string;
    arrival_city?: string;
    departure_time: string;
    arrival_time: string;
    terminal?: string;
    gate?: string;
    status?: string;
    seat?: string;
    booking_reference?: string;
    notes?: string;
  }): Promise<Flight> {
    return apiClient<Flight>('/flights/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateFlight(flightId: string, data: Partial<Flight>): Promise<Flight> {
    return apiClient<Flight>(`/flights/${flightId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteFlight(flightId: string): Promise<{ message: string }> {
    return apiClient<{ message: string }>(`/flights/${flightId}`, {
      method: 'DELETE',
    });
  },

  async simulateStatus(flightId: string, data: {
    new_status: string;
    gate?: string;
    terminal?: string;
    delay_minutes?: number;
    message?: string;
  }): Promise<Flight> {
    return apiClient<Flight>(`/flights/${flightId}/simulate-status`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
