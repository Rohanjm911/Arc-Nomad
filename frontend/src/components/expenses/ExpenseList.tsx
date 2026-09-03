'use client';

import React, { useState } from 'react';
import { Utensils, Hotel, Plane, Mountain, ShoppingBag, Ticket, HelpCircle, Trash2, Edit3, PlusCircle, Users, FileSpreadsheet, Calculator } from 'lucide-react';
import { Expense, ExpenseAnalyticsSummary, Trip, ExpenseCategoryType } from '../../types';
import { expenseService } from '../../services/expenseService';
import { exportService } from '../../services/exportService';
import { AddExpenseModal } from './AddExpenseModal';
import { SettlementMatrix } from './SettlementMatrix';
import { ExpenseCharts } from './ExpenseCharts';
import { CurrencyConverter } from './CurrencyConverter';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';

interface ExpenseListProps {
  trip: Trip;
  expenses: Expense[];
  analytics: ExpenseAnalyticsSummary | null;
  onExpensesUpdated: () => void;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
  trip,
  expenses,
  analytics,
  onExpensesUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'LEDGER' | 'ANALYTICS' | 'SETTLEMENTS' | 'CONVERTER'>('LEDGER');
  const [addExpenseModalOpen, setAddExpenseModalOpen] = useState(false);
  const [preloadedAmount, setPreloadedAmount] = useState<number | undefined>(undefined);
  const [preloadedNote, setPreloadedNote] = useState<string | undefined>(undefined);

  const canEdit =
    trip.user_role === 'OWNER' ||
    trip.user_role === 'EDITOR' ||
    trip.user_role === 'EXPENSE_MANAGER';

  const getCategoryIcon = (category: ExpenseCategoryType) => {
    switch (category) {
      case 'FOOD':
        return <Utensils className="w-4 h-4 text-amber-400" />;
      case 'HOTEL':
        return <Hotel className="w-4 h-4 text-purple-400" />;
      case 'FLIGHTS':
        return <Plane className="w-4 h-4 text-indigo-400" />;
      case 'ACTIVITIES':
        return <Mountain className="w-4 h-4 text-emerald-400" />;
      case 'SHOPPING':
        return <ShoppingBag className="w-4 h-4 text-pink-400" />;
      case 'TICKETS':
        return <Ticket className="w-4 h-4 text-blue-400" />;
      default:
        return <HelpCircle className="w-4 h-4 text-slate-400" />;
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    try {
      await expenseService.deleteExpense(expenseId);
      onExpensesUpdated();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Subtabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Tab pills: Ledger, Analytics, Debt Settlements, Currency Converter */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900 border border-slate-800 overflow-x-auto">
          {(['LEDGER', 'ANALYTICS', 'SETTLEMENTS', 'CONVERTER'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeTab === tab
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab === 'LEDGER'
                ? 'Expense Log'
                : tab === 'ANALYTICS'
                ? 'Spending Visuals'
                : tab === 'SETTLEMENTS'
                ? 'Settlement Ledger'
                : '💱 Currency Converter'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportService.downloadExcel(trip.id, trip.title)}
            className="text-xs gap-1.5 border-emerald-500/30 text-emerald-400 hover:bg-emerald-950/20"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Excel Export
          </Button>

          {canEdit && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setAddExpenseModalOpen(true)}
              className="gap-1.5 text-xs shadow-indigo-600/20"
            >
              <PlusCircle className="w-4 h-4" />
              Add Expense
            </Button>
          )}
        </div>
      </div>

      {/* Tab 1: Expense Ledger */}
      {activeTab === 'LEDGER' && (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
          {expenses.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400 space-y-2">
              <p>No expenses recorded for this trip yet.</p>
              {canEdit && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setAddExpenseModalOpen(true)}
                  className="gap-1.5 text-xs mt-2"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Add First Expense
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Description</th>
                    <th className="py-3.5 px-4">Paid By</th>
                    <th className="py-3.5 px-4">Split</th>
                    <th className="py-3.5 px-4 text-right">Amount</th>
                    {canEdit && <th className="py-3.5 px-4 text-center">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {expenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 text-slate-400">
                        {new Date(exp.expense_date).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
                          {getCategoryIcon(exp.category)}
                          {exp.category}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-100">{exp.description}</span>
                        {exp.notes && <p className="text-[11px] text-slate-500 mt-0.5">{exp.notes}</p>}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Avatar
                            src={exp.payer?.avatar_url}
                            name={exp.payer?.full_name || 'Member'}
                            size="xs"
                          />
                          <span className="text-slate-300">{exp.payer?.full_name || 'Member'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="neutral" size="sm">
                          {exp.split_type} ({exp.participants?.length || 0})
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right font-extrabold text-white font-mono text-sm">
                        {exp.currency} {Number(exp.amount).toFixed(2)}
                      </td>
                      {canEdit && (
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleDeleteExpense(exp.id)}
                            className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 transition-colors"
                            title="Delete Expense"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Visual Analytics */}
      {activeTab === 'ANALYTICS' && analytics && (
        <ExpenseCharts analytics={analytics} />
      )}

      {/* Tab 3: Debt Settlements */}
      {activeTab === 'SETTLEMENTS' && analytics && (
        <SettlementMatrix
          tripId={trip.id}
          currency={trip.currency}
          memberBalances={analytics.spending_by_member}
          suggestedSettlements={analytics.suggested_settlements}
          canEdit={canEdit}
          onSettlementCompleted={onExpensesUpdated}
        />
      )}

      {/* Tab 4: Global Currency Converter */}
      {activeTab === 'CONVERTER' && (
        <CurrencyConverter
          defaultBaseCurrency={trip.currency}
          onApplyToExpense={(convertedAmount, sourceDetail) => {
            setPreloadedAmount(convertedAmount);
            setPreloadedNote(sourceDetail);
            setAddExpenseModalOpen(true);
          }}
        />
      )}

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={addExpenseModalOpen}
        onClose={() => {
          setAddExpenseModalOpen(false);
          setPreloadedAmount(undefined);
          setPreloadedNote(undefined);
        }}
        trip={trip}
        onExpenseAdded={onExpensesUpdated}
        initialAmount={preloadedAmount}
        initialNote={preloadedNote}
      />
    </div>
  );
};
