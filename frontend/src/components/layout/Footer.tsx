import React from 'react';
import Link from 'next/link';
import { Sparkles, Shield, MapPin, Globe } from 'lucide-react';
import { TravelLogo } from '../ui/TravelLogo';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-white/[0.08] bg-black/90 pt-14 pb-12 mt-auto text-zinc-400 text-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Apple Style Footnotes / Disclaimer */}
        <div className="space-y-2 pb-8 border-b border-white/[0.08] text-[11px] leading-relaxed text-zinc-400">
          <p>
            1. AI itinerary generation and travel intelligence are powered by Google Gemini 3.7 Flash models. Recommendation accuracy depends on local business updates and seasonal operating schedules.
          </p>
          <p>
            2. Flight tracking, terminal assignments, and boarding pass data reflect real-time aviation feeds and local simulation endpoints for test expeditions.
          </p>
          <p>
            3. Circular debt reduction algorithm minimizes transaction overhead among group members using optimal greedy cash-flow simplification.
          </p>
        </div>

        {/* Directory Navigation Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 text-[12px]">
          {/* Brand Column */}
          <div className="col-span-2 sm:col-span-1 space-y-4">
            <TravelLogo size="sm" showText={true} />
            <p className="text-[11px] text-zinc-400 leading-relaxed max-w-xs">
              The intelligent operating system for collective travel, flight telemetry, and seamless group finance.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-[#2997ff] font-medium">
              <Globe className="w-3.5 h-3.5" />
              <span>Global Travel Mesh</span>
            </div>
          </div>

          {/* Column 1: Expeditions */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white tracking-tight uppercase">Expeditions</h4>
            <ul className="space-y-2 text-zinc-400">
              <li><Link href="/trips/1" className="hover:text-white transition-colors">Tokyo Expedition</Link></li>
              <li><Link href="/trips/create" className="hover:text-white transition-colors">Plan New Journey</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Upcoming Briefings</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Flight Boarding Passes</Link></li>
            </ul>
          </div>

          {/* Column 2: Platform Architecture */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white tracking-tight uppercase">Architecture</h4>
            <ul className="space-y-2 text-zinc-400">
              <li className="flex items-center gap-1.5 hover:text-white transition-colors">
                <Sparkles className="w-3 h-3 text-[#bf5af2]" />
                Gemini Flash AI
              </li>
              <li className="flex items-center gap-1.5 hover:text-white transition-colors">
                <MapPin className="w-3 h-3 text-[#2997ff]" />
                Leaflet Spatial Carto
              </li>
              <li className="flex items-center gap-1.5 hover:text-white transition-colors">
                <Shield className="w-3 h-3 text-[#30d158]" />
                Role-Based Access
              </li>
              <li><span className="hover:text-white transition-colors">WebSocket Real-Time Chat</span></li>
            </ul>
          </div>

          {/* Column 3: Explorer Hub */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white tracking-tight uppercase">Explorer Hub</h4>
            <ul className="space-y-2 text-zinc-400">
              <li><Link href="/profile" className="hover:text-white transition-colors">Explorer Persona</Link></li>
              <li><Link href="/friends" className="hover:text-white transition-colors">Travel Companions</Link></li>
              <li><Link href="/notifications" className="hover:text-white transition-colors">Flight Alerts</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Debt Matrix &amp; Ledger</Link></li>
            </ul>
          </div>

          {/* Column 4: Account & Security */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white tracking-tight uppercase">Nomad Cloud</h4>
            <ul className="space-y-2 text-zinc-400">
              <li><Link href="/login" className="hover:text-white transition-colors">Account Sign In</Link></li>
              <li><Link href="/register" className="hover:text-white transition-colors">Join Arc-Nomad</Link></li>
              <li><span className="hover:text-white transition-colors">Encrypted Ledgers</span></li>
              <li><span className="hover:text-white transition-colors">System Status: Operational</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal Bar */}
        <div className="pt-8 border-t border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-zinc-400">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>Copyright &copy; 2026 ARC-NOMAD Inc. All rights reserved.</span>
            <span className="text-zinc-600 hidden sm:inline">|</span>
            <span className="hover:text-white transition-colors cursor-pointer">Privacy Policy</span>
            <span className="hover:text-white transition-colors cursor-pointer">Terms of Use</span>
            <span className="hover:text-white transition-colors cursor-pointer">Sales Policy</span>
            <span className="hover:text-white transition-colors cursor-pointer">Legal Notice</span>
            <span className="hover:text-white transition-colors cursor-pointer">Site Map</span>
          </div>

          <div className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors cursor-pointer">
            <Globe className="w-3.5 h-3.5" />
            <span>United States / English</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

