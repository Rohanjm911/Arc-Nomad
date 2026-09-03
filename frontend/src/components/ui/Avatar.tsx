import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name = 'User',
  size = 'md',
  className,
}) => {
  const sizes = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base font-semibold',
    xl: 'w-20 h-20 text-xl font-bold',
  };

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const fallbackBackgrounds = [
    'bg-indigo-600',
    'bg-purple-600',
    'bg-cyan-600',
    'bg-emerald-600',
    'bg-amber-600',
    'bg-rose-600',
  ];
  const charCode = name.charCodeAt(0) || 0;
  const bgClass = fallbackBackgrounds[charCode % fallbackBackgrounds.length];

  return (
    <div
      className={twMerge(
        clsx(
          'relative rounded-full flex items-center justify-center font-medium text-white overflow-hidden shrink-0 border border-slate-700/50 shadow-sm',
          sizes[size],
          !src && bgClass,
          className
        )
      )}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback on broken image link
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};
