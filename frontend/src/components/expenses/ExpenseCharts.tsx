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
        <Card className="p-4 bg-slate-900 border-slate-800">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Spent</span>
          <div className="text-2xl font-extrabold text-white mt-1">
            {analytics.currency} {Number(analytics.total_spent).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Logged across all trip expenses</p>
        </Card>

        <Card className="p-4 bg-slate-900 border-slate-800">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Trip Budget</span>
          <div className="text-2xl font-extrabold text-blue-400 mt-1">
            {analytics.currency} {Number(analytics.trip_budget).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2 mt-2 overflow-hidden border border-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isOverBudget ? 'bg-red-500' : budgetUsage > 80 ? 'bg-amber-500' : 'bg-blue-600'
              }`}
              style={{ width: `${budgetUsage}%` }}
            />
          </div>
        </Card>

        <Card className="p-4 bg-slate-900 border-slate-800">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Remaining Budget</span>
          <div
            className={`text-2xl font-extrabold mt-1 ${
              isOverBudget ? 'text-red-400' : 'text-emerald-400'
            }`}
          >
            {analytics.currency} {Number(analytics.remaining_budget).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {isOverBudget ? '⚠️ Budget limit exceeded' : `${budgetUsage.toFixed(1)}% of budget utilized`}
          </p>
        </Card>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending by Category Pie */}
        <Card className="p-5 bg-slate-900 border-slate-800 flex flex-col justify-between">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            Spending by Category
          </h3>

          {pieData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-slate-500">
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
                    contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#334155', borderRadius: '10px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800">
            {pieData.map((cat) => (
              <span key={cat.name} className="flex items-center gap-1 text-[11px] text-slate-300">
                <span className="w-2.5 h-2.5 rounded" style={{ backgroundColor: cat.color }} />
                {cat.name} ({cat.percentage}%)
              </span>
            ))}
          </div>
        </Card>

        {/* Member Spending vs Share Bar Chart */}
        <Card className="p-5 bg-slate-900 border-slate-800 flex flex-col justify-between">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            Member Paid vs Fair Share
          </h3>

          {barData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-slate-500">
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
                    contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#334155', borderRadius: '10px', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="Paid" fill="#2563EB" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Share" fill="#0D9488" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-800">
            Compares total out-of-pocket amount paid vs fair calculated share per traveler.
          </p>
        </Card>
      </div>
    </div>
  );
};
