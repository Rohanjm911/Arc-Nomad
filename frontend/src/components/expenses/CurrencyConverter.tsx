'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowRightLeft,
  DollarSign,
  TrendingUp,
  RefreshCw,
  Sparkles,
  PlusCircle,
  Calculator,
  Search,
  Check,
} from 'lucide-react';
import { currencyService, CurrencyItem, FALLBACK_CURRENCIES } from '../../services/currencyService';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { CountryFlag } from '../ui/CountryFlag';
import { CurrencySelect } from '../ui/CurrencySelect';

interface CurrencyConverterProps {
  defaultBaseCurrency?: string;
  onApplyToExpense?: (convertedAmount: number, sourceDetail: string) => void;
}

const POPULAR_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'INR', 'CAD', 'AUD', 'CHF', 'SGD', 'AED', 'THB'];

const CHEAT_SHEET_AMOUNTS = [1, 5, 10, 20, 50, 100, 250, 500, 1000];

export const CurrencyConverter: React.FC<CurrencyConverterProps> = ({
  defaultBaseCurrency = 'USD',
  onApplyToExpense,
}) => {
  const [currencies, setCurrencies] = useState<CurrencyItem[]>(FALLBACK_CURRENCIES);
  const [fromCurrency, setFromCurrency] = useState<string>('EUR');
  const [toCurrency, setToCurrency] = useState<string>(defaultBaseCurrency);
  const [amount, setAmount] = useState<string>('100');
  const [rates, setRates] = useState<Record<string, number>>({});
  const [updatedAt, setUpdatedAt] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch exchange rates
  const fetchRates = async (base = 'USD') => {
    setLoading(true);
    try {
      const data = await currencyService.getExchangeRates(base);
      setRates(data.rates || {});
      setCurrencies(data.currencies || FALLBACK_CURRENCIES);
      setUpdatedAt(data.updated_at || new Date().toLocaleTimeString());
    } catch (err) {
      console.warn('Could not load rates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates(toCurrency || 'USD');
  }, [toCurrency]);

  const numAmount = parseFloat(amount) || 0;
  const { convertedAmount, rate } = useMemo(() => {
    return currencyService.convert(numAmount, fromCurrency, toCurrency, rates);
  }, [numAmount, fromCurrency, toCurrency, rates]);

  const fromMeta = currencies.find((c) => c.code === fromCurrency) || {
    code: fromCurrency,
    name: fromCurrency,
    symbol: fromCurrency,
    flag: '',
  };
  const toMeta = currencies.find((c) => c.code === toCurrency) || {
    code: toCurrency,
    name: toCurrency,
    symbol: toCurrency,
    flag: '',
  };

  const handleSwap = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner (Solid matte, zero gradients) */}
      <div className="p-4 rounded-2xl bg-theme-surface border border-theme-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Global Currency Conversion Calculator</h3>
              <Badge variant="primary" size="sm">45+ Currencies with Flags</Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live exchange rates across major global travel destinations & international nomad currencies
            </p>
          </div>
        </div>

        <button
          onClick={() => fetchRates(toCurrency)}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-theme-surface-raised border border-theme-subtle text-slate-300 text-xs hover:text-white hover:border-theme-strong transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Rates</span>
        </button>
      </div>

      {/* Main Converter Card */}
      <Card className="p-6 rounded-3xl bg-theme-surface border border-theme-subtle shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Amount & From Currency */}
          <div className="lg:col-span-5 space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>You Pay / Convert</span>
              <span className="font-mono text-cyan-400 flex items-center gap-1.5">
                <CountryFlag currencyCode={fromMeta.code} size="xs" />
                {fromMeta.name}
              </span>
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Input
                  type="number"
                  placeholder="100.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="font-mono font-bold text-base pl-9 text-white"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">
                  {fromMeta.symbol}
                </span>
              </div>
              <div className="w-48">
                <CurrencySelect
                  value={fromCurrency}
                  onChange={(val) => setFromCurrency(val)}
                  disabledCurrencies={[toCurrency]}
                />
              </div>
            </div>
          </div>

          {/* Center Swap Action */}
          <div className="lg:col-span-2 flex flex-col items-center justify-center py-2">
            <button
              onClick={handleSwap}
              className="w-10 h-10 rounded-2xl bg-theme-surface-raised border border-theme-subtle hover:border-theme-strong hover:bg-theme-surface flex items-center justify-center text-slate-300 hover:text-white transition-all shadow-md group cursor-pointer"
              title="Swap Currencies"
            >
              <ArrowRightLeft className="w-4 h-4 text-theme-accent group-hover:rotate-180 transition-transform duration-300" />
            </button>
            {rate > 0 && (
              <span className="text-[10px] font-mono text-slate-500 mt-2 font-semibold">
                1 = {rate.toFixed(3)}
              </span>
            )}
          </div>

          {/* Converted Result & Target Currency */}
          <div className="lg:col-span-5 space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>You Receive (Estimated)</span>
              <span className="font-mono text-emerald-400 flex items-center gap-1.5">
                <CountryFlag currencyCode={toMeta.code} size="xs" />
                {toMeta.name}
              </span>
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <div className="w-full rounded-xl bg-theme-surface-raised border border-theme-subtle px-3.5 py-2.5 text-base font-mono font-extrabold text-emerald-400 flex items-center justify-between">
                  <span className="truncate">
                    {loading ? 'Converting...' : convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-xs text-slate-500 ml-1 font-normal font-sans">
                    {toCurrency}
                  </span>
                </div>
              </div>
              <div className="w-48">
                <CurrencySelect
                  value={toCurrency}
                  onChange={(val) => setToCurrency(val)}
                  disabledCurrencies={[fromCurrency]}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Conversion Rate Strip */}
        <div className="mt-6 pt-4 border-t border-theme-subtle flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-mono">
            <span className="text-slate-300 font-bold flex items-center gap-1">
              <CountryFlag currencyCode={fromCurrency} size="xs" />
              1 {fromCurrency} = {rate.toFixed(4)} {toCurrency}
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400 flex items-center gap-1">
              <CountryFlag currencyCode={toCurrency} size="xs" />
              1 {toCurrency} = {rate > 0 ? (1 / rate).toFixed(4) : 0} {fromCurrency}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {updatedAt && (
              <span className="text-[11px] text-slate-500">
                Rates: {updatedAt}
              </span>
            )}

            {onApplyToExpense && (
              <Button
                variant="primary"
                size="sm"
                onClick={() =>
                  onApplyToExpense(
                    convertedAmount,
                    `Converted from ${numAmount} ${fromCurrency} @ 1 ${fromCurrency} = ${rate} ${toCurrency}`
                  )
                }
                className="gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Log As Expense
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Popular Currencies Quick Select Chips */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">
          Frequent Nomad Currencies
        </span>
        <div className="flex flex-wrap gap-2">
          {POPULAR_CURRENCIES.map((code) => {
            const item = currencies.find((c) => c.code === code);
            if (!item) return null;
            return (
              <button
                key={code}
                onClick={() => setFromCurrency(code)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                  fromCurrency === code
                    ? 'bg-theme-accent text-white border-theme-strong font-semibold shadow-sm'
                    : 'bg-theme-surface text-slate-300 border-theme-subtle hover:border-theme-strong hover:text-white'
                }`}
              >
                <CountryFlag currencyCode={code} size="xs" />
                <span>{code}</span>
                <span className="text-[10px] opacity-60">({item.symbol})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Traveler Quick-Reference Cheat Sheet */}
      <Card className="p-5 rounded-2xl bg-theme-surface border border-theme-subtle">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="flex items-center gap-1.5">
                <CountryFlag currencyCode={fromCurrency} size="xs" />
                <span>✈️ Traveler Cheat Sheet</span>
              </span>
              <span className="text-slate-400 font-normal">({fromCurrency} &rarr; {toCurrency})</span>
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Quick benchmark values for dining, taxis, and shopping abroad
            </p>
          </div>
          <Badge variant="neutral" size="sm" className="flex items-center gap-1">
            <CountryFlag currencyCode={fromCurrency} size="xs" />
            1 {fromCurrency} = {rate} {toCurrency}
          </Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 text-xs">
          {CHEAT_SHEET_AMOUNTS.map((val) => {
            const convertedVal = (val * rate).toLocaleString(undefined, {
              minimumFractionDigits: rate > 100 ? 0 : 2,
              maximumFractionDigits: rate > 100 ? 0 : 2,
            });
            return (
              <div
                key={val}
                className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between"
              >
                <span className="font-mono text-slate-300 font-semibold flex items-center gap-1">
                  <CountryFlag currencyCode={fromCurrency} size="xs" />
                  {fromMeta.symbol} {val}
                </span>
                <span className="font-mono text-emerald-400 font-bold flex items-center gap-1">
                  <CountryFlag currencyCode={toCurrency} size="xs" />
                  {toMeta.symbol} {convertedVal}
                </span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
