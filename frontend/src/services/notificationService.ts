import { apiClient } from './api';
import { Notification } from '../types';

export const notificationService = {
  async getNotifications(limit: number = 30): Promise<Notification[]> {
    return apiClient<Notification[]>(`/notifications/?limit=${limit}`);
  },

  async getUnreadCount(): Promise<{ unread_count: number }> {
    return apiClient<{ unread_count: number }>('/notifications/unread-count');
  },

  async markAsRead(notificationId: string): Promise<Notification> {
    return apiClient<Notification>(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  },

  async markAllAsRead(): Promise<{ message: string }> {
    return apiClient<{ message: string }>('/notifications/mark-all-read', {
      method: 'PUT',
    });
  },
};
