'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, CheckCheck, Clock, ExternalLink } from 'lucide-react';
import { useAuth } from '../../store/AuthContext';
import { notificationService } from '../../services/notificationService';
import { Notification } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

export default function NotificationsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications(50);
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      fetchNotifications();
    }
  }, [user, authLoading, router]);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkRead = async (notifId: string) => {
    try {
      await notificationService.markAsRead(notifId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400">
              <Bell className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Activity & Notifications
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Flight status tracking, expense splits, trip invites, and system updates
          </p>
        </div>

        {notifications.some((n) => !n.is_read) && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            className="gap-1.5 text-xs text-indigo-400 border-indigo-500/30 self-start sm:self-auto"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all as read
          </Button>
        )}
      </div>

      <Card className="p-0 bg-slate-900 border-slate-800 overflow-hidden shadow-2xl">
        {notifications.length === 0 ? (
          <div className="py-20 text-center text-xs text-slate-400">
            No activity notifications logged yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors hover:bg-slate-800/40 ${
                  !notif.is_read ? 'bg-indigo-950/20' : ''
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1">
                  <div className="p-2 rounded-xl bg-slate-800 border border-slate-700/60 text-indigo-400 shrink-0 mt-0.5">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4
                        className={`text-sm font-bold ${
                          !notif.is_read ? 'text-indigo-300' : 'text-white'
                        }`}
                      >
                        {notif.title}
                      </h4>
                      {!notif.is_read && (
                        <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">{notif.message}</p>
                    <div className="flex items-center gap-4 text-[11px] text-slate-500 mt-2">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(notif.created_at).toLocaleString()}
                      </span>
                      {notif.link_url && (
                        <Link
                          href={notif.link_url}
                          onClick={() => handleMarkRead(notif.id)}
                          className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
                        >
                          View Details
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {!notif.is_read && (
                  <button
                    onClick={() => handleMarkRead(notif.id)}
                    className="p-1 text-slate-500 hover:text-indigo-400 text-xs shrink-0"
                    title="Mark as read"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
