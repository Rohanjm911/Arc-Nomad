'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../../store/AuthContext';
import { authService } from '../../services/authService';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { CurrencySelect } from '../../components/ui/CurrencySelect';

export default function ProfilePage() {
  const router = useRouter();
  const { user, refreshUser, loading: authLoading } = useAuth();

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
        <div className="h-20 bg-slate-900 rounded-3xl" />
        <div className="h-64 bg-slate-900 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-6">
      {/* Profile Header */}
      <div className="flex items-center gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <Avatar src={avatarUrl || user.avatar_url} name={user.full_name} size="xl" />
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            {user.full_name}
          </h1>
          <p className="text-xs text-slate-400 font-medium">@{user.username} • {user.email}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold border border-indigo-500/20">
              {user.travel_style}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
              Currency: {user.preferred_currency}
            </span>
          </div>
        </div>
      </div>

      <Card className="p-6 sm:p-8 bg-slate-900 border-slate-800 shadow-2xl">
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
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
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
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-xs font-semibold text-slate-100 focus:outline-none focus:border-indigo-500"
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
              Travel Interests & Hobbies
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
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400'
                        : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
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

          <div className="flex justify-end pt-4 border-t border-slate-800">
            <Button type="submit" variant="primary" size="md" loading={loading} className="gap-2 shadow-indigo-600/30">
              <Check className="w-4 h-4" />
              Save Preferences
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
