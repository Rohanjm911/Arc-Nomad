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
    <div className="min-h-[80vh] flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header (Travel Logo, Clean Title) */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <TravelLogo size="lg" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Sign in to ARC-NOMADE
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Access your collaborative itineraries, flights, and travel wallets.
          </p>
        </div>

        {/* Form Card */}
        <Card className="p-6 bg-slate-900 border-slate-800 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-800/60 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email or Username"
              type="text"
              placeholder="alex@example.com or alex_explorer"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              icon={<Mail className="w-4 h-4" />}
              required
            />

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Password
                </label>
              </div>
              <div className="relative flex items-center">
                <div className="absolute left-3 text-slate-400 pointer-events-none flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
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

            <Button type="submit" variant="primary" size="md" loading={loading} className="w-full mt-2 font-bold">
              Sign In
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>

          {/* 1-Click Demo Accounts */}
          <div className="pt-4 border-t border-slate-800 space-y-2.5">
            <span className="block text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Quick Test Demo Accounts
            </span>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => handleDemo('alex_explorer')}
                disabled={loading}
                className="text-xs"
              >
                Alex (Trip Owner)
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => handleDemo('chloe_travels')}
                disabled={loading}
                className="text-xs"
              >
                Chloe (Editor)
              </Button>
            </div>
          </div>
        </Card>

        {/* Footer Link */}
        <p className="text-center text-xs text-slate-400">
          New to ARC-NOMADE?{' '}
          <Link href="/register" className="text-blue-400 hover:text-blue-300 font-bold transition-colors">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
