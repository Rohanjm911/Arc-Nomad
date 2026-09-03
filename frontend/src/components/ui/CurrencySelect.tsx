'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search, Check, X, Sparkles } from 'lucide-react';
import { CurrencyItem, FALLBACK_CURRENCIES } from '../../services/currencyService';
import { CountryFlag } from './CountryFlag';

const POPULAR_CODES = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'INR', 'CHF', 'SGD', 'AED', 'THB'];

interface CurrencySelectProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  helperText?: string;
  error?: string;
  currencies?: CurrencyItem[];
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  id?: string;
  showPopularChips?: boolean;
}

export const CurrencySelect: React.FC<CurrencySelectProps> = ({
  value,
  onChange,
  label,
  helperText,
  error,
  currencies = FALLBACK_CURRENCIES,
  className = '',
  size = 'md',
  disabled = false,
  id,
  showPopularChips = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  const selectedItem = useMemo(() => {
    return (
      currencies.find((c) => c.code.toUpperCase() === (value || '').toUpperCase()) || {
        code: value || 'USD',
        name: value || 'US Dollar',
        symbol: '$',
        flag: '🌐',
      }
    );
  }, [currencies, value]);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearch('');
    }
  }, [isOpen]);

  // Filter currencies
  const filtered = useMemo(() => {
    if (!search.trim()) return currencies;
    const q = search.toLowerCase().trim();
    return currencies.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.symbol.toLowerCase().includes(q)
    );
  }, [currencies, search]);

  const popularCurrencies = useMemo(() => {
    return POPULAR_CODES.map((code) => currencies.find((c) => c.code === code)).filter(
      (c): c is CurrencyItem => Boolean(c)
    );
  }, [currencies]);

  const sizeClasses = {
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-3.5 py-2.5 text-sm',
    lg: 'px-4 py-3 text-base',
  };

  return (
    <div className={`relative ${label ? 'w-full' : 'inline-block'} ${className}`} ref={dropdownRef}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5"
        >
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        id={selectId}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2.5 rounded-xl bg-slate-950 border transition-all duration-150 cursor-pointer shadow-sm text-left ${
          error
            ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
            : isOpen
            ? 'border-blue-500 ring-1 ring-blue-500'
            : 'border-slate-700 hover:border-slate-600'
        } ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-900' : ''} ${sizeClasses[size]}`}
      >
        <div className="flex items-center gap-2.5 min-w-0 truncate">
          <CountryFlag
            currencyCode={selectedItem.code}
            size={size === 'sm' ? 'xs' : size === 'lg' ? 'md' : 'sm'}
            fallbackEmoji={selectedItem.flag}
          />
          <div className="flex items-center gap-1.5 min-w-0 truncate">
            <span className="font-mono font-bold text-white tracking-wide">{selectedItem.code}</span>
            <span className="text-slate-400 font-medium">({selectedItem.symbol})</span>
            <span className="text-slate-500 text-xs truncate hidden sm:inline">
              — {selectedItem.name}
            </span>
          </div>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-blue-400' : ''
          }`}
        />
      </button>

      {/* Error / Helper text */}
      {error && <p className="mt-1.5 text-xs text-red-400 font-medium">{error}</p>}
      {helperText && !error && <p className="mt-1 text-xs text-slate-400">{helperText}</p>}

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 min-w-[280px] max-w-sm sm:max-w-md bg-slate-900/98 backdrop-blur-xl border border-slate-700/90 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Search Header */}
          <div className="p-2.5 border-b border-slate-800 bg-slate-950/80 flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search currency, symbol or country..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none py-1"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Popular Currencies Strip */}
          {showPopularChips && !search && (
            <div className="p-2 border-b border-slate-800/80 bg-slate-950/40">
              <div className="flex items-center gap-1.5 mb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Popular Travel Currencies</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {popularCurrencies.map((pop) => {
                  const isPopSelected = pop.code.toUpperCase() === value.toUpperCase();
                  return (
                    <button
                      key={pop.code}
                      type="button"
                      onClick={() => {
                        onChange(pop.code);
                        setIsOpen(false);
                      }}
                      className={`px-2 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition-all cursor-pointer border ${
                        isPopSelected
                          ? 'bg-blue-600 text-white border-blue-400 shadow-xs'
                          : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <CountryFlag currencyCode={pop.code} size="xs" fallbackEmoji={pop.flag} />
                      <span className="font-mono font-bold">{pop.code}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Currency List */}
          <div className="overflow-y-auto max-h-60 p-1.5 scrollbar-thin scrollbar-thumb-slate-700 divide-y divide-slate-800/40">
            {filtered.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500 italic">
                No currencies matching &quot;{search}&quot;
              </div>
            ) : (
              filtered.map((item) => {
                const isSelected = item.code.toUpperCase() === (value || '').toUpperCase();
                return (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => {
                      onChange(item.code);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-colors cursor-pointer text-left ${
                      isSelected
                        ? 'bg-blue-600/20 text-blue-300 font-bold border border-blue-500/30 shadow-xs'
                        : 'text-slate-200 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 truncate">
                      <CountryFlag currencyCode={item.code} size="sm" fallbackEmoji={item.flag} />
                      <div className="flex flex-col min-w-0 truncate">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-white tracking-wide">
                            {item.code}
                          </span>
                          <span className="text-slate-400 font-medium">({item.symbol})</span>
                        </div>
                        <span className="text-[11px] text-slate-400 truncate">{item.name}</span>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center shrink-0 ml-2">
                        <Check className="w-3.5 h-3.5 text-blue-400" />
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer stats */}
          <div className="p-2 border-t border-slate-800/80 bg-slate-950/60 text-[10px] text-slate-500 flex items-center justify-between px-3">
            <span>{filtered.length} currencies available</span>
            <span className="font-mono text-slate-400">Selected: {selectedItem.code} ({selectedItem.symbol})</span>
          </div>
        </div>
      )}
    </div>
  );
};
