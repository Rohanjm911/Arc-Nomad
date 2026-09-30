'use client';

import React from 'react';
import Link from 'next/link';
import {
  Compass,
  Sparkles,
  MapPin,
  Users,
  Plane,
  Receipt,
  FileSpreadsheet,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Lock,
} from 'lucide-react';
import { useAuth } from '../store/AuthContext';
import { useTheme, SUPPORTED_LOCATIONS, TIME_OF_DAY_CONFIG, LocationTheme, TimeOfDay } from '../store/ThemeContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { TravelLogo } from '../components/ui/TravelLogo';

export default function LandingPage() {
  const { user, demoLogin } = useAuth();
  const { location, timeOfDay, isAuto, setLocation, setTimeOfDay, setIsAuto, localTime, locationConfig } = useTheme();

  const corePillars = [
    {
      title: 'AI Travel Architect',
      description: 'Generates structured, customizable day-by-day itineraries tailored to your travel style, pace, and interests with Gemini Flash models.',
      icon: <Sparkles className="w-5 h-5 text-[#bf5af2]" />,
      accentColor: 'border-[#bf5af2]/30 bg-[#bf5af2]/10 text-[#bf5af2]',
      tag: 'Gemini 3.7 Flash',
      colSpan: 'md:col-span-2',
      highlight: true,
    },
    {
      title: 'Synchronized Spatial Cartography',
      description: "Explore stops, attractions, and accommodations on high-contrast dark maps with interactive markers and route pathing.",
      icon: <MapPin className="w-5 h-5 text-[#2997ff]" />,
      accentColor: 'border-[#2997ff]/30 bg-[#2997ff]/10 text-[#2997ff]',
      tag: 'Leaflet Free Engine',
      colSpan: 'md:col-span-1',
    },
    {
      title: 'Circular Debt Simplification',
      description: 'Log group expenses with equal, exact, or percentage splits. Our greedy cash-flow algorithm eliminates circular transactions.',
      icon: <Receipt className="w-5 h-5 text-[#ff9f0a]" />,
      accentColor: 'border-[#ff9f0a]/30 bg-[#ff9f0a]/10 text-[#ff9f0a]',
      tag: 'Cashflow Optimizer',
      colSpan: 'md:col-span-1',
    },
    {
      title: 'Live Airspace Radar',
      description: 'Apple Wallet style live boarding passes with automated delay alerts, terminal/gate tracking, and status simulations.',
      icon: <Plane className="w-5 h-5 text-[#30d158]" />,
      accentColor: 'border-[#30d158]/30 bg-[#30d158]/10 text-[#30d158]',
      tag: 'Live Telemetry',
      colSpan: 'md:col-span-1',
    },
    {
      title: 'Low-Latency Mesh Chat',
      description: 'Collaborate with your travel crew instantly using WebSocket sync, message reactions, and live presence indicators.',
      icon: <Users className="w-5 h-5 text-[#64d2ff]" />,
      accentColor: 'border-[#64d2ff]/30 bg-[#64d2ff]/10 text-[#64d2ff]',
      tag: 'WebSocket Sync',
      colSpan: 'md:col-span-1',
    },
    {
      title: '1-Click Dossiers & Ledgers',
      description: 'Export publication-ready PDF travel guides and multi-tab Excel financial workbooks directly to your device.',
      icon: <FileSpreadsheet className="w-5 h-5 text-emerald-400" />,
      accentColor: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
      tag: 'ReportLab & openpyxl',
      colSpan: 'md:col-span-1',
    },
  ];

  const travelStorySteps = [
    {
      num: '01',
      title: 'Define the Journey',
      desc: 'Pick your destination, dates, budget, and invite your travel circle.',
    },
    {
      num: '02',
      title: 'Architect with AI',
      desc: 'Generate a rich day-by-day timetable and fine-tune every stop with Gemini.',
    },
    {
      num: '03',
      title: 'Track & Explore',
      desc: 'Monitor live flight boarding passes, spatial waypoints, and local weather.',
    },
    {
      num: '04',
      title: 'Settle Seamlessly',
      desc: 'Split shared expenses fairly with minimum cash-flow debt reduction.',
    },
  ];

  return (
    <div className="relative space-y-28 sm:space-y-36 py-8 sm:py-16 overflow-hidden">
      {/* Apple Ambient Specular Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[600px] bg-gradient-to-b from-white/[0.08] via-slate-400/[0.03] to-transparent blur-3xl pointer-events-none -z-10" />

      {/* 1. Hero Section (Apple Pro Keynote Style) */}
      <section className="text-center max-w-4xl mx-auto space-y-7 pt-4">
        {/* Apple Pill Eyebrow */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.12] backdrop-blur-xl text-zinc-300 text-xs font-semibold tracking-wide shadow-sm hover:bg-white/[0.08] transition-all">
          <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
          <span className="tracking-wider uppercase text-[11px]">ARC-NOMAD 2.0 &bull; THE INTELLIGENT TRAVEL OS</span>
        </div>

        {/* Master Apple Headline */}
        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-white tracking-[-0.035em] leading-[1.03] select-none">
          Plan smarter. <br />
          <span className="apple-text-gradient">Travel without bounds.</span>
        </h1>

        {/* Apple Subhead */}
        <p className="text-base sm:text-xl text-zinc-400 font-normal max-w-2xl mx-auto leading-relaxed tracking-tight">
          A breakthrough collaborative travel system. Unifying Gemini AI itinerary architecture, live airspace tracking, and automated group debt settlement into one seamless experience.
        </p>

        {/* Apple Action Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-3">
          {user ? (
            <Link href="/dashboard">
              <Button variant="primary" size="lg" className="rounded-full px-8 py-3.5 text-sm font-semibold shadow-[0_2px_20px_rgba(255,255,255,0.2)] gap-2">
                Open Dashboard
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/register">
                <Button variant="primary" size="lg" className="rounded-full px-8 py-3.5 text-sm font-semibold shadow-[0_2px_20px_rgba(255,255,255,0.2)] gap-2">
                  Start Planning Free
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => demoLogin('alex_nomad')}
                className="rounded-full px-7 py-3.5 text-sm font-medium backdrop-blur-xl gap-2"
              >
                <Sparkles className="w-4 h-4 text-[#2997ff]" />
                Explore Demo Expedition
              </Button>
            </>
          )}
        </div>

        {/* Feature Highlights Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-6 text-xs text-zinc-400 font-medium">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] backdrop-blur-md">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#30d158]" />
            <span>Zero Spreadsheets Needed</span>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] backdrop-blur-md">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#30d158]" />
            <span>Greedy Debt Minimizer</span>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] backdrop-blur-md">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#30d158]" />
            <span>Real-Time Airspace Sync</span>
          </div>
        </div>
      </section>

      {/* 2. Interactive macOS Studio Display App Preview */}
      <section className="max-w-5xl mx-auto px-2">
        <div className="rounded-[32px] bg-[#121217]/80 backdrop-blur-2xl border border-white/[0.12] shadow-[0_32px_80px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.15)] overflow-hidden">
          {/* macOS Safari Window Titlebar */}
          <div className="px-5 py-3.5 bg-black/40 border-b border-white/[0.08] flex items-center justify-between">
            {/* Traffic Light Window Controls */}
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]/40 shadow-sm" />
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]/40 shadow-sm" />
              <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]/40 shadow-sm" />
            </div>

            {/* Apple Safari URL Pill */}
            <div className="flex items-center gap-2 px-5 py-1 rounded-full bg-white/[0.06] border border-white/[0.08] text-[11px] text-zinc-400 font-mono select-none">
              <Lock className="w-3 h-3 text-zinc-500" />
              <span>arc-nomad.app / expeditions / {locationConfig.id}-2026</span>
            </div>

            <div className="w-12 text-right text-[10px] text-zinc-500 font-mono hidden sm:block">
              macOS 15
            </div>
          </div>

          {/* Window Canvas */}
          <div className="p-5 sm:p-7 space-y-6">
            {/* Expedition Header Strip */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/[0.08]">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="success" size="sm">ACTIVE EXPEDITION</Badge>
                  <Badge variant="primary" size="sm">ATMOSPHERE SYNCED</Badge>
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight mt-2">
                  {locationConfig.name} Expedition &bull; Global Collective
                </h2>
                <p className="text-xs text-zinc-400 flex flex-wrap items-center gap-3 mt-1.5">
                  <span className="flex items-center gap-1 text-[#2997ff] font-medium">
                    <MapPin className="w-3.5 h-3.5" /> {locationConfig.name}, {locationConfig.country}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400" /> Oct 12 &ndash; Oct 20, 2026
                  </span>
                  <span>Currency: <strong className="text-zinc-300">{locationConfig.currency}</strong></span>
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs font-medium text-zinc-400">4 Nomads Active</span>
                <div className="flex items-center -space-x-2">
                  <img src="/avatars/aarav.jpg" alt="Aarav" className="w-8 h-8 rounded-full object-cover border-2 border-[#121217] shadow-sm" title="Aarav Sharma" />
                  <img src="/avatars/priya.jpg" alt="Priya" className="w-8 h-8 rounded-full object-cover border-2 border-[#121217] shadow-sm" title="Priya Patel" />
                  <img src="/avatars/kabir.jpg" alt="Kabir" className="w-8 h-8 rounded-full object-cover border-2 border-[#121217] shadow-sm" title="Kabir Mehta" />
                  <img src="/avatars/ananya.jpg" alt="Ananya" className="w-8 h-8 rounded-full object-cover border-2 border-[#121217] shadow-sm" title="Ananya Roy" />
                </div>
              </div>
            </div>

            {/* 3-Column Preview Grid (Apple Glass Cards) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Column 1: Daily Schedule */}
              <div className="apple-glass-card p-5 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Day 1 &bull; Cultural Landmarks</span>
                  <span className="text-[11px] text-[#2997ff] font-medium">4 Activities</span>
                </div>
                <div className="space-y-2.5">
                  <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-xs flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-zinc-200">Heritage Discovery Walk</p>
                      <p className="text-[10px] text-zinc-400">09:00 AM &bull; Sightseeing</p>
                    </div>
                    <Badge variant="amber" size="xs">Free</Badge>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-xs flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-zinc-200">Local Artisan Lunch</p>
                      <p className="text-[10px] text-zinc-400">12:30 PM &bull; Culinary</p>
                    </div>
                    <Badge variant="teal" size="xs">$24</Badge>
                  </div>
                </div>
              </div>

              {/* Column 2: Flight Boarding Pass (Apple Wallet Style) */}
              <div className="apple-glass-card p-5 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Flight AN-402</span>
                  <Badge variant="success" size="xs">ON TIME</Badge>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <p className="text-xl font-mono font-bold text-white tracking-tight">DEP</p>
                    <p className="text-[10px] text-zinc-400">Departure Gate</p>
                  </div>
                  <Plane className="w-5 h-5 text-[#2997ff]" />
                  <div className="text-right">
                    <p className="text-xl font-mono font-bold text-white tracking-tight">{locationConfig.id.slice(0, 3).toUpperCase()}</p>
                    <p className="text-[10px] text-zinc-400">{locationConfig.name}</p>
                  </div>
                </div>
                <p className="text-[11px] text-zinc-400 text-center border-t border-white/[0.08] pt-2.5">
                  Gate 12 &bull; Seat 7F &bull; ARC Skyfleet
                </p>
              </div>

              {/* Column 3: Debt Settlement Matrix */}
              <div className="apple-glass-card p-5 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Debt Settlement</span>
                  <span className="text-[10px] font-bold text-[#30d158]">All Balanced</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-xs space-y-1.5">
                  <div className="flex items-center justify-between font-medium">
                    <span className="text-zinc-300">Alex &rarr; Chloe</span>
                    <span className="font-bold text-white">$45.00</span>
                  </div>
                  <p className="text-[10px] text-zinc-500">Shared transit pass split</p>
                </div>
                <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
                  <span>Spent: <strong className="text-white">$1,840</strong></span>
                  <span>Budget Left: <strong className="text-[#30d158]">$2,660</strong></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2.5 Dynamic Atmosphere Engine Console (Cupertino Segmented Controls) */}
      <section className="max-w-5xl mx-auto rounded-[32px] bg-[#121217]/75 backdrop-blur-2xl border border-white/[0.1] p-6 sm:p-9 space-y-7 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🌌</span>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Dynamic Atmospheric Matrix
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl leading-relaxed">
              Apple-engineered UI tokens that subtly adapt to where your expedition is located and what time of day it is there in real-time.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsAuto(!isAuto)}
              className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all cursor-pointer flex items-center gap-2 ${
                isAuto
                  ? 'bg-white text-black border-white shadow-[0_2px_12px_rgba(255,255,255,0.25)]'
                  : 'bg-white/[0.05] border-white/[0.1] text-zinc-300 hover:border-white/[0.2]'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isAuto ? 'bg-black animate-pulse' : 'bg-zinc-500'}`} />
              {isAuto ? 'Auto Destination Sync: ON' : 'Manual Override'}
            </button>
          </div>
        </div>

        {/* Atmosphere Controls: Destinations & Time of Day */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Destination Segmented Grid */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
              1. Destination Atmosphere
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {(Object.keys(SUPPORTED_LOCATIONS) as LocationTheme[]).map((locKey) => {
                const loc = SUPPORTED_LOCATIONS[locKey];
                const isSelected = location === locKey;
                return (
                  <button
                    key={locKey}
                    onClick={() => {
                      setIsAuto(false);
                      setLocation(locKey);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-white/[0.12] border-white/[0.25] text-white shadow-lg ring-1 ring-white/20'
                        : 'bg-white/[0.03] border-white/[0.08] text-zinc-400 hover:border-white/[0.18] hover:text-zinc-200'
                    }`}
                  >
                    <span className="text-xl">{loc.emblem}</span>
                    <div className="mt-1.5">
                      <p className="text-xs font-bold truncate">{loc.name}</p>
                      <p className="text-[10px] text-zinc-500 truncate">{loc.currency}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time of Day Segmented Grid */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
              2. Time of Day Phase
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {(Object.keys(TIME_OF_DAY_CONFIG) as TimeOfDay[]).map((tKey) => {
                const cfg = TIME_OF_DAY_CONFIG[tKey];
                const isSelected = timeOfDay === tKey;
                return (
                  <button
                    key={tKey}
                    onClick={() => {
                      setIsAuto(false);
                      setTimeOfDay(tKey);
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3.5 ${
                      isSelected
                        ? 'bg-white/[0.12] border-white/[0.25] text-white shadow-lg ring-1 ring-white/20'
                        : 'bg-white/[0.03] border-white/[0.08] text-zinc-400 hover:border-white/[0.18] hover:text-zinc-200'
                    }`}
                  >
                    <span className="text-2xl">{cfg.icon}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold">{cfg.name}</p>
                      <p className="text-[10px] text-zinc-500 truncate">{cfg.hoursRange}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Live Apple Glass Status Bar */}
        <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/[0.06] border border-white/[0.1] text-lg">
              {locationConfig.emblem}
            </div>
            <div>
              <p className="font-bold text-white tracking-tight">
                {locationConfig.name} &bull; {TIME_OF_DAY_CONFIG[timeOfDay].name}
              </p>
              <p className="text-[11px] text-zinc-400">{locationConfig.vibe}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08]">
              <span className="text-zinc-400">Local Time: </span>
              <span className="text-white font-bold">{localTime}</span>
            </div>
            <div className="px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08]">
              <span className="text-zinc-400">Zone: </span>
              <span className="text-[#2997ff] font-bold">{locationConfig.timeZone}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Apple Bento Grid ("Power in every detail.") */}
      <section className="max-w-6xl mx-auto space-y-10">
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-[-0.03em]">
            Power in every detail.
          </h2>
          <p className="text-base text-zinc-400 max-w-xl mx-auto tracking-tight">
            Every feature is calibrated to remove friction, enhance collaboration, and bring clarity to complex journeys.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {corePillars.map((feature) => (
            <div
              key={feature.title}
              className={`apple-glass-card p-7 space-y-4 flex flex-col justify-between group ${feature.colSpan}`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-white/[0.06] border border-white/[0.1] group-hover:scale-105 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide border ${feature.accentColor}`}>
                    {feature.tag}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight">{feature.title}</h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">{feature.description}</p>
              </div>

              {feature.highlight && (
                <div className="mt-4 pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs text-[#bf5af2] font-semibold">
                  <span>Structured Day-by-Day Generation</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 4. The 4-Stage Travel Storyflow */}
      <section className="max-w-5xl mx-auto space-y-10">
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-[-0.03em]">
            From inception to arrival.
          </h2>
          <p className="text-sm text-zinc-400 tracking-tight">Every phase of your trip orchestrated in effortless sync.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {travelStorySteps.map((step) => (
            <div key={step.num} className="apple-glass-card p-6 space-y-3">
              <span className="text-3xl font-mono font-black text-white/90 tracking-tighter">{step.num}</span>
              <h4 className="text-sm font-bold text-white tracking-tight">{step.title}</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Apple Theater Grand Finale CTA */}
      <section className="max-w-4xl mx-auto rounded-[36px] bg-gradient-to-b from-[#16161d] to-[#0a0a0d] border border-white/[0.12] p-10 sm:p-16 text-center space-y-7 shadow-[0_24px_80px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.15)] relative overflow-hidden">
        {/* Ambient Top Glow in CTA */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-white/[0.08] blur-3xl pointer-events-none" />

        <div className="relative flex justify-center">
          <TravelLogo size="xl" />
        </div>

        <div className="space-y-2 relative">
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Ready for your next journey?
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 max-w-md mx-auto leading-relaxed">
            Join world explorers, remote nomad collectives, and team expeditions who plan effortlessly with ARC-NOMAD.
          </p>
        </div>

        <div className="pt-2 relative flex flex-wrap items-center justify-center gap-3">
          <Link href="/register">
            <Button variant="primary" size="lg" className="px-8 py-3.5 text-sm font-semibold rounded-full shadow-[0_2px_20px_rgba(255,255,255,0.25)]">
              Create Your Free Account
            </Button>
          </Link>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => demoLogin('alex_nomad')}
            className="px-7 py-3.5 text-sm font-medium rounded-full backdrop-blur-xl"
          >
            Launch Tokyo Demo
          </Button>
        </div>
      </section>
    </div>
  );
}
