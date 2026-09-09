import React from 'react';

interface TravelLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  subtitle?: string;
  className?: string;
}

export const TravelLogo: React.FC<TravelLogoProps> = ({
  size = 'md',
  showText = false,
  subtitle,
  className = '',
}) => {
  const sizeMap = {
    xs: 'w-6 h-6',
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
    lg: 'w-11 h-11',
    xl: 'w-14 h-14',
  };

  const badgeSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Travel Emblem Icon */}
      <div className={`relative ${badgeSize} shrink-0 group-hover:scale-105 transition-transform duration-200`}>
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-md"
        >
          {/* Dual-Tone Squircle Badge Background (Tone 1: Solid Primary) */}
          <rect width="40" height="40" rx="11" fill="var(--accent-primary, #2563eb)" />
          <rect
            x="0.75"
            y="0.75"
            width="38.5"
            height="38.5"
            rx="10.25"
            stroke="var(--accent-secondary, #38bdf8)"
            strokeOpacity="0.4"
            strokeWidth="1.5"
          />

          {/* Dual-Tone Orbital Flight Arc (Tone 2: Secondary Accent) */}
          <path
            d="M6 27 C11 15, 22 10, 32 10"
            stroke="var(--accent-secondary, #38bdf8)"
            strokeWidth="1.8"
            strokeDasharray="2.5 2.5"
            strokeLinecap="round"
            opacity="0.9"
          />

          {/* Destination Waypoint Beacon (Pure Tone 2) */}
          <circle cx="32" cy="10" r="2.2" fill="var(--accent-secondary, #38bdf8)" />
          <circle cx="32" cy="10" r="4" stroke="#ffffff" strokeWidth="0.8" opacity="0.6" />

          {/* Modern Passenger Airplane Silhouette */}
          <g transform="translate(1.5, 0.5)">
            <path
              d="M26.2 8.8 C27.2 7.8, 28.8 8.3, 28.8 9.7 C28.8 10.5, 28.2 11.3, 27.6 11.9 L23.1 16.4 L25.6 26.5 C25.8 27.2, 25.1 27.8, 24.5 27.4 L21 23.4 L17 27.4 L17.2 30 C17.3 30.5, 16.7 30.9, 16.2 30.6 L14.2 28.6 L12.2 26.6 C11.9 26.1, 12.3 25.5, 12.8 25.6 L15.4 25.8 L19.4 21.8 L15.4 18.3 C15.0 17.7, 15.6 17.0, 16.3 17.2 L26.4 19.7 L26.2 8.8 Z"
              fill="#ffffff"
            />
          </g>
        </svg>
      </div>

      {/* Brand Text */}
      {showText && (
        <div className="flex flex-col">
          <span className="font-extrabold text-base tracking-tight text-white group-hover:text-blue-400 transition-colors">
            ARC-NOMADE
          </span>
          <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase hidden sm:block">
            {subtitle || 'Your Journey, Perfectly Mapped'}
          </span>
        </div>
      )}
    </div>
  );
};
