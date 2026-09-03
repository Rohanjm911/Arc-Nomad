import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export type BadgeVariant =
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'
  | 'purple'
  | 'teal'
  | 'amber';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'sm',
  className,
  icon,
}) => {
  // Solid color badges with subtle matching solid background tint and crisp border
  const variants: Record<BadgeVariant, string> = {
    primary: 'bg-blue-950/80 text-blue-300 border border-blue-600/40',
    success: 'bg-emerald-950/80 text-emerald-300 border border-emerald-600/40',
    teal: 'bg-teal-950/80 text-teal-300 border border-teal-600/40',
    warning: 'bg-amber-950/80 text-amber-300 border border-amber-600/40',
    amber: 'bg-amber-950/80 text-amber-300 border border-amber-600/40',
    danger: 'bg-red-950/80 text-red-300 border border-red-600/40',
    info: 'bg-sky-950/80 text-sky-300 border border-sky-600/40',
    purple: 'bg-purple-950/80 text-purple-300 border border-purple-600/40',
    neutral: 'bg-slate-800 text-slate-300 border border-slate-700',
  };

  const sizes = {
    xs: 'px-1.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded',
    sm: 'px-2 py-0.5 text-[11px] font-semibold tracking-wide rounded-md',
    md: 'px-2.5 py-1 text-xs font-semibold rounded-lg',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1.5 shrink-0 select-none font-medium',
          variants[variant] || variants.neutral,
          sizes[size],
          className
        )
      )}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
};
