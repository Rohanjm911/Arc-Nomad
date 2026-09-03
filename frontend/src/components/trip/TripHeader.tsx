'use client';

import React, { useState } from 'react';
import { Calendar, MapPin, FileDown, FileSpreadsheet, Settings, UserPlus, Sparkles, Share2 } from 'lucide-react';
import { Trip } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { exportService } from '../../services/exportService';
import { MembersModal } from '@/components/trip/MembersModal';
import { TripSettingsModal } from './TripSettingsModal';

interface TripHeaderProps {
  trip: Trip;
  onTripUpdated: (updated: Trip) => void;
  onOpenAIGenerator?: () => void;
}

export const TripHeader: React.FC<TripHeaderProps> = ({
  trip,
  onTripUpdated,
  onOpenAIGenerator,
}) => {
  const [membersModalOpen, setMembersModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const startDate = new Date(trip.start_date);
  const endDate = new Date(trip.end_date);
  const userRole = trip.user_role || 'VIEWER';
  const canEdit = userRole === 'OWNER' || userRole === 'EDITOR';

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePdfExport = () => {
    exportService.downloadPdf(trip.id, trip.title);
  };

  const handleExcelExport = () => {
    exportService.downloadExcel(trip.id, trip.title);
  };

  return (
    <>
      <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl">
        {/* Cover Image Banner */}
        <div className="relative h-56 sm:h-72 w-full overflow-hidden bg-slate-950">
          <img
            src={trip.cover_image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1600&q=80'}
            alt={trip.title}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/20" />

          {/* Top Floating Controls */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="bg-slate-900/80 backdrop-blur border-slate-700/80 text-xs gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              {copied ? 'Copied Link!' : 'Share'}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handlePdfExport}
              className="bg-slate-900/80 backdrop-blur border-slate-700/80 text-xs gap-1.5 hover:border-indigo-500/50"
            >
              <FileDown className="w-3.5 h-3.5 text-indigo-400" />
              PDF Dossier
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExcelExport}
              className="bg-slate-900/80 backdrop-blur border-slate-700/80 text-xs gap-1.5 hover:border-emerald-500/50"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              Excel Dossier
            </Button>

            {canEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSettingsModalOpen(true)}
                className="bg-slate-900/80 backdrop-blur border-slate-700/80 text-xs p-2"
                aria-label="Trip Settings"
              >
                <Settings className="w-4 h-4 text-slate-300" />
              </Button>
            )}
          </div>

          {/* Bottom Title & Details */}
          <div className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="primary" size="md">
                  {trip.status}
                </Badge>
                <Badge variant="purple" size="md">
                  Role: {userRole}
                </Badge>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-md">
                {trip.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-300 mt-2">
                <span className="flex items-center gap-1.5 text-cyan-300">
                  <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                  {trip.destination}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
                  {startDate.toLocaleDateString([], { month: 'short', day: 'numeric' })} –{' '}
                  {endDate.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <span className="text-slate-400">
                  Budget: <strong className="text-white">{trip.currency} {Number(trip.budget).toLocaleString()}</strong>
                </span>
              </div>
            </div>

            {/* Member Avatars & Invite trigger */}
            <div className="flex items-center gap-2 shrink-0">
              <div
                onClick={() => setMembersModalOpen(true)}
                className="flex items-center -space-x-2.5 cursor-pointer hover:opacity-90 transition-opacity"
              >
                {trip.members.slice(0, 4).map((member) => (
                  <Avatar
                    key={member.id}
                    src={member.user?.avatar_url}
                    name={member.user?.full_name || 'Member'}
                    size="md"
                    className="border-2 border-slate-900 shadow-md"
                  />
                ))}
                {trip.members.length > 4 && (
                  <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-xs font-bold text-slate-300">
                    +{trip.members.length - 4}
                  </div>
                )}
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setMembersModalOpen(true)}
                className="gap-1.5 text-xs bg-slate-900/90"
              >
                <UserPlus className="w-3.5 h-3.5 text-indigo-400" />
                Invite
              </Button>

              {canEdit && onOpenAIGenerator && (
                <Button
                  variant="gradient"
                  size="sm"
                  onClick={onOpenAIGenerator}
                  className="gap-1.5 text-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Architect
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <MembersModal
        isOpen={membersModalOpen}
        onClose={() => setMembersModalOpen(false)}
        trip={trip}
        onTripUpdated={onTripUpdated}
      />

      <TripSettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        trip={trip}
        onTripUpdated={onTripUpdated}
      />
    </>
  );
};
