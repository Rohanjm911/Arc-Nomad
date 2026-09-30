import React from 'react';

interface TravelLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showText?: boolean;
  subtitle?: string;
  className?: string;
  variant?: 'icon' | 'full';
}

export const TravelLogo: React.FC<TravelLogoProps> = ({
  size = 'md',
  showText = false,
  subtitle,
  className = '',
  variant = 'icon',
}) => {
  const sizeMap = {
    xs: 'w-6 h-6',
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-24 h-24',
  };

  const badgeSize = sizeMap[size] || sizeMap.md;

  if (variant === 'full') {
    return (
      <div className={`flex flex-col items-center text-center group ${className}`}>
        <img
          src="/logo-dark.png"
          alt="ARC-NOMAD"
          className="w-auto h-auto max-w-[220px] drop-shadow-xl object-contain group-hover:scale-105 transition-transform duration-300"
        />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Travel Emblem Icon */}
      <div className={`relative ${badgeSize} shrink-0 group-hover:scale-105 transition-transform duration-300 drop-shadow-md`}>
        <img
          src="/logo-icon.png"
          alt="ARC-NOMAD Logo"
          className="w-full h-full object-contain"
        />
      </div>

      {/* Brand Text */}
      {showText && (
        <div className="flex flex-col justify-center select-none min-w-0">
          <span className="font-black text-sm sm:text-[15px] tracking-wide text-white group-hover:text-zinc-200 transition-colors leading-none whitespace-nowrap">
            ARC-NOMAD
          </span>
          <span className="text-[8.5px] sm:text-[9px] text-zinc-400 group-hover:text-zinc-200 font-semibold tracking-[0.16em] uppercase whitespace-nowrap transition-colors leading-none mt-1">
            {subtitle || 'YOUR JOURNEY, PERFECTLY MAPPED'}
          </span>
        </div>
      )}
    </div>
  );
};

