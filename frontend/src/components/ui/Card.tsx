import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  variant?: 'default' | 'surface' | 'raised' | 'highlight';
}

export const Card: React.FC<CardProps> = ({
  className,
  hoverEffect = false,
  variant = 'default',
  children,
  ...props
}) => {
  const variants = {
    default: 'bg-slate-900 border border-slate-800 text-slate-100',
    surface: 'bg-slate-950 border border-slate-800 text-slate-100',
    raised: 'bg-slate-800/90 border border-slate-700 text-slate-100',
    highlight: 'bg-slate-900 border-2 border-blue-600/50 text-slate-100',
  };

  return (
    <div
      className={twMerge(
        clsx(
          'rounded-2xl p-5 transition-colors duration-150',
          variants[variant],
          hoverEffect && 'hover:border-slate-600 hover:bg-slate-900/95 cursor-pointer',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
