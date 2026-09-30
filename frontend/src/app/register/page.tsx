'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../store/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { TravelLogo } from '../../components/ui/TravelLogo';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [travelStyle, setTravelStyle] = useState('Balanced Explorer');
  const [budgetPref, setBudgetPref] = useState('Moderate');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    'Culinary',
    'Sightseeing',
    'Photography',
  ]);
  const [loading, setLoading] = useState(false);
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
  ];

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !username || !email || !password) {
      setError('Please fill in all mandatory profile fields.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await register({
        full_name: fullName,
        username,
        email,
        password,
        travel_style: travelStyle,
        budget_preference: budgetPref,
        travel_interests: selectedInterests,
      });
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try a different email or username.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4 relative">
      {/* Apple Ambient Specular Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/[0.06] blur-3xl pointer-events-none -z-10" />

      <div className="w-full max-w-xl space-y-7">
        {/* Header (Travel Logo, Apple Title) */}
        <div className="text-center space-y-3.5">
          <div className="flex justify-center">
            <TravelLogo size="xl" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Create your <span className="apple-text-gradient">Explorer Profile</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 font-normal">
            Set up your travel preferences so ARC-NOMAD can tailor your itineraries.
          </p>
        </div>

        {/* Apple Glass Card */}
        <div className="apple-glass-card p-7 sm:p-9 space-y-6 rounded-[32px] shadow-2xl">
          {error && (
            <div className="p-3.5 rounded-2xl bg-[#ff453a]/15 border border-[#ff453a]/30 text-[#ff453a] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Full Name"
                placeholder="Aarav Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                icon={<User className="w-4 h-4 text-zinc-400" />}
                required
              />
              <Input
                label="Username"
                placeholder="aarav_explorer"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                icon={<User className="w-4 h-4 text-zinc-400" />}
                required
              />
            </div>

            <Input
              label="Email Address"
              type="email"
              placeholder="aarav@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-4 h-4 text-zinc-400" />}
              required
            />

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Password
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-zinc-400 pointer-events-none flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl bg-white/[0.05] border border-white/[0.1] pl-11 pr-11 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white focus:ring-2 focus:ring-white/20 backdrop-blur-md transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Travel Persona
                </label>
                <select
                  value={travelStyle}
                  onChange={(e) => setTravelStyle(e.target.value)}
                  className="w-full rounded-2xl bg-[#141419] border border-white/[0.1] px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white focus:ring-2 focus:ring-white/20 cursor-pointer transition-all"
                >
                  <option value="Balanced Explorer">Balanced Explorer</option>
                  <option value="Luxury Traveler">Luxury & Comfort</option>
                  <option value="Adventure Seeker">Adventure & Outdoors</option>
                  <option value="Culture Enthusiast">Cultural & Historical</option>
                  <option value="Budget Backpacker">Budget Backpacker</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Budget Level
                </label>
                <select
                  value={budgetPref}
                  onChange={(e) => setBudgetPref(e.target.value)}
                  className="w-full rounded-2xl bg-[#141419] border border-white/[0.1] px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white focus:ring-2 focus:ring-white/20 cursor-pointer transition-all"
                >
                  <option value="Budget">$ Budget Conscious</option>
                  <option value="Moderate">$$ Moderate & Balanced</option>
                  <option value="Luxury">$$$ Premium / High-End</option>
                </select>
              </div>
            </div>

            {/* Interests Chips (Apple Pills) */}
            <div className="pt-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                Travel Interests
              </label>
              <div className="flex flex-wrap gap-2">
                {interestOptions.map((interest) => {
                  const isSelected = selectedInterests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-white text-black font-semibold border-white shadow-md'
                          : 'bg-white/[0.04] border-white/[0.1] text-zinc-400 hover:text-white hover:border-white/[0.2]'
                      }`}
                    >
                      {interest}
                    </button>
                  );
                })}
              </div>
            </div>

            <Button type="submit" variant="primary" size="md" loading={loading} className="w-full mt-4 font-semibold rounded-full shadow-[0_2px_18px_rgba(255,255,255,0.2)]">
              Complete Registration
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-zinc-400">
          Already have an account?{' '}
          <Link href="/login" className="text-white hover:text-zinc-300 font-semibold underline underline-offset-4 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
