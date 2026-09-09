import React from 'react';
import Link from 'next/link';
import { PlusCircle, Sparkles, Receipt, UserPlus, Compass } from 'lucide-react';
import { Card } from '../ui/Card';

export const QuickActions: React.FC = () => {
  const actions = [
    {
      title: 'Plan New Journey',
      description: 'Destination, dates, crew & budget',
      icon: <PlusCircle className="w-5 h-5 text-blue-400" />,
      href: '/trips/create',
    },
    {
      title: 'AI Travel Architect',
      description: 'Structured timetable & stops',
      icon: <Sparkles className="w-5 h-5 text-purple-400" />,
      href: '/trips/create?ai=true',
    },
    {
      title: 'Travel Collective',
      description: 'Build your globetrotter network',
      icon: <UserPlus className="w-5 h-5 text-cyan-400" />,
      href: '/friends',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
      {actions.map((act) => (
        <Link key={act.title} href={act.href}>
          <Card
            hoverEffect
            className="p-4 rounded-2xl bg-theme-surface border border-theme-subtle hover:border-theme-strong hover:bg-theme-surface-raised transition-all flex items-start gap-3.5 shadow-sm"
          >
            <div className="p-2 rounded-xl bg-theme-surface-raised border border-theme-subtle shrink-0">
              {act.icon}
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">{act.title}</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">{act.description}</p>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
};
