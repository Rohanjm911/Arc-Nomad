'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { PlusCircle, Users, DollarSign, AlertCircle, Calculator, Check } from 'lucide-react';
import { Trip, TripMember, SplitType, ExpenseCategoryType } from '../../types';
import { expenseService } from '../../services/expenseService';
import { currencyService, FALLBACK_CURRENCIES } from '../../services/currencyService';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Avatar } from '../ui/Avatar';
import { CurrencySelect } from '../ui/CurrencySelect';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
  onExpenseAdded: () => void;
  initialAmount?: number;
  initialNote?: string;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  trip,
  onExpenseAdded,
  initialAmount,
  initialNote,
}) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategoryType>('FOOD');
  const [paidByUserId, setPaidByUserId] = useState<string>(trip.members[0]?.user_id || '');
  const [expenseDate, setExpenseDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [splitType, setSplitType] = useState<SplitType>('EQUAL');
  const [selectedMembers, setSelectedMembers] = useState<string[]>(
    trip.members.map((m) => m.user_id)
  );
  const [customShares, setCustomShares] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Currency Converter Assistant state
  const [showConverter, setShowConverter] = useState(false);
  const [foreignCurrency, setForeignCurrency] = useState('EUR');
  const [foreignAmount, setForeignAmount] = useState('');
  const [rates, setRates] = useState<Record<string, number>>({});

  useEffect(() => {
    if (initialAmount) setAmount(initialAmount.toString());
    if (initialNote) setNotes(initialNote);
  }, [initialAmount, initialNote, isOpen]);

  useEffect(() => {
    if (showConverter && Object.keys(rates).length === 0) {
      currencyService
        .getExchangeRates(trip.currency)
        .then((res) => setRates(res.rates))
        .catch((e) => console.warn(e));
    }
  }, [showConverter, trip.currency, rates]);

  const foreignNum = parseFloat(foreignAmount) || 0;
  const convertedFromForeign = useMemo(() => {
    if (!foreignNum) return { convertedAmount: 0, rate: 1.0 };
    return currencyService.convert(foreignNum, foreignCurrency, trip.currency, rates);
  }, [foreignNum, foreignCurrency, trip.currency, rates]);

  const handleApplyConversion = () => {
    if (convertedFromForeign.convertedAmount > 0) {
      setAmount(convertedFromForeign.convertedAmount.toFixed(2));
      const convNote = `[Paid ${foreignNum} ${foreignCurrency} (1 ${foreignCurrency} = ${convertedFromForeign.rate} ${trip.currency})]`;
      setNotes((prev) => (prev ? `${prev}\n${convNote}` : convNote));
      setShowConverter(false);
    }
  };

  const toggleMember = (userId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleShareChange = (userId: string, val: string) => {
    setCustomShares((prev) => ({ ...prev, [userId]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!description.trim() || isNaN(numAmount) || numAmount <= 0) {
      setError('Please provide a valid description and positive amount.');
      return;
    }

    if (selectedMembers.length === 0) {
      setError('Select at least one participating traveler for this expense.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const participantsPayload = selectedMembers.map((userId) => {
        if (splitType === 'PERCENTAGE') {
          return {
            user_id: userId,
            share_percentage: parseFloat(customShares[userId] || '0'),
          };
        } else if (splitType === 'EXACT') {
          return {
            user_id: userId,
            share_amount: parseFloat(customShares[userId] || '0'),
          };
        }
        return { user_id: userId };
      });

      await expenseService.createExpense({
        trip_id: trip.id,
        paid_by_user_id: paidByUserId || trip.owner_id,
        amount: numAmount,
        currency: trip.currency,
        category,
        description,
        expense_date: new Date(expenseDate).toISOString(),
        split_type: splitType,
        notes: notes || undefined,
        participants: participantsPayload,
      });

      onExpenseAdded();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add expense.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Trip Expense"
      subtitle="Record payment and calculate automated fair split"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Expense Description"
            placeholder="e.g. Omakase Dinner in Ginza"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <div>
            <Input
              label={`Amount (${trip.currency})`}
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <div className="mt-1.5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowConverter(!showConverter)}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Calculator className="w-3 h-3" />
                <span>{showConverter ? 'Hide Currency Tool' : `Paid in foreign currency?`}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Currency Conversion Assistant Drawer */}
        {showConverter && (
          <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-cyan-500/30 space-y-2.5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <span className="text-cyan-300 flex items-center gap-1">
                <Calculator className="w-3 h-3" /> Foreign Currency Converter
              </span>
              <span className="font-mono text-cyan-400">
                1 {foreignCurrency} = {convertedFromForeign.rate} {trip.currency}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              <CurrencySelect
                value={foreignCurrency}
                onChange={setForeignCurrency}
                size="sm"
                className="w-full sm:w-auto"
              />

              <div className="relative w-full sm:flex-1">
                <Input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="Amount paid abroad"
                  value={foreignAmount}
                  onChange={(e) => setForeignAmount(e.target.value)}
                  className="text-xs bg-slate-900 font-mono"
                />
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleApplyConversion}
                disabled={!foreignNum}
                className="w-full sm:w-auto shrink-0 text-xs gap-1 border-emerald-500/40 text-emerald-400 hover:bg-emerald-950/30 font-bold cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                Apply ({trip.currency} {convertedFromForeign.convertedAmount.toFixed(2)})
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategoryType)}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              <option value="FOOD">Food & Drinks</option>
              <option value="HOTEL">Hotel & Lodging</option>
              <option value="FLIGHTS">Flights</option>
              <option value="TRANSPORT">Transport</option>
              <option value="ACTIVITIES">Activities</option>
              <option value="TICKETS">Tickets & Entry</option>
              <option value="SHOPPING">Shopping</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Paid By
            </label>
            <select
              value={paidByUserId}
              onChange={(e) => setPaidByUserId(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              {trip.members.map((m) => (
                <option key={m.id} value={m.user_id}>
                  {m.user?.full_name || 'Member'}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Date"
            type="date"
            value={expenseDate}
            onChange={(e) => setExpenseDate(e.target.value)}
            required
          />
        </div>

        {/* Split Configuration */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Split Type
            </span>
            <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-700">
              {(['EQUAL', 'PERCENTAGE', 'EXACT'] as SplitType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSplitType(type)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    splitType === type
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {type === 'EQUAL' ? 'Split Equally' : type === 'PERCENTAGE' ? 'By %' : 'Exact ($)'}
                </button>
              ))}
            </div>
          </div>

          {/* Participant Matrix */}
          <div className="space-y-2 pt-1">
            {trip.members.map((member) => {
              const u = member.user;
              const isSelected = selectedMembers.includes(member.user_id);

              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80"
                >
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleMember(member.user_id)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 bg-slate-800 border-slate-700"
                    />
                    <Avatar src={u?.avatar_url} name={u?.full_name || 'Member'} size="xs" />
                    <span className="text-xs font-semibold text-slate-200">
                      {u?.full_name}
                    </span>
                  </label>

                  {isSelected && splitType !== 'EQUAL' && (
                    <div className="w-28">
                      <Input
                        placeholder={splitType === 'PERCENTAGE' ? '%' : trip.currency}
                        type="number"
                        step="0.01"
                        value={customShares[member.user_id] || ''}
                        onChange={(e) => handleShareChange(member.user_id, e.target.value)}
                        className="py-1 px-2 text-xs"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <Input
          label="Notes / Receipt Details (Optional)"
          placeholder="e.g. Split table between 3 of us"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        {error && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" loading={loading}>
            Save Expense
          </Button>
        </div>
      </form>
    </Modal>
  );
};
