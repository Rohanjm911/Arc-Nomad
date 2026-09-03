import React from 'react';
import Link from 'next/link';
import { PlusCircle, Sparkles, Receipt, UserPlus, Compass } from 'lucide-react';
import { Card } from '../ui/Card';

export const QuickActions: React.FC = () => {
  const actions = [
    {
      title: 'Plan New Trip',
      description: 'Create destination, dates & budget',
      icon: <PlusCircle className="w-5 h-5 text-indigo-400" />,
      href: '/trips/create',
      bgClass: 'hover:border-indigo-500/40 hover:bg-indigo-950/20',
    },
    {
      title: 'AI Travel Architect',
      description: 'Instant day-by-day generator',
      icon: <Sparkles className="w-5 h-5 text-purple-400" />,
      href: '/trips/create?ai=true',
      bgClass: 'hover:border-purple-500/40 hover:bg-purple-950/20',
    },
    {
      title: 'Find & Add Friends',
      description: 'Build your travel collective',
      icon: <UserPlus className="w-5 h-5 text-cyan-400" />,
      href: '/friends',
      bgClass: 'hover:border-cyan-500/40 hover:bg-cyan-950/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
      {actions.map((act) => (
        <Link key={act.title} href={act.href}>
          <Card
            hoverEffect
            className={`p-4 border-slate-800 transition-all flex items-start gap-3.5 ${act.bgClass}`}
          >
            <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/50 shrink-0">
              {act.icon}
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-100">{act.title}</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">{act.description}</p>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
};
