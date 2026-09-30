'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../store/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { TravelLogo } from '../../components/ui/TravelLogo';

export default function LoginPage() {
  const router = useRouter();
  const { login, demoLogin } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      setError('Please enter your email/username and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await login({ email_or_username: identifier, password });
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (username: string) => {
    setLoading(true);
    setError(null);
    try {
      await demoLogin(username);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[82vh] flex items-center justify-center py-10 px-4 relative">
      {/* Apple Ambient Specular Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/[0.06] blur-3xl pointer-events-none -z-10" />

      <div className="w-full max-w-md space-y-7">
        {/* Header (Travel Logo, Clean Apple Title) */}
        <div className="text-center space-y-3.5">
          <div className="flex justify-center">
            <TravelLogo size="xl" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Sign in to <span className="apple-text-gradient">ARC-NOMAD</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 font-normal">
            Access your collaborative itineraries, flights, and travel wallets.
          </p>
        </div>

        {/* Apple Glass Form Card */}
        <div className="apple-glass-card p-7 sm:p-9 space-y-6 rounded-[32px] shadow-2xl">
          {error && (
            <div className="p-3.5 rounded-2xl bg-[#ff453a]/15 border border-[#ff453a]/30 text-[#ff453a] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email or Username"
              type="text"
              placeholder="aarav@example.com or alex_nomad"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              icon={<Mail className="w-4 h-4 text-zinc-400" />}
              required
            />

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Password
                </label>
              </div>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-zinc-400 pointer-events-none flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
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

            <Button type="submit" variant="primary" size="md" loading={loading} className="w-full mt-3 font-semibold rounded-full shadow-[0_2px_16px_rgba(255,255,255,0.2)]">
              Sign In
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>

          {/* 1-Click Demo Accounts */}
          <div className="pt-4 border-t border-white/[0.08] space-y-3">
            <span className="block text-center text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">
              Quick Test Demo Accounts
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleDemo('alex_nomad')}
                disabled={loading}
                className="p-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.22] hover:bg-white/[0.08] text-left transition-all cursor-pointer flex items-center gap-3 group"
              >
                <img
                  src="/avatars/aarav.jpg"
                  alt="Aarav Sharma"
                  className="w-10 h-10 rounded-full object-cover border border-white/20 shadow-sm shrink-0 group-hover:scale-105 transition-transform"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-xs text-white truncate">Aarav (Owner)</p>
                  <p className="text-[10px] text-zinc-400 truncate">Tokyo &amp; Rome</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDemo('sarah_voyage')}
                disabled={loading}
                className="p-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.22] hover:bg-white/[0.08] text-left transition-all cursor-pointer flex items-center gap-3 group"
              >
                <img
                  src="/avatars/priya.jpg"
                  alt="Priya Patel"
                  className="w-10 h-10 rounded-full object-cover border border-white/20 shadow-sm shrink-0 group-hover:scale-105 transition-transform"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-xs text-white truncate">Priya (Editor)</p>
                  <p className="text-[10px] text-zinc-400 truncate">Adventure Traveler</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDemo('marco_explorer')}
                disabled={loading}
                className="p-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.22] hover:bg-white/[0.08] text-left transition-all cursor-pointer flex items-center gap-3 group"
              >
                <img
                  src="/avatars/kabir.jpg"
                  alt="Kabir Mehta"
                  className="w-10 h-10 rounded-full object-cover border border-white/20 shadow-sm shrink-0 group-hover:scale-105 transition-transform"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-xs text-white truncate">Kabir (Editor)</p>
                  <p className="text-[10px] text-zinc-400 truncate">Rome Renaissance</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDemo('elena_wander')}
                disabled={loading}
                className="p-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.22] hover:bg-white/[0.08] text-left transition-all cursor-pointer flex items-center gap-3 group"
              >
                <img
                  src="/avatars/ananya.jpg"
                  alt="Ananya Roy"
                  className="w-10 h-10 rounded-full object-cover border border-white/20 shadow-sm shrink-0 group-hover:scale-105 transition-transform"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-xs text-white truncate">Ananya (Lead)</p>
                  <p className="text-[10px] text-zinc-400 truncate">Expense Manager</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-zinc-400">
          New to ARC-NOMAD?{' '}
          <Link href="/register" className="text-white hover:text-zinc-300 font-semibold underline underline-offset-4 transition-colors">
            Create an explorer profile
          </Link>
        </p>
      </div>
    </div>
  );
}
