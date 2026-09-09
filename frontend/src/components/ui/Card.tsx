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
    default: 'bg-theme-surface border border-theme-subtle text-theme-primary',
    surface: 'bg-theme-surface-raised border border-theme-subtle text-theme-primary',
    raised: 'bg-theme-surface-raised border border-theme-strong text-theme-primary',
    highlight: 'bg-theme-surface border-2 border-theme-active text-theme-primary',
  };

  return (
    <div
      className={twMerge(
        clsx(
          'rounded-2xl p-5 transition-colors duration-150',
          variants[variant],
          hoverEffect && 'hover:border-theme-strong hover:bg-theme-surface-raised cursor-pointer',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
