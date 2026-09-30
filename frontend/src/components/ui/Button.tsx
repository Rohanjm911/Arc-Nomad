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
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer select-none active:scale-[0.98] tracking-tight';

    const variants: Record<string, string> = {
      primary: 'bg-white text-black hover:bg-[#e8e8ed] active:bg-[#d2d2d7] border border-white/90 shadow-[0_2px_14px_rgba(255,255,255,0.2)] font-semibold',
      secondary: 'bg-white/[0.08] hover:bg-white/[0.14] text-white border border-white/[0.12] backdrop-blur-md shadow-sm',
      accent: 'bg-[#f5f5f7] hover:bg-white text-black border border-white/80 shadow-[0_4px_16px_rgba(255,255,255,0.22)] font-semibold',
      teal: 'bg-[#e2e8f0] hover:bg-[#cbd5e1] text-zinc-900 border border-white/60 shadow-[0_4px_14px_rgba(255,255,255,0.15)] font-semibold',
      ai: 'bg-gradient-to-r from-white via-zinc-200 to-slate-300 text-black border border-white/40 shadow-[0_4px_16px_rgba(255,255,255,0.2)] font-semibold',
      gradient: 'bg-gradient-to-r from-white via-slate-200 to-zinc-300 text-black border border-white/40 shadow-[0_4px_16px_rgba(255,255,255,0.2)] font-semibold',
      outline: 'bg-transparent text-white border border-white/[0.18] hover:bg-white/[0.08] backdrop-blur-sm',
      ghost: 'text-zinc-400 hover:text-white hover:bg-white/[0.06]',
      danger: 'bg-[#ff453a]/90 text-white hover:bg-[#ff453a] border border-[#ff453a]/40 shadow-[0_4px_14px_rgba(255,69,58,0.25)]',
    };

    const sizes = {
      xs: 'px-3 py-1 text-[11px] gap-1',
      sm: 'px-4 py-1.5 text-xs gap-1.5',
      md: 'px-5 py-2 text-sm gap-2',
      lg: 'px-6 py-2.5 text-base gap-2.5',
      icon: 'p-2 w-9 h-9',
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
