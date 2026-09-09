'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

export type TimeOfDay = 'dawn' | 'day' | 'sunset' | 'night';
export type LocationTheme = 'tokyo' | 'paris' | 'new-york' | 'reykjavik' | 'rome' | 'default';

export interface LocationConfig {
  id: LocationTheme;
  name: string;
  country: string;
  emblem: string;
  timeZone: string;
  currency: string;
  vibe: string;
}

export const SUPPORTED_LOCATIONS: Record<LocationTheme, LocationConfig> = {
  tokyo: {
    id: 'tokyo',
    name: 'Tokyo',
    country: 'Japan',
    emblem: '🗼',
    timeZone: 'Asia/Tokyo',
    currency: 'JPY (¥)',
    vibe: 'Cyber Obsidian & Cherry Lacquer',
  },
  paris: {
    id: 'paris',
    name: 'Paris',
    country: 'France',
    emblem: '🥐',
    timeZone: 'Europe/Paris',
    currency: 'EUR (€)',
    vibe: 'Haussmann Slate & Champagne Gold',
  },
  'new-york': {
    id: 'new-york',
    name: 'New York',
    country: 'United States',
    emblem: '🗽',
    timeZone: 'America/New_York',
    currency: 'USD ($)',
    vibe: 'Manhattan Steel & Taxi Amber',
  },
  reykjavik: {
    id: 'reykjavik',
    name: 'Reykjavik',
    country: 'Iceland',
    emblem: '❄️',
    timeZone: 'Atlantic/Reykjavik',
    currency: 'ISK (kr)',
    vibe: 'Nordic Glacial & Polar Teal',
  },
  rome: {
    id: 'rome',
    name: 'Rome',
    country: 'Italy',
    emblem: '🏛️',
    timeZone: 'Europe/Rome',
    currency: 'EUR (€)',
    vibe: 'Travertine Stone & Terracotta',
  },
  default: {
    id: 'default',
    name: 'Global Nomad',
    country: 'Worldwide',
    emblem: '🧭',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    currency: 'USD ($)',
    vibe: 'Deep Sapphire Obsidian',
  },
};

export const TIME_OF_DAY_CONFIG: Record<TimeOfDay, { name: string; icon: string; hoursRange: string; desc: string }> = {
  dawn: { name: 'Dawn', icon: '🌅', hoursRange: '05:00 - 08:59', desc: 'Fresh morning mist & gentle sunrise' },
  day: { name: 'Day', icon: '☀️', hoursRange: '09:00 - 16:59', desc: 'High-clarity architectural daylight' },
  sunset: { name: 'Sunset', icon: '🌇', hoursRange: '17:00 - 19:59', desc: 'Warm golden hour & terracotta dusk' },
  night: { name: 'Night', icon: '🌙', hoursRange: '20:00 - 04:59', desc: 'Deep celestial midnight obsidian' },
};

interface ThemeContextType {
  timeOfDay: TimeOfDay;
  location: LocationTheme;
  isAuto: boolean;
  localTime: string;
  locationConfig: LocationConfig;
  setTimeOfDay: (time: TimeOfDay) => void;
  setLocation: (loc: LocationTheme) => void;
  setIsAuto: (auto: boolean) => void;
  cycleTimeOfDay: () => void;
  cycleLocation: () => void;
  setTripDestination: (destinationString: string | null | undefined) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getTimeOfDayFromHour(hour: number): TimeOfDay {
  if (hour >= 5 && hour < 9) return 'dawn';
  if (hour >= 9 && hour < 17) return 'day';
  if (hour >= 17 && hour < 20) return 'sunset';
  return 'night';
}

function resolveLocationFromDestination(dest: string): LocationTheme {
  const normalized = dest.toLowerCase();
  if (normalized.includes('tokyo') || normalized.includes('japan')) return 'tokyo';
  if (normalized.includes('paris') || normalized.includes('france')) return 'paris';
  if (normalized.includes('new york') || normalized.includes('nyc') || normalized.includes('manhattan')) return 'new-york';
  if (normalized.includes('reykjavik') || normalized.includes('iceland') || normalized.includes('nordic')) return 'reykjavik';
  if (normalized.includes('rome') || normalized.includes('italy') || normalized.includes('roma')) return 'rome';
  return 'default';
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [timeOfDay, setTimeOfDayState] = useState<TimeOfDay>('night');
  const [location, setLocationState] = useState<LocationTheme>('tokyo');
  const [isAuto, setIsAuto] = useState<boolean>(true);
  const [localTime, setLocalTime] = useState<string>('--:--');

  const locationConfig = useMemo(() => SUPPORTED_LOCATIONS[location] || SUPPORTED_LOCATIONS.default, [location]);

  // Compute live local time at the selected location's timezone
  const updateLocalClock = useCallback(() => {
    try {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: locationConfig.timeZone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      const timeParts = formatter.formatToParts(now);
      const hourPart = timeParts.find((p) => p.type === 'hour')?.value;
      const minPart = timeParts.find((p) => p.type === 'minute')?.value;
      const hour = parseInt(hourPart || '12', 10);
      setLocalTime(`${hourPart || '12'}:${minPart || '00'}`);

      if (isAuto) {
        const computedTime = getTimeOfDayFromHour(hour);
        setTimeOfDayState(computedTime);
      }
    } catch {
      setLocalTime('12:00');
    }
  }, [locationConfig.timeZone, isAuto]);

  // Update clock every minute
  useEffect(() => {
    updateLocalClock();
    const interval = setInterval(updateLocalClock, 30000);
    return () => clearInterval(interval);
  }, [updateLocalClock]);

  // Apply data-attributes and dark color-scheme to html root element
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
      root.setAttribute('data-time', timeOfDay);
      root.setAttribute('data-location', location);
    }
  }, [timeOfDay, location]);

  const setTimeOfDay = useCallback((time: TimeOfDay) => {
    setIsAuto(false);
    setTimeOfDayState(time);
  }, []);

  const setLocation = useCallback((loc: LocationTheme) => {
    setLocationState(loc);
  }, []);

  const cycleTimeOfDay = useCallback(() => {
    setIsAuto(false);
    const times: TimeOfDay[] = ['dawn', 'day', 'sunset', 'night'];
    const nextIndex = (times.indexOf(timeOfDay) + 1) % times.length;
    setTimeOfDayState(times[nextIndex]);
  }, [timeOfDay]);

  const cycleLocation = useCallback(() => {
    const locs: LocationTheme[] = ['tokyo', 'paris', 'new-york', 'reykjavik', 'rome', 'default'];
    const nextIndex = (locs.indexOf(location) + 1) % locs.length;
    setLocationState(locs[nextIndex]);
  }, [location]);

  const setTripDestination = useCallback((destinationString: string | null | undefined) => {
    if (!destinationString) return;
    const resolved = resolveLocationFromDestination(destinationString);
    setLocationState(resolved);
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        timeOfDay,
        location,
        isAuto,
        localTime,
        locationConfig,
        setTimeOfDay,
        setLocation,
        setIsAuto,
        cycleTimeOfDay,
        cycleLocation,
        setTripDestination,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
