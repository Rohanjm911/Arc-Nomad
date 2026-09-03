'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, UserPlus } from 'lucide-react';
import { useAuth } from '../../store/AuthContext';
import { friendService } from '../../services/friendService';
import { User, FriendRequest } from '../../types';
import { FriendCard } from '../../components/friends/FriendCard';
import { FriendRequestList } from '../../components/friends/FriendRequestList';
import { UserSearchModal } from '../../components/friends/UserSearchModal';
import { Button } from '../../components/ui/Button';

export default function FriendsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [friends, setFriends] = useState<User[]>([]);
  const [requests, setRequests] = useState<{ incoming: FriendRequest[]; outgoing: FriendRequest[] }>({
    incoming: [],
    outgoing: [],
  });
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchFriendsData = async () => {
    try {
      setLoading(true);
      const [friendsData, requestsData] = await Promise.all([
        friendService.getFriends(),
        friendService.getFriendRequests(),
      ]);
      setFriends(friendsData);
      setRequests(requestsData);
    } catch (err) {
      console.error('Failed to load friends:', err);
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
      fetchFriendsData();
    }
  }, [user, authLoading, router]);

  const handleRemoveFriend = async (friendId: string) => {
    if (!confirm('Are you sure you want to remove this traveler from your friends?')) return;
    try {
      await friendService.removeFriend(friendId);
      fetchFriendsData();
    } catch (err) {
      console.error(err);
    }
  };

  if (authLoading || (loading && friends.length === 0)) {
    return (
      <div className="space-y-6 animate-pulse py-8">
        <div className="h-10 w-64 bg-slate-800 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-48 bg-slate-900 rounded-2xl" />
          <div className="h-48 bg-slate-900 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Travelers & Collective Friends
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Build your private network of globetrotters to collaborate on trips and share expenses.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setSearchModalOpen(true)}
          className="gap-2 text-xs sm:text-sm shadow-indigo-600/20 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          Find New Friends
        </Button>
      </div>

      {/* Pending & Incoming Requests */}
      <FriendRequestList
        incoming={requests.incoming}
        outgoing={requests.outgoing}
        onRequestsUpdated={fetchFriendsData}
      />

      {/* Friends Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-lg font-bold text-white tracking-tight">
            Your Friends ({friends.length})
          </h2>
        </div>

        {friends.length === 0 ? (
          <div className="text-center py-20 rounded-3xl border border-dashed border-slate-800 bg-slate-950/40 p-8 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto">
              <Users className="w-8 h-8 animate-pulse" />
            </div>
            <h3 className="text-base font-bold text-slate-200">No friends added yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Search for teammates and fellow nomads to invite them to trips.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setSearchModalOpen(true)}
              className="gap-1.5 text-xs"
            >
              <UserPlus className="w-4 h-4" />
              Find Friends
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {friends.map((friend) => (
              <FriendCard
                key={friend.id}
                friend={friend}
                onRemove={handleRemoveFriend}
              />
            ))}
          </div>
        )}
      </div>

      {/* Search Modal */}
      <UserSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onFriendRequestSent={fetchFriendsData}
      />
    </div>
  );
}
