'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ArrowRightLeft, DollarSign, RefreshCw, TrendingUp, Sparkles } from 'lucide-react';
import {
  currencyService,
  FALLBACK_CURRENCIES,
  CurrencyItem,
  getCurrencySymbol,
} from '../../services/currencyService';
import { Card } from '../ui/Card';

interface QuickCurrencyConverterProps {
  defaultFrom?: string;
  defaultTo?: string;
}

const POPULAR_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'SGD', 'INR', 'AED', 'THB', 'KRW'];

export const QuickCurrencyConverter: React.FC<QuickCurrencyConverterProps> = ({
  defaultFrom = 'USD',
  defaultTo = 'EUR',
}) => {
  const [fromCurrency, setFromCurrency] = useState(defaultFrom);
  const [toCurrency, setToCurrency] = useState(defaultTo);
  const [amount, setAmount] = useState<string>('100');
  const [rates, setRates] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchRates = async (base: string) => {
    try {
      setLoading(true);
      const data = await currencyService.getExchangeRates(base);
      setRates(data.rates || {});
      setLastUpdated(new Date(data.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (e) {
      console.warn('Could not load rates:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates(fromCurrency);
  }, [fromCurrency]);

  const { convertedAmount, rate } = useMemo(() => {
    const numAmount = parseFloat(amount) || 0;
    return currencyService.convert(numAmount, fromCurrency, toCurrency, rates);
  }, [amount, fromCurrency, toCurrency, rates]);

  const handleSwap = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  const quickAmounts = ['50', '100', '250', '500', '1000'];

  return (
    <Card className="p-4 sm:p-5 rounded-3xl bg-theme-surface border border-theme-subtle shadow-xl flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-theme-subtle mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-theme-surface-raised text-emerald-400 border border-theme-subtle">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Travel Currency Exchange
              </h3>
              <p className="text-[10px] text-slate-400">Live FX estimates for budgeting</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => fetchRates(fromCurrency)}
            disabled={loading}
            title="Refresh exchange rates"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-theme-surface-raised transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>

        {/* Amount & Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center">
          {/* Amount & From */}
          <div className="sm:col-span-2 space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Send Amount
            </label>
            <div className="flex rounded-xl bg-theme-surface-raised border border-theme-subtle overflow-hidden focus-within:border-theme-accent">
              <input
                type="number"
                min="0"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full bg-transparent px-3 py-2 text-sm text-white font-mono focus:outline-none"
              />
              <select
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
                aria-label="Source Currency"
                className="bg-theme-surface border-l border-theme-subtle px-2.5 py-2 text-xs font-bold text-white focus:outline-none cursor-pointer"
              >
                {POPULAR_CURRENCIES.map((code) => (
                  <option key={code} value={code} className="bg-slate-900 text-white">
                    {code}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center sm:col-span-1 pt-2 sm:pt-4">
            <button
              type="button"
              onClick={handleSwap}
              title="Swap currencies"
              className="p-2 rounded-xl bg-theme-surface-raised border border-theme-subtle hover:border-theme-accent hover:text-emerald-400 text-slate-300 transition-all cursor-pointer group"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform" />
            </button>
          </div>

          {/* Result & To */}
          <div className="sm:col-span-2 space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Receive Estimate
            </label>
            <div className="flex rounded-xl bg-theme-surface-raised border border-theme-subtle overflow-hidden">
              <div className="w-full px-3 py-2 text-sm text-emerald-400 font-mono font-bold truncate flex items-center">
                {convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <select
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
                aria-label="Target Currency"
                className="bg-theme-surface border-l border-theme-subtle px-2.5 py-2 text-xs font-bold text-white focus:outline-none cursor-pointer"
              >
                {POPULAR_CURRENCIES.map((code) => (
                  <option key={code} value={code} className="bg-slate-900 text-white">
                    {code}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Quick Amount Chips */}
        <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-theme-subtle/80 flex-wrap">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Quick:</span>
          {quickAmounts.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setAmount(q)}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer ${
                amount === q
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'bg-theme-surface-raised text-slate-300 border border-theme-subtle hover:text-white hover:border-theme-strong'
              }`}
            >
              {getCurrencySymbol(fromCurrency)}{q}
            </button>
          ))}
        </div>
      </div>

      {/* Exchange Rate Badge */}
      <div className="mt-3 pt-2 border-t border-theme-subtle flex items-center justify-between text-[10px] text-slate-400">
        <span className="flex items-center gap-1 text-slate-300 font-mono">
          <TrendingUp className="w-3 h-3 text-emerald-400" />
          1 {fromCurrency} = {rate} {toCurrency}
        </span>
        <span>{lastUpdated ? `Refreshed ${lastUpdated}` : 'Live rates'}</span>
      </div>
    </Card>
  );
};
