'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Compass,
  ChevronDown,
  Sun,
  Moon,
  Sunset,
  Sunrise,
} from 'lucide-react';
import {
  useTheme,
  TimeOfDay,
  TIME_OF_DAY_CONFIG,
} from '../../store/ThemeContext';

export const ThemeAtmosphereSwitcher: React.FC = () => {
  const {
    timeOfDay,
    localTime,
    locationConfig,
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

      {/* Dropdown / Telemetry Card (100% Automated Destination Ambiance & Telemetry) */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-88 rounded-2xl border border-theme-strong bg-theme-surface p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-theme-subtle">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-theme-raised text-theme-accent">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-theme-primary">Atmosphere Engine</h4>
                <p className="text-[10px] text-theme-muted">
                  Fully automated destination climate &amp; lighting
                </p>
              </div>
            </div>

            <span className="px-2 py-1 rounded text-[10px] font-bold tracking-wide border bg-emerald-950/80 border-emerald-600/40 text-emerald-300 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Auto Synced
            </span>
          </div>

          {/* Destination Active Telemetry */}
          <div className="p-3 rounded-xl bg-theme-surface-raised border border-theme-subtle space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{locationConfig.emblem}</span>
                <div>
                  <h4 className="text-xs font-bold text-white">{locationConfig.name}</h4>
                  <p className="text-[10px] text-slate-400">{locationConfig.country}</p>
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center justify-end gap-1 text-sky-400 font-mono text-xs font-bold">
                  {getTimeIcon(timeOfDay)}
                  <span>{localTime}</span>
                </div>
                <span className="text-[10px] font-semibold text-slate-400 capitalize">
                  {TIME_OF_DAY_CONFIG[timeOfDay]?.name} Lighting
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-theme-subtle/70 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Local Currency:</span>
              <span className="font-mono font-bold text-emerald-400">{locationConfig.currency}</span>
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Timezone:</span>
              <span className="font-mono text-slate-300">{locationConfig.timeZone}</span>
            </div>
          </div>

          {/* Dual-Tone Architectural Palette Info */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-theme-subtle space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Palette Atmosphere:</span>
              <span className="text-theme-secondary font-bold">{locationConfig.vibe}</span>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <div className="flex items-center -space-x-1 shrink-0">
                <span className="w-3.5 h-3.5 rounded-full border border-slate-900 bg-duotone-1 shadow-sm" title="Tone 1 Primary" />
                <span className="w-3.5 h-3.5 rounded-full border border-slate-900 bg-duotone-2 shadow-sm" title="Tone 2 Secondary" />
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                Colors and ambient lighting adjust automatically based on your active trip and local sun cycle.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
