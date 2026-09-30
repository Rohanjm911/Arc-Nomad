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
    default: 'bg-[#121216]/65 backdrop-blur-xl border border-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),0_12px_32px_-8px_rgba(0,0,0,0.5)] text-theme-primary',
    surface: 'bg-[#18181f]/75 backdrop-blur-2xl border border-white/[0.1] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_16px_40px_-10px_rgba(0,0,0,0.6)] text-theme-primary',
    raised: 'bg-[#1f1f27]/80 backdrop-blur-2xl border border-white/[0.14] shadow-[inset_0_1px_1px_rgba(255,255,255,0.12),0_20px_50px_rgba(0,0,0,0.6)] text-theme-primary',
    highlight: 'bg-[#181820]/90 backdrop-blur-2xl border-2 border-white/70 shadow-[0_0_35px_rgba(255,255,255,0.18)] text-theme-primary',
  };

  return (
    <div
      className={twMerge(
        clsx(
          'rounded-3xl p-6 transition-all duration-300 ease-out',
          variants[variant],
          hoverEffect && 'hover:border-white/[0.2] hover:bg-[#1a1a22]/85 hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(0,0,0,0.6)] cursor-pointer',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
