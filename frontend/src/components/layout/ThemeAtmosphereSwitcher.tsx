'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Compass,
  Clock,
  MapPin,
  Sparkles,
  ChevronDown,
  RefreshCw,
  Sun,
  Moon,
  Sunset,
  Sunrise,
  Check,
} from 'lucide-react';
import {
  useTheme,
  TimeOfDay,
  LocationTheme,
  SUPPORTED_LOCATIONS,
  TIME_OF_DAY_CONFIG,
} from '../../store/ThemeContext';

export const ThemeAtmosphereSwitcher: React.FC = () => {
  const {
    timeOfDay,
    location,
    isAuto,
    localTime,
    locationConfig,
    setTimeOfDay,
    setLocation,
    setIsAuto,
    cycleTimeOfDay,
    cycleLocation,
  } = useTheme();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const getTimeIcon = (time: TimeOfDay) => {
    switch (time) {
      case 'dawn':
        return <Sunrise className="w-3.5 h-3.5 text-pink-400" />;
      case 'day':
        return <Sun className="w-3.5 h-3.5 text-sky-400" />;
      case 'sunset':
        return <Sunset className="w-3.5 h-3.5 text-amber-400" />;
      case 'night':
        return <Moon className="w-3.5 h-3.5 text-cyan-300" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Navbar Trigger Pill (Solid Matte, Clean Borders, ZERO Gradients, DUAL-TONE) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-theme-subtle bg-theme-surface hover:bg-theme-raised text-xs transition-all focus:outline-none focus:ring-1 focus:ring-sky-500"
        title="Active Dual-Tone Atmosphere"
      >
        <span className="text-sm">{locationConfig.emblem}</span>
        <span className="font-semibold text-theme-primary hidden sm:inline">
          {locationConfig.name}
        </span>
        <span className="text-slate-600 hidden sm:inline">&bull;</span>
        <div className="flex items-center gap-1 text-theme-secondary font-mono text-[11px]">
          {getTimeIcon(timeOfDay)}
          <span>{localTime}</span>
        </div>
        {/* Dual-Tone Swatch Preview */}
        <div className="flex items-center -space-x-1 shrink-0" title="Active Dual-Tone Pair">
          <span className="w-2.5 h-2.5 rounded-full border border-slate-900 bg-duotone-1 shadow-sm" />
          <span className="w-2.5 h-2.5 rounded-full border border-slate-900 bg-duotone-2 shadow-sm" />
        </div>
        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tag-theme uppercase tracking-wider hidden md:inline">
          {timeOfDay}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Control Center (Solid Matte Architecture) */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-theme-strong bg-theme-surface p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-theme-subtle mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-theme-raised text-theme-accent">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-theme-primary">Atmosphere Engine</h4>
                <p className="text-[10px] text-theme-muted">
                  Syncs with destination time zone &amp; location
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsAuto(!isAuto)}
              className={`px-2 py-1 rounded text-[10px] font-bold tracking-wide transition-colors border ${
                isAuto
                  ? 'bg-emerald-950/80 border-emerald-600/40 text-emerald-300'
                  : 'bg-theme-raised border-theme-subtle text-slate-400 hover:text-slate-200'
              }`}
            >
              {isAuto ? '● Auto Mode ON' : '○ Manual Override'}
            </button>
          </div>

          {/* Time of Day Selector */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              <span>Time of Day</span>
              <button
                onClick={cycleTimeOfDay}
                className="text-[10px] text-sky-400 hover:text-sky-300 flex items-center gap-1"
              >
                <RefreshCw className="w-2.5 h-2.5" /> Next Phase
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {(Object.keys(TIME_OF_DAY_CONFIG) as TimeOfDay[]).map((key) => {
                const cfg = TIME_OF_DAY_CONFIG[key];
                const active = timeOfDay === key;
                return (
                  <button
                    key={key}
                    onClick={() => setTimeOfDay(key)}
                    className={`flex items-start gap-2 p-2 rounded-xl text-left border transition-all ${
                      active
                        ? 'border-theme-strong bg-theme-raised text-theme-primary font-semibold'
                        : 'border-theme-subtle/60 bg-theme-surface hover:bg-theme-raised/50 text-slate-400'
                    }`}
                  >
                    <span className="text-base">{cfg.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs">{cfg.name}</span>
                        {active && <Check className="w-3 h-3 text-sky-400" />}
                      </div>
                      <span className="text-[10px] text-slate-500 block font-mono">
                        {cfg.hoursRange}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Location Atmosphere Selector */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              <span>Trip Destination Palette</span>
              <button
                onClick={cycleLocation}
                className="text-[10px] text-sky-400 hover:text-sky-300 flex items-center gap-1"
              >
                <RefreshCw className="w-2.5 h-2.5" /> Cycle City
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
              {(Object.keys(SUPPORTED_LOCATIONS) as LocationTheme[])
                .filter((locKey) => locKey !== 'default')
                .map((locKey) => {
                  const loc = SUPPORTED_LOCATIONS[locKey];
                  const active = location === locKey;
                  return (
                    <button
                      key={locKey}
                      onClick={() => setLocation(locKey)}
                      className={`flex items-center gap-2 p-2 rounded-xl text-left border transition-all ${
                        active
                          ? 'border-theme-strong bg-theme-raised text-theme-primary font-semibold'
                          : 'border-theme-subtle/60 bg-theme-surface hover:bg-theme-raised/50 text-slate-400'
                      }`}
                    >
                      <span className="text-lg">{loc.emblem}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs truncate">{loc.name}</span>
                          {active && <Check className="w-3 h-3 text-sky-400 flex-shrink-0" />}
                        </div>
                        <span className="text-[9px] text-slate-500 block truncate">
                          {loc.country}
                        </span>
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Footer Interactive Button with Dual-Tone Swatches */}
          <button
            type="button"
            onClick={() => {
              if (isAuto) setIsAuto(false);
              cycleLocation();
            }}
            className="w-full pt-2.5 pb-1 px-2 border-t border-theme-subtle flex items-center justify-between text-[10px] text-slate-400 hover:text-theme-primary hover:bg-theme-raised/60 rounded-b-xl transition-all cursor-pointer group focus:outline-none focus:ring-1 focus:ring-sky-500"
            title="Click to cycle next destination vibe"
          >
            <div className="flex items-center gap-2">
              <div className="flex items-center -space-x-1 shrink-0">
                <span className="w-3 h-3 rounded-full border border-slate-900 bg-duotone-1 shadow-sm group-hover:scale-110 transition-transform" title="Tone 1 (Primary Accent)" />
                <span className="w-3 h-3 rounded-full border border-slate-900 bg-duotone-2 shadow-sm group-hover:scale-110 transition-transform" title="Tone 2 (Contrasting Highlight)" />
              </div>
              <span className="truncate">
                Dual-Tone: <span className="text-theme-secondary font-semibold group-hover:underline">{locationConfig.vibe}</span>
              </span>
            </div>
            <span className="flex items-center gap-1.5 font-mono text-slate-400 group-hover:text-theme-primary shrink-0">
              <span>{locationConfig.currency}</span>
              <RefreshCw className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100 group-hover:rotate-180 transition-all duration-300" />
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
