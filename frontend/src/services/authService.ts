import { apiClient, setAuthToken, removeAuthToken } from './api';
import { AuthResponse, User } from '../types';

export const authService = {
  async register(data: {
    email: string;
    username: string;
    password: string;
    full_name: string;
    travel_interests?: string[];
    travel_style?: string;
    budget_preference?: string;
  }): Promise<AuthResponse> {
    const res = await apiClient<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setAuthToken(res.access_token);
    return res;
  },

  async login(data: { email_or_username: string; password: string }): Promise<AuthResponse> {
    const res = await apiClient<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setAuthToken(res.access_token);
    return res;
  },

  async demoLogin(username: string = 'alex_nomad'): Promise<AuthResponse> {
    const res = await apiClient<AuthResponse>(`/auth/demo-login?username=${username}`, {
      method: 'POST',
    });
    setAuthToken(res.access_token);
    return res;
  },

  async getMe(): Promise<User> {
    return apiClient<User>('/auth/me');
  },

  logout() {
    removeAuthToken();
  },

  async updateProfile(data: Partial<User> & { password?: string }): Promise<User> {
    return apiClient<User>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async searchUsers(query: string): Promise<User[]> {
    return apiClient<User[]>(`/users/search?q=${encodeURIComponent(query)}`);
  },
};
