import { apiClient } from './api';
import { ItineraryDay, ItineraryItem } from '../types';

export const itineraryService = {
  async getItineraryDays(tripId: string): Promise<ItineraryDay[]> {
    return apiClient<ItineraryDay[]>(`/itinerary/${tripId}/days`);
  },

  async createDay(tripId: string, data: { day_number: number; date?: string; notes?: string }): Promise<ItineraryDay> {
    return apiClient<ItineraryDay>(`/itinerary/${tripId}/days`, {
      method: 'POST',
      body: JSON.stringify({ ...data, trip_id: tripId }),
    });
  },

  async createItem(data: {
    day_id: string;
    title: string;
    description?: string;
    location_name?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    start_time?: string;
    end_time?: string;
    category?: string;
    estimated_cost?: number;
    currency?: string;
    order_index?: number;
    notes?: string;
    is_completed?: boolean;
  }): Promise<ItineraryItem> {
    return apiClient<ItineraryItem>('/itinerary/items', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateItem(itemId: string, data: Partial<ItineraryItem>): Promise<ItineraryItem> {
    return apiClient<ItineraryItem>(`/itinerary/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteItem(itemId: string): Promise<{ message: string }> {
    return apiClient<{ message: string }>(`/itinerary/items/${itemId}`, {
      method: 'DELETE',
    });
  },

  async reorderItems(items: { item_id: string; day_id: string; order_index: number }[]): Promise<{ message: string }> {
    return apiClient<{ message: string }>('/itinerary/reorder', {
      method: 'POST',
      body: JSON.stringify({ items }),
    });
  },

  async aiGenerateItinerary(data: {
    trip_id: string;
    destination: string;
    days_count: number;
    travel_style?: string;
    interests?: string[];
    budget_tier?: string;
    pace?: string;
    custom_notes?: string;
  }): Promise<ItineraryDay[]> {
    return apiClient<ItineraryDay[]>('/itinerary/ai-generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
