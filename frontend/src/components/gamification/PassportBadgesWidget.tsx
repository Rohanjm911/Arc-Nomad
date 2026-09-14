'use client';

import React from 'react';
import { Award, Lock, CheckCircle2, Shield, Sparkles } from 'lucide-react';
import { PassportBadge } from '../../services/gamificationService';

interface PassportBadgesWidgetProps {
  badges: PassportBadge[];
  unlockedCount: number;
}

export const PassportBadgesWidget: React.FC<PassportBadgesWidgetProps> = ({
  badges,
  unlockedCount,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            Passport Insignia &amp; Badges
          </h3>
          <p className="text-xs text-slate-400">
            Collectible milestones earned through travels and discoveries
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-950/60 text-amber-300 border border-amber-800/40 font-mono">
          {unlockedCount}/{badges.length} Unlocked
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-3 ${
              badge.unlocked
                ? 'bg-theme-surface border-amber-500/30 hover:border-amber-500/60 hover:bg-theme-surface-raised shadow-md'
                : 'bg-theme-surface/60 border-theme-subtle opacity-65'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div
                  className={`w-10 h-10 rounded-2xl border flex items-center justify-center text-xl shadow-inner ${
                    badge.unlocked
                      ? 'bg-amber-950/40 border-amber-500/40'
                      : 'bg-slate-900 border-slate-800 text-slate-500 grayscale'
                  }`}
                >
                  {badge.icon}
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    badge.unlocked
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/40'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {badge.unlocked ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      Unlocked
                    </>
                  ) : (
                    <>
                      <Lock className="w-3 h-3 text-slate-500" />
                      Locked
                    </>
                  )}
                </span>
              </div>

              <div>
                <h4
                  className={`text-xs font-bold ${
                    badge.unlocked ? 'text-white' : 'text-slate-400'
                  }`}
                >
                  {badge.name}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed line-clamp-2">
                  {badge.description}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-theme-subtle/80 flex items-center justify-between text-[10px]">
              <span className="text-slate-500 font-semibold uppercase tracking-wider">Status:</span>
              <span
                className={`font-semibold ${
                  badge.unlocked ? 'text-emerald-400' : 'text-slate-400 font-mono'
                }`}
              >
                {badge.progressText}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
