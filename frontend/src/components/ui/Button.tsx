import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'teal' | 'ai' | 'outline' | 'ghost' | 'danger' | 'gradient';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading = false, disabled, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none';

    const variants: Record<string, string> = {
      primary: 'bg-blue-600 text-white hover:bg-blue-500 active:bg-blue-700 focus:ring-blue-500 border border-blue-500',
      secondary: 'bg-slate-800 text-slate-100 hover:bg-slate-700 active:bg-slate-800 border border-slate-700 focus:ring-slate-500',
      accent: 'bg-amber-600 text-white hover:bg-amber-500 active:bg-amber-700 focus:ring-amber-500 border border-amber-500',
      teal: 'bg-teal-600 text-white hover:bg-teal-500 active:bg-teal-700 focus:ring-teal-500 border border-teal-500',
      ai: 'bg-purple-600 text-white hover:bg-purple-500 active:bg-purple-700 focus:ring-purple-500 border border-purple-500',
      gradient: 'bg-purple-600 text-white hover:bg-purple-500 active:bg-purple-700 focus:ring-purple-500 border border-purple-500', // NO GRADIENTS: clean solid violet
      outline: 'bg-slate-900/50 text-slate-200 border border-slate-700 hover:bg-slate-800 hover:border-slate-600 hover:text-white focus:ring-blue-500',
      ghost: 'text-slate-300 hover:text-white hover:bg-slate-800/80 active:bg-slate-800 focus:ring-slate-500',
      danger: 'bg-red-600 text-white hover:bg-red-500 active:bg-red-700 focus:ring-red-500 border border-red-500',
    };

    const sizes = {
      xs: 'px-2.5 py-1 text-[11px] gap-1 rounded-lg',
      sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-lg',
      md: 'px-4 py-2 text-sm gap-2 rounded-xl',
      lg: 'px-5 py-2.5 text-base gap-2.5 rounded-xl',
      icon: 'p-2 w-9 h-9 rounded-xl',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={twMerge(clsx(baseStyles, variants[variant] || variants.primary, sizes[size], className))}
        {...props}
      >
        {loading && (
          <svg className="animate-spin -ml-0.5 mr-2 h-3.5 w-3.5 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
