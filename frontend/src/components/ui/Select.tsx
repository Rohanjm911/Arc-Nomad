import React, { SelectHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, id, children, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-bold uppercase tracking-wider text-theme-muted mb-1.5">
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={twMerge(
            clsx(
              'w-full rounded-2xl bg-theme-surface-raised border border-theme-subtle px-4 py-2.5 text-sm text-theme-primary transition-colors duration-150 focus:outline-none focus:border-theme-strong focus:ring-1 focus:ring-theme-accent/50 disabled:opacity-50 disabled:bg-theme-surface cursor-pointer',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
              className
            )
          )}
          {...props}
        >
          {children}
        </select>
        {error && <p className="mt-1.5 text-xs text-red-400 font-medium">{error}</p>}
        {helperText && !error && <p className="mt-1 text-xs text-theme-muted">{helperText}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
