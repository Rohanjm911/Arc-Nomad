import React, { InputHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, icon, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-bold uppercase tracking-wider text-theme-muted mb-1.5">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3.5 text-theme-muted pointer-events-none flex items-center justify-center">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={twMerge(
              clsx(
                'w-full rounded-2xl bg-white/[0.05] border border-white/[0.1] px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 transition-all duration-200 focus:outline-none focus:border-white focus:ring-2 focus:ring-white/20 disabled:opacity-40 disabled:bg-white/[0.02] backdrop-blur-md',
                icon && 'pl-11',
                error && 'border-[#ff453a] focus:border-[#ff453a] focus:ring-[#ff453a]/30',
                className
              )
            )}
            {...props}
          />
        </div>
        {error && <p className="mt-1.5 text-xs text-red-400 font-medium">{error}</p>}
        {helperText && !error && <p className="mt-1 text-xs text-theme-muted">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
