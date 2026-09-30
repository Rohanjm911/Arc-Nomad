'use client';

import React, { useState, useEffect } from 'react';
import {
  Compass,
  MapPin,
  CreditCard,
  Plane,
  Trophy,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  X,
  Lightbulb,
  Users,
  Coins,
  ShieldCheck,
  CalendarCheck,
} from 'lucide-react';
import { TravelLogo } from '../ui/TravelLogo';

interface OnboardingTourModalProps {
  isOpen: boolean;
  onClose: (dontShowAgain?: boolean) => void;
  userName?: string;
}

interface TourStep {
  id: string;
  badge: string;
  tabLabel: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  accentColor: string;
  points: {
    icon: React.ReactNode;
    title: string;
    description: string;
  }[];
  proTip: string;
}

export const OnboardingTourModal: React.FC<OnboardingTourModalProps> = ({
  isOpen,
  onClose,
  userName = 'Explorer',
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(true);

  const steps: TourStep[] = [
    {
      id: 'welcome',
      badge: 'Step 1 of 5 • Overview',
      tabLabel: 'Overview',
      title: `Welcome, ${userName}!`,
      subtitle: 'ARC-NOMAD is your intelligent collaborative travel cockpit designed for effortless group expeditions.',
      icon: <Compass className="w-8 h-8 text-[#2997ff]" />,
      accentColor: 'from-[#0071e3]/20 via-[#2997ff]/10 to-transparent',
      points: [
        {
          icon: <MapPin className="w-4 h-4 text-[#2997ff]" />,
          title: 'Plan Expeditions Collaboratively',
          description: 'Build day-by-day itineraries with companions, vote on stops, and sync in real time.',
        },
        {
          icon: <Coins className="w-4 h-4 text-[#30d158]" />,
          title: 'Split Bills & Manage Wallets',
          description: 'Equal, percentage, or custom splits with live multi-currency conversions across 160+ currencies.',
        },
        {
          icon: <Plane className="w-4 h-4 text-[#ff9f0a]" />,
          title: 'Flights & Digital Boarding Passes',
          description: 'Live departure boards, terminal alerts, and Apple Wallet-inspired digital boarding cards.',
        },
      ],
      proTip: 'You can test any feature immediately using our pre-loaded demo expeditions or create your own custom adventure.',
    },
    {
      id: 'trips',
      badge: 'Step 2 of 5 • Expeditions',
      tabLabel: 'Trips & Plans',
      title: 'Create & Manage Journeys',
      subtitle: 'Organize trips down to the hour with real-time updates and interactive maps.',
      icon: <CalendarCheck className="w-8 h-8 text-[#0071e3]" />,
      accentColor: 'from-[#0071e3]/25 via-[#2997ff]/10 to-transparent',
      points: [
        {
          icon: <Users className="w-4 h-4 text-[#2997ff]" />,
          title: 'Invite Travel Companions',
          description: 'Add friends by username or email. Assign roles (Owner, Editor, Viewer) to keep planning organized.',
        },
        {
          icon: <MapPin className="w-4 h-4 text-[#2997ff]" />,
          title: 'Daily Schedules & Activity Voting',
          description: 'Structure morning, afternoon, and evening slots. Companions can upvote top places to visit.',
        },
        {
          icon: <ShieldCheck className="w-4 h-4 text-[#30d158]" />,
          title: 'Interactive Maps & Geolocation',
          description: 'Inspect every hotel, cafe, landmark, and transit hub pinned directly on an interactive map.',
        },
      ],
      proTip: 'Click "Plan New Journey" from your dashboard or use "AI Travel Architect" to auto-generate a custom itinerary.',
    },
    {
      id: 'wallet',
      badge: 'Step 3 of 5 • Finance',
      tabLabel: 'Split Wallet',
      title: 'Zero-Stress Expense Splitting',
      subtitle: 'Never worry about who paid for dinner, trains, or hotels on group trips.',
      icon: <CreditCard className="w-8 h-8 text-[#30d158]" />,
      accentColor: 'from-[#30d158]/20 via-[#2997ff]/10 to-transparent',
      points: [
        {
          icon: <Coins className="w-4 h-4 text-[#30d158]" />,
          title: 'Instant Multi-Currency Splits',
          description: 'Record expenses in Yen, Euros, Dollars, or Rupees. The app auto-calculates debts in your base currency.',
        },
        {
          icon: <Users className="w-4 h-4 text-[#2997ff]" />,
          title: 'Debt Simplification Engine',
          description: 'Reduces the total number of peer-to-peer repayments so group settlements are clean and fast.',
        },
        {
          icon: <Sparkles className="w-4 h-4 text-[#bf5af2]" />,
          title: 'Real-Time FX Calculator',
          description: 'Use the Quick Currency widget on your dashboard to convert street prices in seconds.',
        },
      ],
      proTip: 'Inside any trip, open the "Expenses" tab to record a group meal or taxi fare in one tap.',
    },
    {
      id: 'flights',
      badge: 'Step 4 of 5 • Transit',
      tabLabel: 'Flights & Passes',
      title: 'Smart Flight Cockpit',
      subtitle: 'Keep your departure gates, baggage claims, and digital passes at your fingertips.',
      icon: <Plane className="w-8 h-8 text-[#ff9f0a]" />,
      accentColor: 'from-[#ff9f0a]/20 via-[#0071e3]/10 to-transparent',
      points: [
        {
          icon: <Plane className="w-4 h-4 text-[#ff9f0a]" />,
          title: 'Live Flight Status',
          description: 'Track gate changes, departure countdowns, delay notifications, and terminal info in real time.',
        },
        {
          icon: <CheckCircle2 className="w-4 h-4 text-[#30d158]" />,
          title: 'Apple Wallet Boarding Pass',
          description: 'Access high-contrast boarding passes complete with QR barcodes, seat numbers, and flight classes.',
        },
        {
          icon: <Compass className="w-4 h-4 text-[#2997ff]" />,
          title: 'Unified Dashboard Widget',
          description: 'Your next upcoming flight is always pinned directly on the main dashboard for quick access.',
        },
      ],
      proTip: 'Tap "View Boarding Pass" on any flight card to open a full-screen digital ticket ready for airport security.',
    },
    {
      id: 'gamification',
      badge: 'Step 5 of 5 • Level Up',
      tabLabel: 'Badges & AI',
      title: 'Explorer Passport & AI Concierge',
      subtitle: 'Turn every journey into achievements, earn badges, and get AI recommendations.',
      icon: <Trophy className="w-8 h-8 text-[#ffd60a]" />,
      accentColor: 'from-[#ffd60a]/20 via-[#0071e3]/10 to-transparent',
      points: [
        {
          icon: <Trophy className="w-4 h-4 text-[#ffd60a]" />,
          title: 'Expedition XP & Tiered Badges',
          description: 'Earn explorer points for logging journeys, splitting expenses, and visiting new global countries.',
        },
        {
          icon: <Sparkles className="w-4 h-4 text-[#bf5af2]" />,
          title: 'AI Smart Recommendations',
          description: 'Tailored advice for hidden local gems, food spots, and attractions matched to your travel style.',
        },
        {
          icon: <Compass className="w-4 h-4 text-[#2997ff]" />,
          title: 'Digital Explorer Passport',
          description: 'Track visited countries with real flags and your travel milestones right on your profile page.',
        },
      ],
      proTip: 'Look at the XP badge in the top right header anytime to see your current Explorer level and next tier!',
    },
  ];

  const current = steps[currentStep];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose(dontShowAgain);
      } else if (e.key === 'ArrowRight' && currentStep < steps.length - 1) {
        setCurrentStep((prev) => prev + 1);
      } else if (e.key === 'ArrowLeft' && currentStep > 0) {
        setCurrentStep((prev) => prev - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStep, dontShowAgain, onClose, steps.length]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onClose(dontShowAgain);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-2xl transition-all duration-300 animate-in fade-in"
    >
      {/* Apple ambient specular back-glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/[0.06] blur-3xl pointer-events-none -z-10" />

      <div className="w-full max-w-2xl rounded-[32px] bg-[#141419]/95 backdrop-blur-3xl border border-white/[0.14] shadow-[0_32px_90px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.15)] relative overflow-hidden flex flex-col max-h-[92vh]">
        {/* Subtle decorative top gradient bar */}
        <div className="h-1 w-full bg-gradient-to-r from-white via-zinc-400 to-zinc-600" />

        {/* Modal Top Bar */}
        <div className="px-6 pt-5 pb-4 border-b border-white/[0.08] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <TravelLogo size="sm" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white bg-white/[0.08] px-2 py-0.5 rounded-full border border-white/20">
                  {current.badge}
                </span>
              </div>
              <h2 className="text-sm font-semibold text-zinc-300 tracking-tight mt-0.5">
                ARC-NOMAD Explorer Guide
              </h2>
            </div>
          </div>

          <button
            onClick={() => onClose(dontShowAgain)}
            className="p-2 rounded-full text-zinc-400 hover:text-white bg-white/[0.05] hover:bg-white/[0.12] border border-white/[0.08] transition-all cursor-pointer"
            title="Close guide (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Interactive Step Pills / Tabs */}
        <div className="px-6 py-2.5 bg-black/25 border-b border-white/[0.06] flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {steps.map((s, idx) => {
            const isActive = idx === currentStep;
            const isCompleted = idx < currentStep;
            return (
              <button
                key={s.id}
                onClick={() => setCurrentStep(idx)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-white text-black shadow-[0_2px_12px_rgba(255,255,255,0.25)] font-semibold'
                    : isCompleted
                    ? 'bg-white/[0.06] text-zinc-300 hover:bg-white/[0.1]'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#30d158]" />
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full border border-current text-[9px] flex items-center justify-center font-bold">
                    {idx + 1}
                  </span>
                )}
                <span>{s.tabLabel}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 sm:p-7 overflow-y-auto space-y-6 scrollbar-none">
          {/* Main Card Hero */}
          <div
            className={`p-5 rounded-2xl bg-gradient-to-br ${current.accentColor} border border-white/[0.08] flex items-start gap-4 transition-all duration-300`}
          >
            <div className="p-3 rounded-2xl bg-[#1c1c24] border border-white/[0.1] shadow-lg shrink-0">
              {current.icon}
            </div>
            <div>
              <h3 id="onboarding-title" className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {current.title}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 mt-1 leading-relaxed">
                {current.subtitle}
              </p>
            </div>
          </div>

          {/* 3 Core Points */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Key Features
            </h4>
            <div className="grid grid-cols-1 gap-2.5">
              {current.points.map((pt, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] transition-all flex items-start gap-3"
                >
                  <div className="p-2 rounded-lg bg-white/[0.06] border border-white/[0.08] shrink-0 mt-0.5">
                    {pt.icon}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">{pt.title}</h5>
                    <p className="text-[11px] text-zinc-400 mt-0.5 leading-normal">{pt.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pro Tip Callout */}
          <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.12] flex items-start gap-3 text-xs text-zinc-300">
            <div className="p-1.5 rounded-lg bg-white/[0.08] shrink-0 text-white">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white mr-1">Pro Tip:</span>
              <span className="text-zinc-300">{current.proTip}</span>
            </div>
          </div>
        </div>

        {/* Footer Navigation Bar */}
        <div className="p-5 sm:px-7 sm:py-4 bg-[#0d0d11]/90 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3 mt-auto">
          {/* Don't show again toggle */}
          <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer select-none order-2 sm:order-1">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-4 h-4 rounded border-white/20 bg-white/10 text-white focus:ring-white/40 cursor-pointer"
            />
            <span>Don't show this again</span>
          </label>

          {/* Actions & Steps */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end order-1 sm:order-2">
            {currentStep > 0 && (
              <button
                onClick={handleBack}
                className="px-3.5 py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-xs font-medium text-zinc-200 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>
            )}

            <button
              onClick={() => onClose(dontShowAgain)}
              className="px-3.5 py-2 rounded-full text-xs font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              Skip
            </button>

            <button
              onClick={handleNext}
              className="px-5 py-2 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-semibold shadow-[0_2px_16px_rgba(255,255,255,0.25)] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>{currentStep === steps.length - 1 ? 'Start Exploring' : 'Next Step'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
