'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Calendar,
  Clock,
  Plane,
  Compass,
  Sparkles,
  ArrowRight,
  Shield,
  CreditCard,
  Luggage,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Users,
  Coins,
} from 'lucide-react';
import { TripSummary } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface DestinationDossier {
  country: string;
  emblem: string;
  vibe: string;
  timezone: string;
  highlights: string[];
  climatePacking: string;
  transitEtiquette: string;
  currencyTips: string;
  languagePhrase: string;
}

const DOSSIER_DATABASE: Record<string, DestinationDossier> = {
  tokyo: {
    country: 'Japan',
    emblem: '🗼',
    vibe: 'Hyper-Modern Urbanism & Sacred Serenity',
    timezone: 'Asia/Tokyo',
    highlights: ['Shibuya Crossing & Harajuku', 'Meiji Jingu Shrine', 'Tsukiji Outer Market', 'Akihabara Tech Quarter', 'Shinjuku Gyoen National Garden'],
    climatePacking: 'Layered breathable clothing with comfortable slip-on walking shoes for temple visits. Carry a compact rain umbrella.',
    transitEtiquette: 'Use a Suica or Pasmo IC card for metro & convenience stores. Stand on the left of escalators. Zero tipping culture.',
    currencyTips: 'Japanese Yen (¥). While cards are widely accepted, keep small cash notes for local ramen shops and temple stalls.',
    languagePhrase: 'Arigatou gozaimasu (Thank you) • Sumimasen (Excuse me / Sorry)',
  },
  japan: {
    country: 'Japan',
    emblem: '🇯🇵',
    vibe: 'Ancient Traditions Meets Futuristic High-Speed Transit',
    timezone: 'Asia/Tokyo',
    highlights: ['Kyoto Gion District', 'Fushimi Inari Torii Gates', 'Mount Fuji Viewpoints', 'Dotonbori Osaka Food Street'],
    climatePacking: 'Comfortable walking gear, slip-on shoes, all-weather outer shell, pocket Wi-Fi or eSIM.',
    transitEtiquette: 'Shinkansen bullet train for intercity travel. Quiet carriage etiquette is strictly observed.',
    currencyTips: 'Japanese Yen (¥). IC Cards (Suica/Pasmo) work across train networks nationwide.',
    languagePhrase: 'Konnichiwa (Hello) • O-negai shimasu (Please)',
  },
  paris: {
    country: 'France',
    emblem: '🥐',
    vibe: 'Artistic Grandeur, Haussmann Boulevards & Cafe Culture',
    timezone: 'Europe/Paris',
    highlights: ['Louvre & Musée d’Orsay', 'Eiffel Tower at Twilight', 'Montmartre & Sacré-Cœur', 'Le Marais Boutiques', 'Seine River Promenade'],
    climatePacking: 'Smart casual aesthetic, comfortable cobblestone walking boots, classic trench coat or light wool layer.',
    transitEtiquette: 'Navigo Easy card or contactless metro tickets. Always greet shopkeepers with "Bonjour" before browsing.',
    currencyTips: 'Euro (€). Contactless payments accepted almost everywhere. Small change appreciated for bistros.',
    languagePhrase: 'Bonjour (Good day) • Merci beaucoup (Thank you very much) • S\'il vous plaît (Please)',
  },
  france: {
    country: 'France',
    emblem: '🇫🇷',
    vibe: 'Iconic Architecture, French Gastronomy & Historic Châteaux',
    timezone: 'Europe/Paris',
    highlights: ['Versailles Palace', 'Provence Lavender Fields', 'French Riviera Coastline', 'Bordeaux Wine Estates'],
    climatePacking: 'Chic layered attire, polarized sunglasses, versatile footwear for walking and dining.',
    transitEtiquette: 'SNCF TGV high-speed trains for regional journeys. Reserve seats well in advance.',
    currencyTips: 'Euro (€). Visa and Mastercard universally supported.',
    languagePhrase: 'Bonsoir (Good evening) • Bonne journée (Have a good day)',
  },
  'new york': {
    country: 'United States',
    emblem: '🗽',
    vibe: 'Unstoppable Momentum, Iconic Skylines & Cultural Diversity',
    timezone: 'America/New_York',
    highlights: ['Central Park & The Ramble', 'High Line & Chelsea Market', 'Broadway Theatre District', 'Brooklyn Bridge Walk', 'MoMA Modern Art'],
    climatePacking: 'High-comfort walking sneakers are mandatory. Layered outerwear tailored to the current season.',
    transitEtiquette: 'OMNY contactless tap-to-pay on all subway turnstiles and MTA buses. Keep right on pedestrian sidewalks.',
    currencyTips: 'US Dollar ($). 100% cashless friendly. Standard tipping is 18% to 20% at seated dining establishments.',
    languagePhrase: 'Sidewalk rule: Step to the wall to check your phone or map.',
  },
  reykjavik: {
    country: 'Iceland',
    emblem: '❄️',
    vibe: 'Pristine Glaciers, Volcanic Wonder & Polar Clarity',
    timezone: 'Atlantic/Reykjavik',
    highlights: ['Blue Lagoon Geothermal Spa', 'Golden Circle Route', 'Hallgrímskirkja Tower', 'Northern Lights / Midnight Sun', 'Black Sand Beach Vik'],
    climatePacking: 'Windproof and waterproof outer jacket, thermal Merino wool base layers, sturdy waterproof trekking shoes.',
    transitEtiquette: 'Strætó municipal buses or 4x4 rental vehicle. Strictly observe off-road driving bans to protect fragile moss.',
    currencyTips: 'Icelandic Króna (kr). Cards accepted everywhere including remote trailheads and public restrooms. Zero tipping expected.',
    languagePhrase: 'Takk fyrir (Thank you very much) • Góðan daginn (Good morning)',
  },
  rome: {
    country: 'Italy',
    emblem: '🏛️',
    vibe: 'Millennia of Living History, Sunlit Piazzas & Gastronomy',
    timezone: 'Europe/Rome',
    highlights: ['The Colosseum & Roman Forum', 'Vatican Museums & Sistine Chapel', 'Trevi Fountain by Night', 'Trastevere Culinary Alleys', 'The Pantheon'],
    climatePacking: 'Modest attire covering shoulders and knees required for basilicas. Sun hat, refillable water bottle for public fountains.',
    transitEtiquette: 'ATAC metro and tram network. Validate paper tickets before boarding. Drink espresso standing at the bar like a local.',
    currencyTips: 'Euro (€). Small Euro coins useful for espresso and historic gelato shops. "Coperto" bread/table fee is normal.',
    languagePhrase: 'Grazie mille (Thanks a million) • Per favore (Please) • Ciao (Hi/Bye)',
  },
  italy: {
    country: 'Italy',
    emblem: '🇮🇹',
    vibe: 'Renaissance Art, Coastal Panoramas & Slow Food Philosophy',
    timezone: 'Europe/Rome',
    highlights: ['Florence Duomo', 'Venice Grand Canal', 'Amalfi Coast Cliffs', 'Cinque Terre Walking Trails'],
    climatePacking: 'Breathable linens for summer, stylish light layers, sturdy walking shoes for stone steps.',
    transitEtiquette: 'Trenitalia / Italo high-speed trains connect major cities smoothly.',
    currencyTips: 'Euro (€). Contactless card payment available throughout.',
    languagePhrase: 'Buon appetito (Enjoy your meal) • Arrivederci (Goodbye)',
  },
};

function resolveDossier(destination: string): DestinationDossier {
  const norm = destination.toLowerCase().trim();
  for (const [key, dossier] of Object.entries(DOSSIER_DATABASE)) {
    if (norm.includes(key) || key.includes(norm)) {
      return dossier;
    }
  }

  // Dynamic intelligent fallback for uncataloged destinations
  return {
    country: destination,
    emblem: '🧭',
    vibe: 'Global Nomad Adventure & Cultural Discovery',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    highlights: ['Historic Old Town Center', 'Local Cultural Heritage Sites', 'Regional Culinary Market & Street Food', 'Scenic Panoramic Viewpoint'],
    climatePacking: 'Check 7-day forecast before departure. Pack versatile moisture-wicking layers, emergency medical kit, and universal power adapter.',
    transitEtiquette: 'Research local airport express transit options upon arrival. Download offline maps and local transit cards.',
    currencyTips: 'Check live exchange rates in the Currency Calculator before arrival. Inform your credit card bank of foreign travel dates.',
    languagePhrase: 'Learn basic local greetings: Hello, Please, and Thank you.',
  };
}

interface UpcomingBriefingWidgetProps {
  trips: TripSummary[];
}

export const UpcomingBriefingWidget: React.FC<UpcomingBriefingWidgetProps> = ({ trips }) => {
  const now = new Date();

  // Filter for active or upcoming trips
  const activeOrUpcoming = useMemo(() => {
    return trips
      .filter((t) => {
        const end = new Date(t.end_date);
        return end >= now || t.status === 'ACTIVE' || t.status === 'PLANNING';
      })
      .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
  }, [trips, now]);

  const [selectedTripId, setSelectedTripId] = useState<string>(
    activeOrUpcoming.length > 0 ? activeOrUpcoming[0].id : ''
  );

  // Automatically reset to the current user's first trip when the trips list updates
  useEffect(() => {
    if (activeOrUpcoming.length > 0) {
      if (!activeOrUpcoming.some((t) => t.id === selectedTripId)) {
        setSelectedTripId(activeOrUpcoming[0].id);
      }
    } else {
      setSelectedTripId('');
    }
  }, [activeOrUpcoming, selectedTripId]);

  // Keep selection synchronized if trips change
  const currentTrip = useMemo(() => {
    return activeOrUpcoming.find((t) => t.id === selectedTripId) || activeOrUpcoming[0] || null;
  }, [activeOrUpcoming, selectedTripId]);

  if (!currentTrip) {
    // Discovery Mode: Curated explorer dossiers for users without upcoming trips
    return (
      <div className="rounded-3xl bg-theme-surface border border-theme-subtle p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-theme-subtle">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xl">🗺️</span>
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                Upcoming Expeditions & Destination Briefing
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              No active travels scheduled yet. Explore curated destination dossiers and launch your next itinerary.
            </p>
          </div>

          <Link href="/trips/create">
            <Button variant="primary" size="sm" className="gap-2 font-bold text-xs">
              <Sparkles className="w-3.5 h-3.5" />
              Plan Next Journey
            </Button>
          </Link>
        </div>

        {/* Curated destination tiles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'Tokyo, Japan', emblem: '🗼', vibe: 'Cyber Obsidian & Cherry Blossom', desc: 'Cutting-edge technology, Michelin ramen, historic shrines.' },
            { name: 'Reykjavik, Iceland', emblem: '❄️', vibe: 'Glacial Mineral & Aurora Borealis', desc: 'Thermal lagoons, waterfalls, volcanic lava fields.' },
            { name: 'Paris, France', emblem: '🥐', vibe: 'Haussmann Slate & Champagne Gold', desc: 'World-class art museums, Seine walks, legendary bakeries.' },
          ].map((item) => (
            <div
              key={item.name}
              className="p-4 rounded-2xl bg-theme-surface-raised border border-theme-subtle space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{item.emblem}</span>
                  <div>
                    <h4 className="text-sm font-bold text-white">{item.name}</h4>
                    <p className="text-[11px] text-blue-400 font-medium">{item.vibe}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>

              <Link href={`/trips/create?dest=${encodeURIComponent(item.name)}`}>
                <Button variant="outline" size="sm" className="w-full text-xs gap-1.5 border-theme-subtle hover:border-theme-strong">
                  Architect This Journey
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Calculate timing metrics
  const startDate = new Date(currentTrip.start_date);
  const endDate = new Date(currentTrip.end_date);
  const diffDays = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const isActive = startDate <= now && endDate >= now;
  const durationDays = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);

  // Resolve dossier
  const dossier = resolveDossier(currentTrip.destination);

  // Local destination time calculation
  let destinationTime = '--:--';
  try {
    destinationTime = new Intl.DateTimeFormat('en-US', {
      timeZone: dossier.timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(now);
  } catch (e) {
    destinationTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div className="rounded-3xl bg-theme-surface border border-theme-subtle p-5 sm:p-7 space-y-6 shadow-2xl">
      {/* 1. Header & Expedition Selection Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-theme-subtle">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">🗺️</span>
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              Upcoming Expeditions & Destination Intelligence
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Real-time logistical briefings, cultural notes, and departure countdowns for your next stops.
          </p>
        </div>

        {/* Multi-Trip Selection Tabs */}
        {activeOrUpcoming.length > 1 && (
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-theme-surface-raised border border-theme-subtle overflow-x-auto max-w-full">
            {activeOrUpcoming.map((t) => {
              const isSelected = t.id === currentTrip.id;
              const tripDossier = resolveDossier(t.destination);
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedTripId(t.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
                    isSelected
                      ? 'bg-theme-accent text-white shadow-sm font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-theme-surface'
                  }`}
                >
                  <span>{tripDossier.emblem}</span>
                  <span className="truncate max-w-[120px]">{t.destination}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Hero Expedition Spotlight Strip */}
      <div className="p-5 rounded-2xl bg-theme-surface-raised border border-theme-subtle flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-2xl">{dossier.emblem}</span>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-950 border border-blue-800/50 text-blue-300">
              {isActive ? 'EXPEDITION ACTIVE NOW' : diffDays === 0 ? 'DEPARTS TODAY' : `DEPARTS IN ${diffDays} DAYS`}
            </span>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-cyan-950 border border-cyan-800/50 text-cyan-300 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-cyan-400" />
              {currentTrip.destination}
            </span>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-theme-surface border border-theme-subtle text-slate-300 flex items-center gap-1">
              <Shield className="w-3 h-3 text-slate-400" />
              Role: {currentTrip.user_role}
            </span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {currentTrip.title}
          </h3>

          <p className="text-xs text-slate-400 flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              {startDate.toLocaleDateString([], { month: 'short', day: 'numeric' })} –{' '}
              {endDate.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
              <span className="text-slate-500">({durationDays} Days)</span>
            </span>

            <span className="flex items-center gap-1.5 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              Local Time: <strong className="text-white font-mono">{destinationTime}</strong>
              <span className="text-slate-500 font-mono text-[11px]">({dossier.timezone})</span>
            </span>

            <span className="flex items-center gap-1.5 text-slate-300">
              <Users className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              Crew: <strong className="text-white">{currentTrip.member_count} Explorers</strong>
            </span>
          </p>
        </div>

        {/* Primary Workspace CTA */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Link href={`/trips/${currentTrip.id}`}>
            <Button variant="primary" size="md" className="gap-2 text-xs sm:text-sm font-bold bg-theme-accent hover:opacity-90">
              Open Trip Workspace
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href={`/trips/${currentTrip.id}?tab=itinerary`}>
            <Button variant="secondary" size="md" className="gap-2 text-xs sm:text-sm">
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              Itinerary
            </Button>
          </Link>
        </div>
      </div>

      {/* 3. 4-Pillar Destination Intelligence Grid (Strict Dual-Tone: Tone 1 Blue & Tone 2 Cyan) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pillar 1: Highlights & Sights (Tone 1: Primary) */}
        <div className="p-4 rounded-2xl bg-theme-surface-raised border border-theme-subtle space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-blue-400" />
                Key Sights & Vibe
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800/40 uppercase tracking-wider">
                Highlights
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-200">
              {dossier.vibe}
            </p>
            <ul className="space-y-1.5 pt-1">
              {dossier.highlights.slice(0, 3).map((item, i) => (
                <li key={i} className="text-xs text-slate-400 flex items-start gap-1.5 leading-relaxed">
                  <span className="text-theme-accent text-xs mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-2 border-t border-theme-subtle/80">
            <Link
              href={`/trips/${currentTrip.id}?tab=map`}
              className="text-[11px] font-semibold text-theme-accent hover:underline flex items-center gap-1"
            >
              Explore spatial map &rarr;
            </Link>
          </div>
        </div>

        {/* Pillar 2: Climate & Packing Readiness */}
        <div className="p-4 rounded-2xl bg-theme-surface-raised border border-theme-subtle space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Luggage className="w-3.5 h-3.5 text-cyan-400" />
                Climate &amp; Packing
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/40 uppercase tracking-wider">
                Readiness
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {dossier.climatePacking}
            </p>
          </div>

          <div className="pt-2 border-t border-theme-subtle/80 text-[11px] text-slate-400">
            <span>Destination dates: <strong className="text-slate-200">{startDate.toLocaleDateString([], { month: 'short' })} – {endDate.toLocaleDateString([], { month: 'short' })}</strong></span>
          </div>
        </div>

        {/* Pillar 3: Transit, Currency & Etiquette */}
        <div className="p-4 rounded-2xl bg-theme-surface-raised border border-theme-subtle space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-blue-400" />
                Transit &amp; Customs
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800/40 uppercase tracking-wider">
                Logistics
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {dossier.transitEtiquette}
            </p>
            <p className="text-[11px] text-slate-400">
              {dossier.currencyTips}
            </p>
          </div>

          <div className="pt-2 border-t border-theme-subtle/80">
            <p className="text-[11px] text-slate-400 italic truncate">
              {dossier.languagePhrase}
            </p>
          </div>
        </div>

        {/* Pillar 4: Expedition Readiness Checklist */}
        <div className="p-4 rounded-2xl bg-theme-surface-raised border border-theme-subtle space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                Expedition Readiness
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/40 uppercase tracking-wider">
                Checked
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="p-2 rounded-xl bg-theme-surface border border-theme-subtle flex items-center justify-between text-xs">
                <span className="text-slate-300">Flights & Transit</span>
                <span className="text-cyan-400 font-bold text-[11px] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Tracked
                </span>
              </div>

              <div className="p-2 rounded-xl bg-theme-surface border border-theme-subtle flex items-center justify-between text-xs">
                <span className="text-slate-300">AI Daily Timetable</span>
                <span className="text-cyan-400 font-bold text-[11px] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Configured
                </span>
              </div>

              <div className="p-2 rounded-xl bg-theme-surface border border-theme-subtle flex items-center justify-between text-xs">
                <span className="text-slate-300">Debt Solver Ledger</span>
                <span className="text-cyan-400 font-bold text-[11px] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Ready
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-theme-subtle/80 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">PDF & Excel Dossier:</span>
            <Link href={`/trips/${currentTrip.id}`} className="text-blue-400 hover:underline font-semibold">
              Ready to Export
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
