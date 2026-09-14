'use client';

import React, { useState } from 'react';
import { Award, Sparkles, ChevronRight, Info, ShieldCheck, Zap } from 'lucide-react';
import { GamificationStats } from '../../services/gamificationService';

interface LevelProgressPillProps {
  stats: GamificationStats;
}

export const LevelProgressPill: React.FC<LevelProgressPillProps> = ({ stats }) => {
  const [open, setOpen] = useState(false);
  const { currentRank, nextRank, totalXp, progressPercent, xpToNextLevel } = stats;

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-800/80 transition-all cursor-pointer group shadow-sm text-left"
      >
        <span className="text-base leading-none group-hover:scale-110 transition-transform">
          {currentRank.badgeEmblem}
        </span>
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white tracking-tight whitespace-nowrap">
              Lvl {currentRank.level} · {currentRank.title}
            </span>
            <span className="text-[10px] font-mono font-bold text-cyan-300 bg-cyan-950/70 px-1.5 py-0.5 rounded border border-cyan-800/40 leading-none">
              {totalXp} XP
            </span>
          </div>
          {/* Mini progress track */}
          <div className="w-28 h-1 bg-slate-800 rounded-full overflow-hidden mt-1 border border-slate-700/40">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </button>

      {/* Popover Breakdown Modal / Card */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 sm:left-0 sm:right-auto mt-2 w-72 sm:w-80 p-4 rounded-2xl bg-slate-900/95 backdrop-blur border border-theme-strong shadow-2xl z-50 space-y-3.5 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{currentRank.badgeEmblem}</span>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    {currentRank.title}
                  </h4>
                  <p className="text-[10px] text-blue-400 font-semibold">
                    Level {currentRank.level} Explorer Status
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-800/40">
                {totalXp} XP Total
              </span>
            </div>

            {/* Progress to next level */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Next Tier Progress</span>
                <span className="text-white font-bold font-mono">
                  {nextRank ? `${xpToNextLevel} XP needed` : 'Max Tier Reached 👑'}
                </span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              {nextRank && (
                <p className="text-[10px] text-slate-400 flex items-center justify-between">
                  <span>Current: {currentRank.title}</span>
                  <span className="text-cyan-400 font-semibold">Next: {nextRank.title}</span>
                </p>
              )}
            </div>

            {/* Current Level Perk */}
            <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Active Tier Privilege
              </span>
              <p className="text-slate-200 text-[11px] leading-relaxed">
                {currentRank.perk}
              </p>
            </div>

            {/* How to earn more XP */}
            <div className="space-y-1 text-[10px] text-slate-400">
              <span className="font-bold text-slate-300 uppercase tracking-wider block">
                How to Earn Explorer XP:
              </span>
              <ul className="space-y-0.5 pl-3 list-disc text-slate-400">
                <li><strong className="text-white">+150 XP</strong> for mapping a new journey</li>
                <li><strong className="text-white">+250 XP</strong> for completing an expedition</li>
                <li><strong className="text-white">+25 XP</strong> for ticking off itinerary spots</li>
                <li><strong className="text-white">+20 XP</strong> per traveler added to your crew</li>
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
