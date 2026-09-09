'use client';

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
} from 'recharts';
import { ExpenseAnalyticsSummary } from '../../types';
import { Card } from '../ui/Card';

interface ExpenseChartsProps {
  analytics: ExpenseAnalyticsSummary;
}

const CATEGORY_COLORS: Record<string, string> = {
  FLIGHTS: '#2563EB',   // Blue
  HOTEL: '#7C3AED',     // Purple
  FOOD: '#0D9488',      // Teal
  TRANSPORT: '#0284C7', // Sky
  ACTIVITIES: '#10B981',// Emerald
  SHOPPING: '#D97706',  // Amber
  TICKETS: '#4F46E5',   // Indigo
  OTHER: '#64748B',     // Slate
};

export const ExpenseCharts: React.FC<ExpenseChartsProps> = ({ analytics }) => {
  const pieData = analytics.spending_by_category.map((cat) => ({
    name: cat.category,
    value: Number(cat.amount),
    percentage: cat.percentage,
    color: CATEGORY_COLORS[cat.category] || '#64748B',
  }));

  const barData = analytics.spending_by_member.map((mb) => ({
    name: mb.user_name.split(' ')[0],
    Paid: Number(mb.total_paid),
    Share: Number(mb.total_share),
  }));

  const budgetUsage = Math.min(100, analytics.budget_usage_percentage);
  const isOverBudget = analytics.total_spent > analytics.trip_budget && analytics.trip_budget > 0;

  return (
    <div className="space-y-6">
      {/* Top Metric Cards (Solid surfaces, crisp numbers) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 bg-theme-surface border border-theme-subtle shadow-xl rounded-3xl">
          <span className="text-xs font-bold text-theme-muted uppercase tracking-wider">Total Spent</span>
          <div className="text-2xl font-extrabold text-theme-primary mt-1">
            {analytics.currency} {Number(analytics.total_spent).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-theme-muted mt-1">Logged across all trip expenses</p>
        </Card>

        <Card className="p-5 bg-theme-surface border border-theme-subtle shadow-xl rounded-3xl">
          <span className="text-xs font-bold text-theme-muted uppercase tracking-wider">Trip Budget</span>
          <div className="text-2xl font-extrabold text-theme-accent mt-1">
            {analytics.currency} {Number(analytics.trip_budget).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="w-full bg-theme-surface-raised rounded-full h-2 mt-2 overflow-hidden border border-theme-subtle">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isOverBudget ? 'bg-rose-500' : budgetUsage > 80 ? 'bg-amber-500' : 'bg-theme-accent'
              }`}
              style={{ width: `${budgetUsage}%` }}
            />
          </div>
        </Card>

        <Card className="p-5 bg-theme-surface border border-theme-subtle shadow-xl rounded-3xl">
          <span className="text-xs font-bold text-theme-muted uppercase tracking-wider">Remaining Budget</span>
          <div
            className={`text-2xl font-extrabold mt-1 ${
              isOverBudget ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            {analytics.currency} {Number(analytics.remaining_budget).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-theme-muted mt-1">
            {isOverBudget ? '⚠️ Budget limit exceeded' : `${budgetUsage.toFixed(1)}% of budget utilized`}
          </p>
        </Card>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending by Category Pie */}
        <Card className="p-5 bg-theme-surface border border-theme-subtle shadow-xl rounded-3xl flex flex-col justify-between">
          <h3 className="text-xs font-bold text-theme-primary uppercase tracking-wider mb-2">
            Spending by Category
          </h3>

          {pieData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-theme-muted">
              No expense categories logged yet.
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [`${analytics.currency} ${Number(val).toFixed(2)}`, 'Amount']}
                    contentStyle={{ backgroundColor: 'var(--surface-color, #0F172A)', borderColor: 'var(--border-subtle, #334155)', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-3 border-t border-theme-subtle">
            {pieData.map((cat) => (
              <span key={cat.name} className="flex items-center gap-1.5 text-[11px] text-theme-muted">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: cat.color }} />
                {cat.name} ({cat.percentage}%)
              </span>
            ))}
          </div>
        </Card>

        {/* Member Spending vs Share Bar Chart */}
        <Card className="p-5 bg-theme-surface border border-theme-subtle shadow-xl rounded-3xl flex flex-col justify-between">
          <h3 className="text-xs font-bold text-theme-primary uppercase tracking-wider mb-2">
            Member Paid vs Fair Share
          </h3>

          {barData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-theme-muted">
              No member transactions logged yet.
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} />
                  <YAxis stroke="#94A3B8" fontSize={11} />
                  <Tooltip
                    formatter={(val: any) => [`${analytics.currency} ${Number(val).toFixed(2)}`]}
                    contentStyle={{ backgroundColor: 'var(--surface-color, #0F172A)', borderColor: 'var(--border-subtle, #334155)', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="Paid" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Share" fill="#10B981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <p className="text-[11px] text-theme-muted pt-3 border-t border-theme-subtle">
            Compares total out-of-pocket amount paid vs fair calculated share per traveler.
          </p>
        </Card>
      </div>
    </div>
  );
};
