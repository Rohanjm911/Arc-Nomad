'use client';

import React, { useState } from 'react';
import { UserPlus, Trash2, Check, AlertCircle } from 'lucide-react';
import { Trip, TripRole } from '../../types';
import { tripService } from '../../services/tripService';
import { Modal } from '../ui/Modal';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';

interface MembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
  onTripUpdated: (updated: Trip) => void;
}

export const MembersModal: React.FC<MembersModalProps> = ({
  isOpen,
  onClose,
  trip,
  onTripUpdated,
}) => {
  const [inviteIdentifier, setInviteIdentifier] = useState('');
  const [selectedRole, setSelectedRole] = useState<TripRole>('EDITOR');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isOwner = trip.user_role === 'OWNER';

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteIdentifier.trim()) return;

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      await tripService.inviteMember(trip.id, {
        user_id_or_email: inviteIdentifier.trim(),
        role: selectedRole,
      });
      const updated = await tripService.getTrip(trip.id);
      onTripUpdated(updated);
      setSuccess(`Successfully added ${inviteIdentifier} to trip!`);
      setInviteIdentifier('');
    } catch (err: any) {
      setError(err.message || 'Failed to invite member. Verify email or username.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: TripRole) => {
    try {
      await tripService.updateMemberRole(trip.id, userId, newRole);
      const updated = await tripService.getTrip(trip.id);
      onTripUpdated(updated);
    } catch (err: any) {
      setError(err.message || 'Failed to update member role.');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this member from the trip?')) return;
    try {
      await tripService.removeMember(trip.id, userId);
      const updated = await tripService.getTrip(trip.id);
      onTripUpdated(updated);
    } catch (err: any) {
      setError(err.message || 'Failed to remove member.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Trip Members & Permissions"
      subtitle={`Collaborators on ${trip.title}`}
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Invite Form */}
        <form onSubmit={handleInvite} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <UserPlus className="w-4 h-4 text-indigo-400" />
            Invite Friends & Collaborators
          </h3>
          
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="flex-1">
              <Input
                placeholder="Username or email (e.g. sarah_voyage)"
                value={inviteIdentifier}
                onChange={(e) => setInviteIdentifier(e.target.value)}
                disabled={loading}
              />
            </div>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as TripRole)}
              className="rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="EDITOR">Editor (Plan & Edit)</option>
              <option value="VIEWER">Viewer (Read Only)</option>
              <option value="EXPENSE_MANAGER">Expense Manager</option>
            </select>
            <Button type="submit" variant="primary" size="sm" loading={loading} className="shrink-0">
              Invite
            </Button>
          </div>

          {error && (
            <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 shrink-0" />
              {success}
            </div>
          )}
        </form>

        {/* Current Members List */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Active Members ({trip.members.length})
          </h3>
          <div className="space-y-2.5">
            {trip.members.map((member) => {
              const u = member.user;
              const isTripOwner = member.role === 'OWNER';

              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700/60 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar src={u?.avatar_url} name={u?.full_name || 'User'} size="md" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                        {u?.full_name}
                        {isTripOwner && (
                          <Badge variant="primary" size="sm">
                            Owner
                          </Badge>
                        )}
                      </h4>
                      <p className="text-[11px] text-slate-400">@{u?.username}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isOwner && !isTripOwner ? (
                      <select
                        value={member.role}
                        onChange={(e) => handleRoleChange(member.user_id, e.target.value as TripRole)}
                        className="rounded-lg bg-slate-800 border border-slate-700 px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="EDITOR">Editor</option>
                        <option value="VIEWER">Viewer</option>
                        <option value="EXPENSE_MANAGER">Expense Manager</option>
                      </select>
                    ) : (
                      <Badge variant="neutral" size="sm">
                        {member.role}
                      </Badge>
                    )}

                    {isOwner && !isTripOwner && (
                      <button
                        onClick={() => handleRemoveMember(member.user_id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 transition-colors"
                        title="Remove member"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
};
