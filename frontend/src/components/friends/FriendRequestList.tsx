'use client';

import React from 'react';
import { Check, X } from 'lucide-react';
import { FriendRequest } from '../../types';
import { friendService } from '../../services/friendService';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';

interface FriendRequestListProps {
  incoming: FriendRequest[];
  outgoing: FriendRequest[];
  onRequestsUpdated: () => void;
}

export const FriendRequestList: React.FC<FriendRequestListProps> = ({
  incoming,
  outgoing,
  onRequestsUpdated,
}) => {
  const handleAccept = async (reqId: string) => {
    try {
      await friendService.acceptRequest(reqId);
      onRequestsUpdated();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (reqId: string) => {
    try {
      await friendService.rejectRequest(reqId);
      onRequestsUpdated();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = async (reqId: string) => {
    try {
      await friendService.cancelRequest(reqId);
      onRequestsUpdated();
    } catch (err) {
      console.error(err);
    }
  };

  if (incoming.length === 0 && outgoing.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      {/* Incoming Requests */}
      {incoming.length > 0 && (
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Incoming Requests ({incoming.length})
          </h3>
          <div className="space-y-2.5">
            {incoming.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800"
              >
                <div className="flex items-center gap-3">
                  <Avatar src={req.sender?.avatar_url} name={req.sender?.full_name || 'User'} size="md" />
                  <div>
                    <h4 className="text-xs font-bold text-white">{req.sender?.full_name}</h4>
                    <p className="text-[11px] text-slate-400">@{req.sender?.username}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleAccept(req.id)}
                    className="p-1.5 rounded-xl bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-colors"
                    title="Accept"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleReject(req.id)}
                    className="p-1.5 rounded-xl bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white transition-colors"
                    title="Reject"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Outgoing Pending Requests */}
      {outgoing.length > 0 && (
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Pending Sent Requests ({outgoing.length})
          </h3>
          <div className="space-y-2.5">
            {outgoing.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800"
              >
                <div className="flex items-center gap-3">
                  <Avatar src={req.receiver?.avatar_url} name={req.receiver?.full_name || 'User'} size="md" />
                  <div>
                    <h4 className="text-xs font-bold text-white">{req.receiver?.full_name}</h4>
                    <p className="text-[11px] text-slate-400">@{req.receiver?.username}</p>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCancel(req.id)}
                  className="text-xs py-1 px-2.5 text-slate-400 hover:text-rose-400"
                >
                  Cancel
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
