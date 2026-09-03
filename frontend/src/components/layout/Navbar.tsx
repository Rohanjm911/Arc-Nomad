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

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, demoLogin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

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
      <nav className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Brand (Solid Blue Icon, Crisp Typography, NO Gradients) */}
            <div className="flex items-center gap-8">
              <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
                <TravelLogo size="md" showText={true} />
              </Link>

              {/* Desktop Navigation Links */}
              {user && (
                <div className="hidden md:flex items-center gap-1">
                  {navLinks.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                      <Link
                        key={link.name}
                        href={link.href}
                        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          isActive
                            ? 'bg-slate-800 text-blue-400 border border-slate-700'
                            : 'text-slate-300 hover:text-white hover:bg-slate-900'
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
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <Link href="/trips/create" className="hidden sm:block">
                    <Button variant="primary" size="sm" className="gap-1.5">
                      <PlusCircle className="w-4 h-4" />
                      Plan Journey
                    </Button>
                  </Link>

                  <NotificationDropdown />

                  {/* User Profile Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2.5 p-1 rounded-full hover:bg-slate-800 transition-colors focus:outline-none"
                    >
                      <Avatar src={user.avatar_url} name={user.full_name} size="sm" />
                      <span className="text-xs font-semibold text-slate-200 hidden lg:block">
                        {user.full_name.split(' ')[0]}
                      </span>
                    </button>

                    {userMenuOpen && (
                      <div
                        className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-700 p-2 shadow-xl z-50 animate-in fade-in zoom-in-95"
                        onMouseLeave={() => setUserMenuOpen(false)}
                      >
                        <div className="px-3 py-2 border-b border-slate-800">
                          <p className="text-xs font-bold text-white">{user.full_name}</p>
                          <p className="text-[11px] text-slate-400 truncate">@{user.username}</p>
                        </div>

                        <div className="py-1">
                          <Link
                            href="/dashboard"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
                          >
                            <LayoutDashboard className="w-3.5 h-3.5 text-blue-400" />
                            Dashboard
                          </Link>
                          <Link
                            href="/profile"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
                          >
                            <User className="w-3.5 h-3.5 text-amber-400" />
                            Travel Persona & Settings
                          </Link>
                          <Link
                            href="/friends"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
                          >
                            <Users className="w-3.5 h-3.5 text-teal-400" />
                            Travel Friends
                          </Link>
                        </div>

                        <div className="pt-1 border-t border-slate-800">
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
                    onClick={() => demoLogin('alex_explorer')}
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

      {/* Mobile Bottom Navigation Bar (Solid, Travel-Ready, One-Handed Usability) */}
      {user && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950 border-t border-slate-800 px-3 py-2 flex items-center justify-around">
          <Link
            href="/dashboard"
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-bold ${
              pathname === '/dashboard' ? 'text-blue-400' : 'text-slate-400'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Trips</span>
          </Link>

          <Link
            href="/trips/create"
            className="flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-bold text-slate-300 hover:text-white"
          >
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white -mt-3 shadow-md shadow-black">
              <PlusCircle className="w-4 h-4" />
            </div>
            <span>Plan</span>
          </Link>

          <Link
            href="/friends"
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-bold ${
              pathname === '/friends' ? 'text-blue-400' : 'text-slate-400'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Friends</span>
          </Link>

          <Link
            href="/notifications"
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-bold ${
              pathname === '/notifications' ? 'text-blue-400' : 'text-slate-400'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Alerts</span>
          </Link>

          <Link
            href="/profile"
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-bold ${
              pathname === '/profile' ? 'text-blue-400' : 'text-slate-400'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile</span>
          </Link>
        </div>
      )}
    </>
  );
};
