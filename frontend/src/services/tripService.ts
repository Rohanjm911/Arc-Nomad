import { apiClient } from './api';
import { Trip, TripSummary, TripMember, WeatherData } from '../types';

export const tripService = {
  async getTrips(statusFilter?: string): Promise<TripSummary[]> {
    const query = statusFilter ? `?status_filter=${statusFilter}` : '';
    return apiClient<TripSummary[]>(`/trips/${query}`);
  },

  async geocode(query: string): Promise<{ name: string; latitude: number; longitude: number; country?: string; display_name: string }[]> {
    return apiClient<{ name: string; latitude: number; longitude: number; country?: string; display_name: string }[]>(
      `/trips/geocode?query=${encodeURIComponent(query)}`
    );
  },

  async getTrip(tripId: string): Promise<Trip> {
    return apiClient<Trip>(`/trips/${tripId}`);
  },

  async createTrip(data: {
    title: string;
    description?: string;
    destination: string;
    destination_lat?: number;
    destination_lng?: number;
    start_date: string;
    end_date: string;
    budget?: number;
    currency?: string;
    cover_image?: string;
    status?: string;
  }): Promise<Trip> {
    return apiClient<Trip>('/trips/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateTrip(tripId: string, data: Partial<Trip>): Promise<Trip> {
    return apiClient<Trip>(`/trips/${tripId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteTrip(tripId: string): Promise<{ message: string }> {
    return apiClient<{ message: string }>(`/trips/${tripId}`, {
      method: 'DELETE',
    });
  },

  async inviteMember(tripId: string, data: { user_id_or_email: string; role: string }): Promise<TripMember> {
    return apiClient<TripMember>(`/trips/${tripId}/members`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateMemberRole(tripId: string, userId: string, role: string): Promise<TripMember> {
    return apiClient<TripMember>(`/trips/${tripId}/members/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  },

  async removeMember(tripId: string, userId: string): Promise<{ message: string }> {
    return apiClient<{ message: string }>(`/trips/${tripId}/members/${userId}`, {
      method: 'DELETE',
    });
  },

  async getTripWeather(tripId: string): Promise<WeatherData> {
    return apiClient<WeatherData>(`/trips/${tripId}/weather`);
  },
};
