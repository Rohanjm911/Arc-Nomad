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
} from 'lucide-react';
import { useAuth } from '../store/AuthContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export default function LandingPage() {
  const { user, demoLogin } = useAuth();

  const corePillars = [
    {
      title: 'AI Travel Architect',
      description: 'Generates structured, customizable day-by-day itineraries tailored to your travel style, pace, and interests.',
      icon: <Sparkles className="w-5 h-5 text-purple-400" />,
      accentColor: 'border-purple-600/30 bg-purple-950/20 text-purple-300',
      tag: 'Gemini 3.7 Flash',
    },
    {
      title: 'Synchronized Spatial Map',
      description: "Explore daily stops, attractions, and accommodations on Leaflet's free maps API (OpenStreetMap & Dark Matter) with interactive markers and route pathing.",
      icon: <MapPin className="w-5 h-5 text-teal-400" />,
      accentColor: 'border-teal-600/30 bg-teal-950/20 text-teal-300',
      tag: 'Leaflet Free Maps Engine',
    },
    {
      title: 'Circular Debt Simplification',
      description: 'Log group expenses with equal, exact, or percentage splits. Our minimum cash-flow algorithm minimizes transactions.',
      icon: <Receipt className="w-5 h-5 text-amber-400" />,
      accentColor: 'border-amber-600/30 bg-amber-950/20 text-amber-300',
      tag: 'Greedy Cashflow Optimizer',
    },
    {
      title: 'Live Flight Tracker',
      description: 'Real-time boarding passes with automated delay alerts, terminal/gate tracking, and status simulations.',
      icon: <Plane className="w-5 h-5 text-blue-400" />,
      accentColor: 'border-blue-600/30 bg-blue-950/20 text-blue-300',
      tag: 'Live Flight Status',
    },
    {
      title: 'Real-Time Group Chat',
      description: 'Collaborate with your travel crew instantly using low-latency WebSockets with message reactions and presence.',
      icon: <Users className="w-5 h-5 text-indigo-400" />,
      accentColor: 'border-indigo-600/30 bg-indigo-950/20 text-indigo-300',
      tag: 'WebSocket Sync',
    },
    {
      title: '1-Click Dossiers & Ledgers',
      description: 'Export publication-ready PDF travel guides and multi-tab Excel financial workbooks directly to your device.',
      icon: <FileSpreadsheet className="w-5 h-5 text-emerald-400" />,
      accentColor: 'border-emerald-600/30 bg-emerald-950/20 text-emerald-300',
      tag: 'ReportLab & openpyxl',
    },
  ];

  const travelStorySteps = [
    { num: '01', title: 'Define the Journey', desc: 'Pick your destination, dates, budget, and travel crew.' },
    { num: '02', title: 'Architect with AI', desc: 'Generate a rich timetable and fine-tune every stop.' },
    { num: '03', title: 'Track & Explore', desc: 'Monitor live flights, weather alerts, and map routes.' },
    { num: '04', title: 'Settle Seamlessly', desc: 'Split costs fairly with instant debt reduction matrices.' },
  ];

  return (
    <div className="space-y-24 py-8 sm:py-16">
      {/* 1. Hero Section (Clean, Solid, Travel-Centric, Zero Gradients) */}
      <section className="text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950 border border-blue-600/40 text-blue-300 text-xs font-bold tracking-wide">
          <Compass className="w-3.5 h-3.5 text-blue-400" />
          <span>COLLABORATIVE TRAVEL & LOGISTICS PLATFORM</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1]">
          Plan smarter. <br />
          <span className="text-blue-500">Travel better.</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          ARC-NOMADE unifies AI itinerary generation, synchronized spatial maps, real-time flight tracking, and automated group debt settlement into one cohesive travel workspace.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          {user ? (
            <Link href="/dashboard">
              <Button variant="primary" size="lg" className="gap-2 text-sm px-6 py-3">
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/register">
                <Button variant="primary" size="lg" className="gap-2 text-sm px-6 py-3">
                  Start Planning Free
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => demoLogin('alex_explorer')}
                className="gap-2 text-sm px-6 py-3"
              >
                <Sparkles className="w-4 h-4 text-purple-400" />
                Explore Demo Journey
              </Button>
            </>
          )}
        </div>

        {/* Feature Highlights Ticker */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-6 text-xs text-slate-400 font-medium">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            No spreadsheets needed
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Automatic circular debt solver
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Real-time group collaboration
          </span>
        </div>
      </section>

      {/* 2. Interactive Product Preview Mockup (Solid Cards, Clear UI) */}
      <section className="max-w-5xl mx-auto">
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-6 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="success" size="sm">ACTIVE TRIP</Badge>
                <Badge variant="purple" size="sm">AI OPTIMIZED</Badge>
              </div>
              <h2 className="text-xl font-bold text-white mt-1.5">Tokyo & Kyoto Autumn Expedition</h2>
              <p className="text-xs text-slate-400 flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1 text-teal-400 font-semibold">
                  <MapPin className="w-3.5 h-3.5" /> Japan
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" /> Oct 12 – Oct 20, 2026
                </span>
                <span>Budget: $4,500 USD</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-300">4 Travelers</span>
              <div className="flex items-center -space-x-2">
                <div className="w-7 h-7 rounded-full bg-blue-600 border border-slate-900 flex items-center justify-center text-[10px] font-bold text-white">AJ</div>
                <div className="w-7 h-7 rounded-full bg-teal-600 border border-slate-900 flex items-center justify-center text-[10px] font-bold text-white">MR</div>
                <div className="w-7 h-7 rounded-full bg-amber-600 border border-slate-900 flex items-center justify-center text-[10px] font-bold text-white">SC</div>
                <div className="w-7 h-7 rounded-full bg-purple-600 border border-slate-900 flex items-center justify-center text-[10px] font-bold text-white">EW</div>
              </div>
            </div>
          </div>

          {/* 3-Column Preview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* Column 1: Daily Schedule */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Day 1 • Shibuya & Harajuku</span>
                <span className="text-[11px] text-blue-400 font-semibold">4 Activities</span>
              </div>
              <div className="space-y-2">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-200">Meiji Jingu Shrine</p>
                    <p className="text-[10px] text-slate-400">09:00 AM • Sightseeing</p>
                  </div>
                  <Badge variant="amber" size="xs">Free</Badge>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-200">Fuunji Ramen Omakase</p>
                    <p className="text-[10px] text-slate-400">12:30 PM • Culinary</p>
                  </div>
                  <Badge variant="teal" size="xs">$18</Badge>
                </div>
              </div>
            </div>

            {/* Column 2: Flight Boarding Pass */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Flight NH106</span>
                <Badge variant="success" size="xs">ON TIME</Badge>
              </div>
              <div className="flex items-center justify-between pt-1">
                <div>
                  <p className="text-xl font-mono font-bold text-white">HND</p>
                  <p className="text-[10px] text-slate-400">Tokyo Haneda</p>
                </div>
                <Plane className="w-5 h-5 text-blue-400" />
                <div className="text-right">
                  <p className="text-xl font-mono font-bold text-white">KIX</p>
                  <p className="text-[10px] text-slate-400">Osaka Kansai</p>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 text-center border-t border-slate-800/80 pt-2">
                Gate 54B • Seat 14A • All Nippon Airways
              </p>
            </div>

            {/* Column 3: Debt Settlement Matrix */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Debt Settlement</span>
                <span className="text-[10px] font-bold text-emerald-400">All Balanced</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-1.5">
                <div className="flex items-center justify-between font-medium">
                  <span className="text-slate-300">Alex &rarr; Chloe</span>
                  <span className="font-bold text-white">$45.00</span>
                </div>
                <p className="text-[10px] text-slate-500">Shinkansen bullet train ticket split</p>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Total Spent: <strong className="text-white">$1,840</strong></span>
                <span>Budget Left: <strong className="text-emerald-400">$2,660</strong></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Core Feature Pillars Grid (6 Cards, Solid Styling) */}
      <section className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Engineered for Modern Travelers
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Everything you need to orchestrate complex itineraries without friction or clutter.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {corePillars.map((feature) => (
            <div
              key={feature.title}
              className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    {feature.icon}
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${feature.accentColor}`}>
                    {feature.tag}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white">{feature.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. The 4-Step Travel Storyflow */}
      <section className="max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            How ARC-NOMADE Works
          </h2>
          <p className="text-sm text-slate-400">From inception to landing, every phase is orchestrated.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {travelStorySteps.map((step) => (
            <div key={step.num} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-2xl font-black text-blue-500 font-mono">{step.num}</span>
              <h4 className="text-sm font-bold text-white">{step.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Final CTA Banner (Solid Navy, Crisp Button) */}
      <section className="max-w-4xl mx-auto rounded-3xl bg-slate-900 border border-slate-800 p-8 sm:p-12 text-center space-y-6">
        <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white mx-auto">
          <Compass className="w-6 h-6" />
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          Ready for your next journey?
        </h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Join explorers and nomad collectives who plan, travel, and settle together without stress.
        </p>
        <div className="pt-2">
          <Link href="/register">
            <Button variant="primary" size="lg" className="px-8 py-3.5 text-sm font-bold">
              Create Your Free Account
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
