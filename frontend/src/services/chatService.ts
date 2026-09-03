import { apiClient } from './api';
import { ChatMessage } from '../types';

export const chatService = {
  async getMessages(tripId: string, limit: number = 50): Promise<ChatMessage[]> {
    return apiClient<ChatMessage[]>(`/chat/${tripId}/messages?limit=${limit}`);
  },

  async sendMessage(tripId: string, message: string): Promise<ChatMessage> {
    return apiClient<ChatMessage>(`/chat/${tripId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ trip_id: tripId, message }),
    });
  },

  async toggleReaction(tripId: string, messageId: string, emoji: string): Promise<{ message_id: string; reactions: Record<string, string[]> }> {
    return apiClient<{ message_id: string; reactions: Record<string, string[]> }>(`/chat/${tripId}/messages/${messageId}/reactions`, {
      method: 'POST',
      body: JSON.stringify({ message_id: messageId, emoji }),
    });
  },
};
