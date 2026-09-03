import { apiClient } from './api';
import { User, FriendRequest } from '../types';

export const friendService = {
  async getFriends(): Promise<User[]> {
    return apiClient<User[]>('/friends/');
  },

  async getFriendRequests(): Promise<{ incoming: FriendRequest[]; outgoing: FriendRequest[] }> {
    return apiClient<{ incoming: FriendRequest[]; outgoing: FriendRequest[] }>('/friends/requests');
  },

  async sendFriendRequest(usernameOrEmail: string): Promise<FriendRequest> {
    return apiClient<FriendRequest>('/friends/request', {
      method: 'POST',
      body: JSON.stringify({ receiver_username_or_email: usernameOrEmail }),
    });
  },

  async acceptRequest(requestId: string): Promise<{ message: string }> {
    return apiClient<{ message: string }>(`/friends/request/${requestId}/accept`, {
      method: 'POST',
    });
  },

  async rejectRequest(requestId: string): Promise<{ message: string }> {
    return apiClient<{ message: string }>(`/friends/request/${requestId}/reject`, {
      method: 'POST',
    });
  },

  async cancelRequest(requestId: string): Promise<{ message: string }> {
    return apiClient<{ message: string }>(`/friends/request/${requestId}/cancel`, {
      method: 'POST',
    });
  },

  async removeFriend(friendId: string): Promise<{ message: string }> {
    return apiClient<{ message: string }>(`/friends/${friendId}/remove`, {
      method: 'DELETE',
    });
  },
};
