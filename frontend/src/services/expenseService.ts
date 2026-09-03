import { apiClient } from './api';
import { Expense, ExpenseAnalyticsSummary, Settlement } from '../types';

export const expenseService = {
  async getExpenses(tripId: string): Promise<Expense[]> {
    return apiClient<Expense[]>(`/expenses/${tripId}`);
  },

  async getAnalytics(tripId: string): Promise<ExpenseAnalyticsSummary> {
    return apiClient<ExpenseAnalyticsSummary>(`/expenses/${tripId}/analytics`);
  },

  async createExpense(data: {
    trip_id: string;
    paid_by_user_id: string;
    amount: number;
    currency?: string;
    category: string;
    description: string;
    expense_date: string;
    split_type: string;
    receipt_url?: string;
    notes?: string;
    participants?: { user_id: string; share_amount?: number; share_percentage?: number }[];
  }): Promise<Expense> {
    return apiClient<Expense>('/expenses/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateExpense(expenseId: string, data: Partial<Expense>): Promise<Expense> {
    return apiClient<Expense>(`/expenses/${expenseId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteExpense(expenseId: string): Promise<{ message: string }> {
    return apiClient<{ message: string }>(`/expenses/${expenseId}`, {
      method: 'DELETE',
    });
  },

  async recordSettlement(data: {
    trip_id: string;
    receiver_id: string;
    amount: number;
    currency?: string;
    notes?: string;
  }): Promise<Settlement> {
    return apiClient<Settlement>('/expenses/settle', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
