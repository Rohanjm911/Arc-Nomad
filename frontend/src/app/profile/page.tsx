'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Check,
  AlertCircle,
  User,
  Shield,
  MapPin,
  Lock,
  Edit3,
  Compass,
  Calendar,
  Coins,
  Plane,
  Eye,
  Settings,
  Users,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../store/AuthContext';
import { authService } from '../../services/authService';
import { tripService } from '../../services/tripService';
import { TripSummary } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { CurrencySelect } from '../../components/ui/CurrencySelect';

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get('mode') === 'edit' ? 'edit' : 'passport';

  const { user, refreshUser, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'passport' | 'edit'>(initialMode);
  const [trips, setTrips] = useState<TripSummary[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [homeAirport, setHomeAirport] = useState('');
  const [preferredCurrency, setPreferredCurrency] = useState('USD');
  const [travelStyle, setTravelStyle] = useState('Balanced Explorer');
  const [budgetPreference, setBudgetPreference] = useState('Moderate');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const interestOptions = [
    'Culinary',
    'Sightseeing',
    'Photography',
    'Architecture',
    'Nightlife',
    'Nature & Outdoors',
    'Museums & Art',
    'Shopping',
    'Adventure & Sports',
    'Solo Travel',
  ];

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      setFullName(user.full_name || '');
      setBio(user.bio || '');
      setHomeAirport(user.home_airport || '');
      setPreferredCurrency(user.preferred_currency || 'USD');
      setTravelStyle(user.travel_style || 'Balanced Explorer');
      setBudgetPreference(user.budget_preference || 'Moderate');
      setSelectedInterests(user.travel_interests || []);
      setAvatarUrl(user.avatar_url || '');

      // Load user trips for passport stats
      setLoadingTrips(true);
      tripService
        .getTrips()
        .then((data) => setTrips(data))
        .catch((err) => console.warn('Failed to load trips for profile:', err))
        .finally(() => setLoadingTrips(false));
    }
  }, [user, authLoading, router]);

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await authService.updateProfile({
        full_name: fullName,
        bio,
        home_airport: homeAirport,
        preferred_currency: preferredCurrency,
        travel_style: travelStyle,
        budget_preference: budgetPreference,
        travel_interests: selectedInterests,
        avatar_url: avatarUrl || undefined,
        password: password ? password : undefined,
      });

      await refreshUser();
      setSuccess('Profile details updated successfully!');
      setPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-pulse py-8">
        <div className="h-20 bg-theme-surface rounded-3xl" />
        <div className="h-64 bg-theme-surface rounded-3xl" />
      </div>
    );
  }

  const activeTrips = trips.filter((t) => t.status === 'ACTIVE' || t.status === 'PLANNING');
  const completedTrips = trips.filter((t) => t.status === 'COMPLETED');

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-6">
      {/* 1. Mode Switcher (View Passport vs. Edit Profile) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-theme-subtle">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Explorer Profile</span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/40">
              PRIVATE TO YOU
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Logged in as <strong className="text-white">@{user.username}</strong> ({user.email})
          </p>
        </div>

        {/* Dual-Tone Tab Control */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-theme-surface border border-theme-subtle self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('passport')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'passport'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Passport</span>
          </button>

          <button
            onClick={() => setActiveTab('edit')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'edit'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Edit Settings</span>
          </button>
        </div>
      </div>

      {/* VIEW MODE: Explorer Passport Dossier */}
      {activeTab === 'passport' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Hero Passport Card */}
          <div className="p-6 sm:p-7 rounded-3xl bg-theme-surface border border-theme-subtle shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <Avatar src={avatarUrl || user.avatar_url} name={user.full_name} size="xl" />
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-theme-surface" title="Logged in session active" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                    {user.full_name}
                  </h2>
                </div>
                <p className="text-xs text-slate-400 font-mono">@{user.username} • {user.email}</p>
                <div className="flex flex-wrap items-center gap-2 pt-1.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-400 text-xs font-semibold border border-blue-500/30">
                    {user.travel_style || 'Balanced Explorer'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 text-xs font-semibold border border-cyan-500/30 font-mono">
                    Currency: {user.preferred_currency || 'USD'}
                  </span>
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setActiveTab('edit')}
              className="gap-2 self-start sm:self-auto font-bold bg-blue-600 hover:bg-blue-500"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit Profile
            </Button>
          </div>

          {/* 4-Stat Traveler Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-theme-surface border border-theme-subtle text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Total Journeys</span>
              <span className="text-xl font-extrabold text-blue-400 font-mono">
                {loadingTrips ? '...' : trips.length}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-theme-surface border border-theme-subtle text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Active &amp; Planning</span>
              <span className="text-xl font-extrabold text-cyan-300 font-mono">
                {loadingTrips ? '...' : activeTrips.length}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-theme-surface border border-theme-subtle text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Completed</span>
              <span className="text-xl font-extrabold text-emerald-400 font-mono">
                {loadingTrips ? '...' : completedTrips.length}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-theme-surface border border-theme-subtle text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Home Base Airport</span>
              <span className="text-xl font-extrabold text-white font-mono uppercase">
                {user.home_airport || 'GLOBAL'}
              </span>
            </div>
          </div>

          {/* Traveler Bio Block */}
          <div className="p-5 rounded-2xl bg-theme-surface border border-theme-subtle space-y-2">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-400" />
              Traveler Bio &amp; Tagline
            </span>
            <p className="text-sm text-slate-200 leading-relaxed italic">
              {user.bio ? `"${user.bio}"` : 'No traveler bio added yet. Click "Edit Profile" to share your travel background.'}
            </p>
          </div>

          {/* Travel Interests Tags */}
          <div className="p-5 rounded-2xl bg-theme-surface border border-theme-subtle space-y-3">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              Curated Travel Interests &amp; Passions
            </span>
            {user.travel_interests && user.travel_interests.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {user.travel_interests.map((interest) => (
                  <span
                    key={interest}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-theme-surface-raised border border-theme-subtle text-slate-200"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No travel interests selected yet.</p>
            )}
          </div>

          {/* Privacy & Account Notice */}
          <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-800/30 flex items-center justify-between gap-3 text-xs text-blue-300">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-400 shrink-0" />
              <span>
                Protected travel dossier. Visible only to your logged-in profile (UID: <strong className="font-mono">{user.id.slice(0, 8)}...</strong>).
              </span>
            </div>
            <Link href="/friends" className="text-blue-400 hover:text-blue-300 font-semibold shrink-0">
              View Friends &rarr;
            </Link>
          </div>
        </div>
      )}

      {/* EDIT MODE: Profile & Settings Form */}
      {activeTab === 'edit' && (
        <Card className="p-6 sm:p-8 bg-theme-surface border-theme-subtle shadow-xl animate-in fade-in duration-200">
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
              <Input
                label="Home Airport (IATA Code)"
                placeholder="e.g. SFO / ORD / HND"
                maxLength={4}
                value={homeAirport}
                onChange={(e) => setHomeAirport(e.target.value.toUpperCase())}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Bio / Traveler Tagline
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={2}
                placeholder="Brief summary about your travel style and favorite regions..."
                className="w-full rounded-xl bg-theme-surface-raised border border-theme-subtle px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
              <CurrencySelect
                label="Preferred Currency"
                value={preferredCurrency}
                onChange={(val) => setPreferredCurrency(val)}
              />

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Budget Tier
                </label>
                <select
                  value={budgetPreference}
                  onChange={(e) => setBudgetPreference(e.target.value)}
                  className="w-full rounded-xl bg-theme-surface-raised border border-theme-subtle px-3.5 py-2.5 text-xs font-semibold text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="Budget">$ Budget Conscious</option>
                  <option value="Moderate">$$ Moderate Comfort</option>
                  <option value="Luxury">$$$ High-End Luxury</option>
                </select>
              </div>
            </div>

            <Input
              label="Avatar Image URL (Optional)"
              placeholder="https://images.unsplash.com/..."
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
            />

            {/* Interests Tags */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Travel Interests &amp; Hobbies
              </label>
              <div className="flex flex-wrap gap-1.5">
                {interestOptions.map((interest) => {
                  const isSelected = selectedInterests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400'
                          : 'bg-theme-surface-raised text-slate-400 hover:text-white border border-theme-subtle'
                      }`}
                    >
                      {interest}
                    </button>
                  );
                })}
              </div>
            </div>

            <Input
              label="Change Password (Optional)"
              type="password"
              placeholder="Leave blank to keep current password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-theme-subtle">
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => setActiveTab('passport')}
              >
                Back to Passport
              </Button>

              <Button type="submit" variant="primary" size="md" loading={loading} className="gap-2 shadow-sm bg-blue-600 hover:bg-blue-500">
                <Check className="w-4 h-4" />
                Save Preferences
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs text-slate-500">Loading Profile...</div>}>
      <ProfileContent />
    </Suspense>
  );
}
