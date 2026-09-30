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
      <nav className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-black/65 backdrop-blur-2xl transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Brand */}
            <div className="flex items-center gap-8">
              <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
                <TravelLogo size="md" showText={true} />
              </Link>

              {/* Desktop Navigation Links */}
              {user && (
                <div className="hidden md:flex items-center gap-1.5 p-1 rounded-full bg-white/[0.04] border border-white/[0.06] backdrop-blur-md">
                  {navLinks.map((link) => {
                    const isActive = pathname === link.href;
                    if (link.name === 'Notifications') {
                      return (
                        <button
                          key={link.name}
                          type="button"
                          onClick={() => setIsNotificationModalOpen(true)}
                          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer"
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
                        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                          isActive
                            ? 'bg-white/[0.12] text-white border border-white/[0.15] shadow-sm'
                            : 'text-zinc-400 hover:text-white hover:bg-white/[0.06]'
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
                    <Button variant="accent" size="sm" className="gap-1.5 shadow-[0_4px_14px_0_rgba(0,113,227,0.35)]">
                      <PlusCircle className="w-4 h-4" />
                      Plan Journey
                    </Button>
                  </Link>

                  <NotificationDropdown />

                  {/* User Profile Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] transition-all focus:outline-none cursor-pointer"
                    >
                      <Avatar src={user.avatar_url} name={user.full_name} size="sm" />
                      <span className="text-xs font-medium text-zinc-200 hidden lg:block tracking-tight">
                        {user.full_name.split(' ')[0]}
                      </span>
                    </button>

                    {userMenuOpen && (
                      <div
                        className="absolute right-0 mt-2 w-64 rounded-3xl bg-[#141419]/95 backdrop-blur-2xl border border-white/[0.12] p-3 shadow-2xl z-50 animate-in fade-in zoom-in-95"
                        onMouseLeave={() => setUserMenuOpen(false)}
                      >
                        <div className="px-3 py-2 border-b border-white/[0.08]">
                          <p className="text-xs font-bold text-white tracking-tight">{user.full_name}</p>
                          <p className="text-[11px] text-zinc-400 truncate">@{user.username}</p>
                          {user.travel_style && (
                            <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/[0.06] border border-white/[0.1] text-zinc-300">
                              Persona: {user.travel_style}
                            </span>
                          )}
                          <button
                            onClick={() => {
                              setUserMenuOpen(false);
                              setIsProfileModalOpen(true);
                            }}
                            className="w-full mt-2 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-black hover:bg-zinc-200 text-xs font-semibold transition-all shadow-sm cursor-pointer"
                          >
                            <User className="w-3.5 h-3.5" />
                            <span>View Explorer Profile</span>
                          </button>
                        </div>

                        <div className="py-1">
                          <Link
                            href="/dashboard"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-xs text-zinc-300 hover:bg-white/[0.06] hover:text-white rounded-2xl transition-colors"
                          >
                            <LayoutDashboard className="w-3.5 h-3.5 text-[#2997ff]" />
                            Dashboard
                          </Link>
                          <Link
                            href="/profile"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-xs text-zinc-300 hover:bg-white/[0.06] hover:text-white rounded-2xl transition-colors"
                          >
                            <User className="w-3.5 h-3.5 text-[#ff9f0a]" />
                            Travel Persona &amp; Settings
                          </Link>
                          <Link
                            href="/friends"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-xs text-zinc-300 hover:bg-white/[0.06] hover:text-white rounded-2xl transition-colors"
                          >
                            <Users className="w-3.5 h-3.5 text-[#30d158]" />
                            Travel Friends
                          </Link>
                        </div>

                        <div className="pt-1 border-t border-white/[0.08]">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#ff453a] hover:bg-[#ff453a]/10 hover:text-red-300 rounded-2xl transition-colors cursor-pointer"
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
                    variant="secondary"
                    size="sm"
                    onClick={() => demoLogin('alex_nomad')}
                    className="hidden sm:inline-flex text-xs"
                  >
                    Demo Mode
                  </Button>
                  <Link href="/login">
                    <Button variant="ghost" size="sm" className="text-xs">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="primary" size="sm" className="text-xs">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation Bar (Apple Floating Capsule) */}
      {user && (
        <div className="md:hidden fixed bottom-4 left-4 right-4 z-40 rounded-full bg-[#121217]/90 backdrop-blur-2xl border border-white/[0.12] px-3 py-2 flex items-center justify-around shadow-[0_12px_36px_rgba(0,0,0,0.7)]">
          <Link
            href="/dashboard"
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-full text-[10px] font-medium transition-all ${
              pathname === '/dashboard' ? 'text-white font-semibold' : 'text-zinc-400'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Trips</span>
          </Link>

          <Link
            href="/trips/create"
            className="flex flex-col items-center gap-1 py-1 px-3 rounded-full text-[10px] font-semibold text-black bg-white shadow-[0_2px_12px_rgba(255,255,255,0.25)] -my-1"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Plan</span>
          </Link>

          <Link
            href="/friends"
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-full text-[10px] font-medium transition-all ${
              pathname === '/friends' ? 'text-white font-semibold' : 'text-zinc-400'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Friends</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsNotificationModalOpen(true)}
            className="flex flex-col items-center gap-1 py-1 px-3 rounded-full text-[10px] font-medium text-zinc-400 hover:text-white cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            <span>Alerts</span>
          </button>

          <Link
            href="/profile"
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-full text-[10px] font-medium transition-all ${
              pathname === '/profile' ? 'text-[#2997ff]' : 'text-zinc-400'
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
