'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Compass,
  Users,
  User,
  PlusCircle,
  LogOut,
  Bell,
  LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '../../store/AuthContext';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { NotificationDropdown } from './NotificationDropdown';
import { TravelLogo } from '../ui/TravelLogo';
import { ThemeAtmosphereSwitcher } from './ThemeAtmosphereSwitcher';
import { ProfileDossierModal } from '../profile/ProfileDossierModal';
import { NotificationModal } from './NotificationModal';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, demoLogin } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: 'Friends', href: '/friends', icon: <Users className="w-4 h-4" /> },
    { name: 'Notifications', href: '/notifications', icon: <Bell className="w-4 h-4" /> },
    { name: 'Profile', href: '/profile', icon: <User className="w-4 h-4" /> },
  ];

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    router.push('/login');
  };

  return (
    <>
      {/* Desktop & Tablet Top Navigation Header */}
      <nav className="sticky top-0 z-40 w-full border-b border-theme-subtle bg-theme-surface/95 backdrop-blur transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Brand */}
            <div className="flex items-center gap-8">
              <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
                <TravelLogo size="md" showText={true} />
              </Link>

              {/* Desktop Navigation Links */}
              {user && (
                <div className="hidden md:flex items-center gap-1">
                  {navLinks.map((link) => {
                    const isActive = pathname === link.href;
                    if (link.name === 'Notifications') {
                      return (
                        <button
                          key={link.name}
                          type="button"
                          onClick={() => setIsNotificationModalOpen(true)}
                          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-theme-raised/60 transition-colors cursor-pointer"
                        >
                          {link.icon}
                          {link.name}
                        </button>
                      );
                    }
                    return (
                      <Link
                        key={link.name}
                        href={link.href}
                        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          isActive
                            ? 'bg-theme-raised text-theme-accent border border-theme-strong'
                            : 'text-slate-300 hover:text-white hover:bg-theme-raised/60'
                        }`}
                      >
                        {link.icon}
                        {link.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Action Controls */}
            <div className="flex items-center gap-2.5">
              {/* Dynamic Location & Time-of-Day Atmosphere Switcher */}
              <ThemeAtmosphereSwitcher />

              {user ? (
                <>
                  <Link href="/trips/create" className="hidden sm:block">
                    <Button variant="primary" size="sm" className="gap-1.5 bg-theme-accent">
                      <PlusCircle className="w-4 h-4" />
                      Plan Journey
                    </Button>
                  </Link>

                  <NotificationDropdown />

                  {/* User Profile Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2.5 p-1 rounded-full hover:bg-theme-raised transition-colors focus:outline-none"
                    >
                      <Avatar src={user.avatar_url} name={user.full_name} size="sm" />
                      <span className="text-xs font-semibold text-theme-primary hidden lg:block">
                        {user.full_name.split(' ')[0]}
                      </span>
                    </button>

                    {userMenuOpen && (
                      <div
                        className="absolute right-0 mt-2 w-64 rounded-2xl bg-theme-surface border border-theme-strong p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95"
                        onMouseLeave={() => setUserMenuOpen(false)}
                      >
                        <div className="px-3 py-2 border-b border-theme-subtle">
                          <p className="text-xs font-bold text-white">{user.full_name}</p>
                          <p className="text-[11px] text-slate-400 truncate">@{user.username}</p>
                          {user.travel_style && (
                            <span className="inline-block mt-1 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-theme-surface-raised border border-theme-subtle text-slate-300">
                              Persona: {user.travel_style}
                            </span>
                          )}
                          <button
                            onClick={() => {
                              setUserMenuOpen(false);
                              setIsProfileModalOpen(true);
                            }}
                            className="w-full mt-2 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white hover:bg-blue-500 text-xs font-bold transition-all shadow-sm cursor-pointer"
                          >
                            <User className="w-3.5 h-3.5" />
                            <span>View Explorer Profile</span>
                          </button>
                        </div>

                        <div className="py-1">
                          <Link
                            href="/dashboard"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-theme-surface-raised hover:text-white rounded-lg transition-colors"
                          >
                            <LayoutDashboard className="w-3.5 h-3.5 text-sky-400" />
                            Dashboard
                          </Link>
                          <Link
                            href="/profile"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-theme-surface-raised hover:text-white rounded-lg transition-colors"
                          >
                            <User className="w-3.5 h-3.5 text-amber-400" />
                            Travel Persona &amp; Settings
                          </Link>
                          <Link
                            href="/friends"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-theme-surface-raised hover:text-white rounded-lg transition-colors"
                          >
                            <Users className="w-3.5 h-3.5 text-teal-400" />
                            Travel Friends
                          </Link>
                        </div>

                        <div className="pt-1 border-t border-theme-subtle">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-950/40 hover:text-red-300 rounded-lg transition-colors cursor-pointer"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => demoLogin('alex_nomad')}
                    className="hidden sm:inline-flex text-xs border-theme-subtle hover:bg-theme-raised"
                  >
                    Demo Mode
                  </Button>
                  <Link href="/login">
                    <Button variant="ghost" size="sm" className="text-xs">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="primary" size="sm" className="text-xs bg-theme-accent">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation Bar */}
      {user && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-theme-surface border-t border-theme-subtle px-3 py-2 flex items-center justify-around">
          <Link
            href="/dashboard"
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-bold ${
              pathname === '/dashboard' ? 'text-theme-accent' : 'text-slate-400'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Trips</span>
          </Link>

          <Link
            href="/trips/create"
            className="flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-bold text-slate-300 hover:text-white"
          >
            <div className="w-7 h-7 rounded-lg bg-theme-accent flex items-center justify-center text-white -mt-3 shadow-md shadow-black">
              <PlusCircle className="w-4 h-4" />
            </div>
            <span>Plan</span>
          </Link>

          <Link
            href="/friends"
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-bold ${
              pathname === '/friends' ? 'text-theme-accent' : 'text-slate-400'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Friends</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsNotificationModalOpen(true)}
            className="flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-bold text-slate-400 hover:text-white cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            <span>Alerts</span>
          </button>

          <Link
            href="/profile"
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-bold ${
              pathname === '/profile' ? 'text-theme-accent' : 'text-slate-400'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile</span>
          </Link>
        </div>
      )}

      {/* Authenticated Explorer Profile Dossier Modal (Locked strictly to logged-in user) */}
      <ProfileDossierModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* Dedicated Interactive Notification Modal Popup */}
      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
      />
    </>
  );
};
