import { apiClient } from './api';
import { Recommendation } from '../types';

export const recommendationService = {
  async getRecommendations(tripId: string): Promise<Recommendation[]> {
    return apiClient<Recommendation[]>(`/recommendations/${tripId}`);
  },

  async exploreRecommendations(data: {
    trip_id: string;
    destination: string;
    category?: string;
    interests?: string[];
    travel_style?: string;
    limit?: number;
  }): Promise<{ destination: string; recommendations: Recommendation[] }> {
    return apiClient<{ destination: string; recommendations: Recommendation[] }>('/recommendations/explore', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async saveRecommendation(data: {
    trip_id: string;
    name: string;
    category: string;
    description?: string;
    rating?: number;
    price_level?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    image_url?: string;
    reason?: string;
    tags?: string[];
  }): Promise<Recommendation> {
    return apiClient<Recommendation>('/recommendations/save', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async addToItinerary(data: {
    recommendation_id: string;
    day_id: string;
    start_time?: string;
    end_time?: string;
    estimated_cost?: number;
  }): Promise<{ message: string; item_id: string }> {
    return apiClient<{ message: string; item_id: string }>('/recommendations/add-to-itinerary', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
