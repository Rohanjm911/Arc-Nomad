import React from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Users, ArrowRight, Shield } from 'lucide-react';
import { TripSummary } from '../../types';
import { Badge } from '../ui/Badge';

interface TripCardProps {
  trip: TripSummary;
}

export const TripCard: React.FC<TripCardProps> = ({ trip }) => {
  const startDate = new Date(trip.start_date);
  const endDate = new Date(trip.end_date);
  const now = new Date();
  
  const daysUntil = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const isPast = endDate < now;
  const isActive = startDate <= now && endDate >= now;

  const statusVariant = isActive ? 'success' : isPast ? 'neutral' : 'info';
  const statusLabel = isActive ? 'Active Now' : isPast ? 'Completed' : daysUntil === 0 ? 'Today' : `In ${daysUntil} days`;

  const fallbackImage = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80';

  return (
    <Link
      href={`/trips/${trip.id}`}
      className="group rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden transition-colors duration-150 hover:border-slate-600 flex flex-col justify-between"
    >
      {/* Cover Image Banner (Solid framing, NO gradients) */}
      <div className="relative h-44 w-full bg-slate-950">
        <img
          src={trip.cover_image || fallbackImage}
          alt={trip.title}
          className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
        />
        
        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <Badge variant={statusVariant} size="sm">
            {statusLabel}
          </Badge>
          <Badge variant="primary" size="sm">
            <Shield className="w-3 h-3" />
            {trip.user_role}
          </Badge>
        </div>

        {/* Destination Pin on bottom left */}
        <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-slate-950/90 border border-slate-800 flex items-center gap-1.5 text-slate-200 text-xs font-bold">
          <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
          <span>{trip.destination}</span>
        </div>
      </div>

      {/* Trip Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="font-bold text-slate-100 text-base group-hover:text-blue-400 transition-colors line-clamp-1">
            {trip.title}
          </h3>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mt-2">
            <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>
              {startDate.toLocaleDateString([], { month: 'short', day: 'numeric' })} –{' '}
              {endDate.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Bottom Strip: Budget & Crew */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
            <Users className="w-3.5 h-3.5 text-slate-500" />
            <span>{trip.member_count} {trip.member_count === 1 ? 'Traveler' : 'Travelers'}</span>
          </div>

          <div className="flex items-center gap-1.5 text-white font-bold">
            <span className="text-slate-400 font-normal">Budget:</span>
            <span>{trip.currency} {Number(trip.budget).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};
