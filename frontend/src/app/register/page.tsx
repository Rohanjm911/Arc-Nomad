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
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-xl space-y-6">
        {/* Header (Travel Logo, Crisp Title) */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <TravelLogo size="lg" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Create your Explorer Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Set up your travel preferences so ARC-NOMADE can tailor your itineraries.
          </p>
        </div>

        <Card className="p-6 bg-slate-900 border-slate-800 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-800/60 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Full Name"
                placeholder="Alex Morgan"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                icon={<User className="w-4 h-4" />}
                required
              />
              <Input
                label="Username"
                placeholder="alex_explorer"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                required
              />
            </div>

            <Input
              label="Email Address"
              type="email"
              placeholder="alex@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-4 h-4" />}
              required
            />

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 text-slate-400 pointer-events-none flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 pl-10 pr-10 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Travel Persona
                </label>
                <select
                  value={travelStyle}
                  onChange={(e) => setTravelStyle(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="Balanced Explorer">Balanced Explorer</option>
                  <option value="Luxury Traveler">Luxury & Comfort</option>
                  <option value="Adventure Seeker">Adventure & Outdoors</option>
                  <option value="Culture Enthusiast">Cultural & Historical</option>
                  <option value="Budget Backpacker">Budget Backpacker</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Budget Level
                </label>
                <select
                  value={budgetPref}
                  onChange={(e) => setBudgetPref(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="Budget">$ Budget Conscious</option>
                  <option value="Moderate">$$ Moderate & Balanced</option>
                  <option value="Luxury">$$$ Premium / High-End</option>
                </select>
              </div>
            </div>

            {/* Interests Chips */}
            <div className="pt-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Travel Interests
              </label>
              <div className="flex flex-wrap gap-1.5">
                {interestOptions.map((interest) => {
                  const isSelected = selectedInterests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white border border-blue-500'
                          : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      {interest}
                    </button>
                  );
                })}
              </div>
            </div>

            <Button type="submit" variant="primary" size="md" loading={loading} className="w-full mt-4 font-bold">
              Complete Registration
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>
        </Card>

        <p className="text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-400 hover:text-blue-300 font-bold transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
