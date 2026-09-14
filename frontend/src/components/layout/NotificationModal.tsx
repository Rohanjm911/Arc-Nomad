'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Bell,
  CheckCheck,
  Clock,
  ExternalLink,
  X,
  Sparkles,
  Plane,
  CreditCard,
  UserCheck,
  AlertCircle,
  Info,
  Calendar,
} from 'lucide-react';
import { Notification } from '../../types';
import { notificationService } from '../../services/notificationService';
import { Button } from '../ui/Button';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNotificationRead?: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  onNotificationRead,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const list = await notificationService.getNotifications(50);
      setNotifications(list);
    } catch (err) {
      console.warn('Failed to load notifications for modal:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      onNotificationRead?.();
    } catch (err) {
      console.error(err);
    }
  };

  const handleItemClick = async (notif: Notification) => {
    if (!notif.is_read) {
      try {
        await notificationService.markAsRead(notif.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
        );
        onNotificationRead?.();
      } catch (err) {
        console.error(err);
      }
    }
    onClose();
  };

  const getNotificationIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'flight':
        return <Plane className="w-4 h-4 text-cyan-400" />;
      case 'expense':
      case 'split':
        return <CreditCard className="w-4 h-4 text-emerald-400" />;
      case 'invite':
      case 'friend':
        return <UserCheck className="w-4 h-4 text-purple-400" />;
      case 'alert':
      case 'weather':
        return <AlertCircle className="w-4 h-4 text-amber-400" />;
      default:
        return <Bell className="w-4 h-4 text-blue-400" />;
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'UNREAD') return !n.is_read;
    return true;
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl rounded-3xl bg-theme-surface border border-theme-strong overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-theme-subtle bg-theme-surface flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-950/80 border border-blue-800/50 text-blue-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                  Activity &amp; Notifications
                </h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    {unreadCount} unread
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time alerts, itinerary updates, and expedition dispatches
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-theme-surface-raised transition-colors cursor-pointer"
            aria-label="Close notification modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter and Action Strip */}
        <div className="px-6 py-3 border-b border-theme-subtle bg-theme-surface-raised/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-theme-surface border border-theme-subtle text-xs">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                filter === 'ALL'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('UNREAD')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                filter === 'UNREAD'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-cyan-950/40"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Mark all as read</span>
            </button>
          )}
        </div>

        {/* Notification Items List */}
        <div className="flex-1 overflow-y-auto divide-y divide-theme-subtle p-2 space-y-1">
          {loading && notifications.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mx-auto" />
              <p className="text-xs text-slate-400">Loading activity notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="py-16 text-center space-y-3 px-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/50 text-slate-400 flex items-center justify-center mx-auto">
                <Bell className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-300">
                  {filter === 'UNREAD' ? 'No unread notifications' : 'No notifications yet'}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  You are all caught up with your journeys and crew activities.
                </p>
              </div>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <Link
                key={notif.id}
                href={notif.link_url || '#'}
                onClick={() => handleItemClick(notif)}
                className={`flex items-start gap-3.5 p-3.5 rounded-2xl transition-all hover:bg-theme-surface-raised cursor-pointer group ${
                  !notif.is_read
                    ? 'bg-blue-950/20 border border-blue-800/30'
                    : 'border border-transparent'
                }`}
              >
                <div className="p-2.5 rounded-xl bg-theme-surface border border-theme-subtle group-hover:scale-105 transition-transform shrink-0 mt-0.5">
                  {getNotificationIcon(notif.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4
                      className={`text-xs sm:text-sm font-bold truncate ${
                        !notif.is_read ? 'text-white' : 'text-slate-300'
                      }`}
                    >
                      {notif.title}
                    </h4>
                    {!notif.is_read && (
                      <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                    {notif.message}
                  </p>
                  <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-2 font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(notif.created_at).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                      })}{' '}
                      at{' '}
                      {new Date(notif.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {notif.type && (
                      <span className="px-1.5 py-0.2 rounded bg-theme-surface border border-theme-subtle uppercase text-[9px] font-bold text-slate-400">
                        {notif.type}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-theme-subtle bg-theme-surface flex items-center justify-between shrink-0 text-xs">
          <span className="text-[11px] text-slate-400">
            Auto-checking for flight and crew updates
          </span>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
