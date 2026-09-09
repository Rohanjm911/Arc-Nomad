'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  X,
  User,
  MapPin,
  Plane,
  Calendar,
  Shield,
  Sparkles,
  Coins,
  Lock,
  Edit3,
  ExternalLink,
  Compass,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { useAuth } from '../../store/AuthContext';
import { tripService } from '../../services/tripService';
import { TripSummary } from '../../types';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface ProfileDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileDossierModal: React.FC<ProfileDossierModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const [trips, setTrips] = useState<TripSummary[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      setLoadingTrips(true);
      tripService
        .getTrips()
        .then((data) => setTrips(data))
        .catch((err) => console.warn('Failed to load trips for profile dossier:', err))
        .finally(() => setLoadingTrips(false));
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  // Strict check: Profile viewing is restricted to the logged-in user only
  if (!user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
        <div className="w-full max-w-md rounded-3xl bg-theme-surface border border-theme-subtle p-6 text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">Authentication Required</h3>
          <p className="text-xs text-slate-400">
            Explorer profiles are private and accessible to authenticated account owners only.
          </p>
          <div className="pt-2 flex justify-center gap-2">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Close
            </Button>
            <Link href="/login" onClick={onClose}>
              <Button variant="primary" size="sm">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const activeTrips = trips.filter((t) => t.status === 'ACTIVE' || t.status === 'PLANNING');
  const completedTrips = trips.filter((t) => t.status === 'COMPLETED');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-3xl bg-theme-surface border border-theme-strong overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Strip with Dual-Tone Architecture */}
        <div className="px-6 pt-6 pb-4 bg-theme-surface border-b border-theme-subtle flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-950 border border-blue-800/40 text-blue-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white tracking-tight">
                  Explorer Passport &amp; Credentials
                </h3>
                <span className="px-2 py-0.2 rounded text-[10px] font-mono font-bold bg-blue-950 text-blue-300 border border-blue-800/50">
                  VERIFIED
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Private travel identity • Visible only to your logged-in session
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-theme-surface-raised border border-theme-subtle text-slate-400 hover:text-white hover:border-theme-strong transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Passport Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto scrollbar-none">
          {/* Traveler Hero Card (Dual-Tone Matte) */}
          <div className="p-5 rounded-2xl bg-theme-surface-raised border border-theme-subtle flex items-center gap-4">
            <div className="relative shrink-0">
              <Avatar src={user.avatar_url} name={user.full_name} size="xl" />
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-theme-surface" title="Active Explorer Online" />
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-base font-extrabold text-white truncate">{user.full_name}</h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-600 text-white font-mono shrink-0">
                  @{user.username}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {user.travel_style && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 border border-blue-800/40 text-blue-300">
                    {user.travel_style}
                  </span>
                )}
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 border border-cyan-800/40 text-cyan-300 font-mono">
                  Cur: {user.preferred_currency || 'USD'}
                </span>
              </div>
            </div>
          </div>

          {/* 4-Stat Traveler Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-xl bg-theme-surface-raised border border-theme-subtle text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Journeys</span>
              <span className="text-base font-extrabold text-blue-400 font-mono">
                {loadingTrips ? '...' : trips.length}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-theme-surface-raised border border-theme-subtle text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Active</span>
              <span className="text-base font-extrabold text-cyan-300 font-mono">
                {loadingTrips ? '...' : activeTrips.length}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-theme-surface-raised border border-theme-subtle text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Completed</span>
              <span className="text-base font-extrabold text-emerald-400 font-mono">
                {loadingTrips ? '...' : completedTrips.length}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-theme-surface-raised border border-theme-subtle text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Home Base</span>
              <span className="text-base font-extrabold text-white font-mono uppercase">
                {user.home_airport || 'GLOBAL'}
              </span>
            </div>
          </div>

          {/* Traveler Bio */}
          <div className="p-4 rounded-2xl bg-theme-surface-raised border border-theme-subtle space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
              <User className="w-3 h-3 text-blue-400" />
              Traveler Bio &amp; Tagline
            </span>
            <p className="text-xs text-slate-200 leading-relaxed italic">
              {user.bio ? `"${user.bio}"` : 'No traveler bio written yet. Customize in profile settings.'}
            </p>
          </div>

          {/* Travel Interests & Styles */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Curated Travel Interests
            </span>
            {user.travel_interests && user.travel_interests.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {user.travel_interests.map((interest) => (
                  <span
                    key={interest}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-theme-surface-raised border border-theme-subtle text-slate-200"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No specific travel interests selected.</p>
            )}
          </div>

          {/* Privacy & Logged-in Protection Notice */}
          <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-800/30 flex items-center gap-2.5 text-xs text-blue-300">
            <Lock className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="text-[11px] leading-snug">
              This dossier is encrypted and restricted strictly to your authenticated session (UID: <strong className="font-mono">{user.id.slice(0, 8)}...</strong>).
            </span>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="px-6 py-4 bg-theme-surface border-t border-theme-subtle flex items-center justify-between gap-3">
          <Link href="/profile" onClick={onClose}>
            <Button variant="secondary" size="sm" className="gap-1.5 text-xs font-bold">
              <Edit3 className="w-3.5 h-3.5" />
              Edit Profile &amp; Settings
            </Button>
          </Link>

          <Link href="/friends" onClick={onClose}>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              Travel Friends
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
