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
      {/* Top Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-purple-950/40 border border-blue-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-xs hover:text-white hover:bg-slate-800 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Rates</span>
        </button>
      </div>

      {/* Main Converter Card */}
      <Card className="p-6 bg-slate-900/90 border-slate-800 shadow-2xl">
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
                  min="0"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="text-lg font-mono font-bold pr-12 text-white bg-slate-950"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  {fromMeta.symbol}
                </span>
              </div>
              <CurrencySelect
                value={fromCurrency}
                onChange={setFromCurrency}
                currencies={currencies}
              />
            </div>
          </div>

          {/* Swap Button */}
          <div className="lg:col-span-2 flex justify-center py-2 lg:py-0">
            <button
              onClick={handleSwap}
              title="Swap currencies"
              className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 hover:border-blue-500 hover:bg-blue-600/20 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-lg hover:rotate-180 duration-300"
            >
              <ArrowRightLeft className="w-4 h-4 text-blue-400" />
            </button>
          </div>

          {/* Result & Target Currency */}
          <div className="lg:col-span-5 space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Converted Destination Value</span>
              <span className="font-mono text-emerald-400 flex items-center gap-1.5">
                <CountryFlag currencyCode={toMeta.code} size="xs" />
                {toMeta.name}
              </span>
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  readOnly
                  value={convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  className="w-full text-lg font-mono font-bold px-3.5 py-2.5 rounded-xl border border-emerald-500/30 bg-slate-950 text-emerald-400 focus:outline-none select-all"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-400">
                  {toMeta.symbol}
                </span>
              </div>
              <CurrencySelect
                value={toCurrency}
                onChange={setToCurrency}
                currencies={currencies}
              />
            </div>
          </div>
        </div>

        {/* Live Exchange Rate Indicator Bar */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300 font-mono">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="flex items-center gap-1">
              <CountryFlag currencyCode={fromCurrency} size="xs" />
              1 {fromCurrency} = <strong className="text-white">{rate}</strong> {toCurrency}
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
                    ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-600/30'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
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
      <Card className="p-5 bg-slate-900/70 border-slate-800">
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
