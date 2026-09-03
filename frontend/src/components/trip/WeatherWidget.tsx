'use client';

import React, { useState, useEffect } from 'react';
import { Sun, Cloud, CloudSun, CloudRain, CloudLightning, Snowflake, Wind, Droplets, Thermometer, RefreshCw } from 'lucide-react';
import { WeatherData } from '../../types';
import { tripService } from '../../services/tripService';
import { Card } from '../ui/Card';

interface WeatherWidgetProps {
  tripId: string;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ tripId }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchWeather = async () => {
    try {
      setLoading(true);
      const data = await tripService.getTripWeather(tripId);
      setWeather(data);
    } catch (err) {
      console.warn('Weather fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, [tripId]);

  if (loading && !weather) {
    return (
      <Card className="p-4 border-slate-800 animate-pulse flex items-center justify-between">
        <div className="h-4 w-32 bg-slate-800 rounded" />
        <div className="h-8 w-16 bg-slate-800 rounded" />
      </Card>
    );
  }

  if (!weather) return null;

  const renderIcon = (iconName: string, className: string = 'w-6 h-6') => {
    switch (iconName) {
      case 'sun':
        return <Sun className={`${className} text-amber-400`} />;
      case 'cloud-sun':
        return <CloudSun className={`${className} text-amber-300`} />;
      case 'cloud':
      case 'cloud-fog':
        return <Cloud className={`${className} text-slate-300`} />;
      case 'cloud-rain':
        return <CloudRain className={`${className} text-cyan-400`} />;
      case 'cloud-lightning':
        return <CloudLightning className={`${className} text-yellow-400`} />;
      case 'snowflake':
        return <Snowflake className={`${className} text-sky-300`} />;
      default:
        return <Sun className={`${className} text-amber-400`} />;
    }
  };

  return (
    <Card className="p-4 border-slate-800 bg-slate-900/90">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        {/* Current Weather summary */}
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
            {renderIcon(weather.icon, 'w-8 h-8')}
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-white">{weather.temperature}°C</span>
              <span className="text-xs font-semibold text-slate-400">{weather.condition}</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
              <span className="flex items-center gap-1">
                <Thermometer className="w-3 h-3 text-rose-400" />
                Feels like {weather.feels_like}°C
              </span>
              <span className="flex items-center gap-1">
                <Droplets className="w-3 h-3 text-cyan-400" />
                {weather.humidity}% humidity
              </span>
              <span className="flex items-center gap-1">
                <Wind className="w-3 h-3 text-slate-400" />
                {weather.wind_speed} km/h
              </span>
            </div>
          </div>
        </div>

        {/* Refresh button */}
        <button
          onClick={fetchWeather}
          className="self-end sm:self-center p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Refresh Live Weather"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* 5-Day Forecast mini cards */}
      {weather.forecast && weather.forecast.length > 0 && (
        <div className="grid grid-cols-5 gap-2 mt-3 pt-1">
          {weather.forecast.map((day, idx) => (
            <div
              key={idx}
              className="p-2 rounded-xl bg-slate-950/40 border border-slate-800/80 flex flex-col items-center text-center"
            >
              <span className="text-[10px] font-semibold text-slate-400">
                {day.date ? new Date(day.date).toLocaleDateString([], { weekday: 'short' }) : `Day ${idx + 1}`}
              </span>
              <div className="my-1.5">{renderIcon(day.icon, 'w-5 h-5')}</div>
              <div className="text-xs font-bold text-slate-200">
                {Math.round(day.max_temp)}°
              </div>
              <div className="text-[10px] text-slate-500">
                {Math.round(day.min_temp)}°
              </div>
              {day.rain_probability > 0 && (
                <span className="text-[9px] text-cyan-400 font-medium mt-1">
                  {day.rain_probability}% 💧
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
