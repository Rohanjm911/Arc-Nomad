import React from 'react';
import { Sparkles, Shield, MapPin } from 'lucide-react';
import { TravelLogo } from '../ui/TravelLogo';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-slate-950/90 py-10 mt-auto text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <TravelLogo size="sm" showText={true} />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-slate-400 text-xs font-medium">
          <span className="flex items-center gap-1.5 hover:text-indigo-400 transition-colors">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Gemini AI Engine
          </span>
          <span className="flex items-center gap-1.5 hover:text-indigo-400 transition-colors">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            Leaflet Free Maps
          </span>
          <span className="flex items-center gap-1.5 hover:text-indigo-400 transition-colors">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            Enterprise RBAC
          </span>
        </div>

        <p className="text-slate-500 text-[11px] flex items-center gap-1">
          Crafted for world explorers & nomad collectives.
        </p>
      </div>
    </footer>
  );
};
