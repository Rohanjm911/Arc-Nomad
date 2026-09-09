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
                'w-full rounded-2xl bg-theme-surface-raised border border-theme-subtle px-4 py-2.5 text-sm text-theme-primary placeholder:text-theme-muted transition-colors duration-150 focus:outline-none focus:border-theme-strong focus:ring-1 focus:ring-theme-accent/50 disabled:opacity-50 disabled:bg-theme-surface',
                icon && 'pl-11',
                error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
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
