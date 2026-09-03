'use client';

import React, { useState } from 'react';
import { Search, UserPlus, Check, AlertCircle } from 'lucide-react';
import { User } from '../../types';
import { authService } from '../../services/authService';
import { friendService } from '../../services/friendService';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';

interface UserSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFriendRequestSent: () => void;
}

export const UserSearchModal: React.FC<UserSearchModalProps> = ({
  isOpen,
  onClose,
  onFriendRequestSent,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sentMap, setSentMap] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const users = await authService.searchUsers(query.trim());
      setResults(users);
      if (users.length === 0) {
        setError('No travelers found matching your search.');
      }
    } catch (err: any) {
      setError(err.message || 'Search failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (user: User) => {
    setSendingId(user.id);
    try {
      await friendService.sendFriendRequest(user.username);
      setSentMap((prev) => ({ ...prev, [user.id]: true }));
      onFriendRequestSent();
    } catch (err: any) {
      alert(err.message || 'Failed to send friend request.');
    } finally {
      setSendingId(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Find Travelers & Friends"
      subtitle="Search for users by username, full name, or email"
      maxWidth="md"
    >
      <div className="space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            placeholder="Search username or name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
          <Button type="submit" variant="primary" size="sm" loading={loading} className="shrink-0">
            Search
          </Button>
        </form>

        {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}

        <div className="space-y-2.5 max-h-72 overflow-y-auto">
          {results.map((u) => (
            <div
              key={u.id}
              className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800"
            >
              <div className="flex items-center gap-3">
                <Avatar src={u.avatar_url} name={u.full_name} size="md" />
                <div>
                  <h4 className="text-xs font-bold text-white">{u.full_name}</h4>
                  <p className="text-[11px] text-slate-400">@{u.username}</p>
                </div>
              </div>

              {sentMap[u.id] ? (
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  Sent
                </span>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSendRequest(u)}
                  loading={sendingId === u.id}
                  className="text-xs gap-1.5 py-1 px-3"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Add Friend
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
};
