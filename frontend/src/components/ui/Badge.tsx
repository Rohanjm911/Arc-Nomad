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
  const variants: Record<BadgeVariant, string> = {
    primary: 'bg-white/[0.12] text-white border border-white/[0.22] backdrop-blur-md shadow-sm',
    success: 'bg-[#30d158]/15 text-[#30d158] border border-[#30d158]/30 backdrop-blur-md',
    teal: 'bg-zinc-200/15 text-zinc-200 border border-zinc-300/30 backdrop-blur-md',
    warning: 'bg-[#ff9f0a]/15 text-[#ff9f0a] border border-[#ff9f0a]/30 backdrop-blur-md',
    amber: 'bg-[#ff9f0a]/15 text-[#ff9f0a] border border-[#ff9f0a]/30 backdrop-blur-md',
    danger: 'bg-[#ff453a]/15 text-[#ff453a] border border-[#ff453a]/30 backdrop-blur-md',
    info: 'bg-slate-200/15 text-slate-200 border border-slate-300/30 backdrop-blur-md',
    purple: 'bg-[#bf5af2]/15 text-[#bf5af2] border border-[#bf5af2]/30 backdrop-blur-md',
    neutral: 'bg-white/[0.06] text-zinc-300 border border-white/[0.1] backdrop-blur-md',
  };

  const sizes = {
    xs: 'px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-full',
    sm: 'px-2.5 py-0.5 text-[11px] font-medium tracking-tight rounded-full',
    md: 'px-3 py-1 text-xs font-medium tracking-tight rounded-full',
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
