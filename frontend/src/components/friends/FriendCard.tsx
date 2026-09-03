import React from 'react';
import { UserMinus } from 'lucide-react';
import { User } from '../../types';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';

interface FriendCardProps {
  friend: User;
  onRemove?: (friendId: string) => void;
}

export const FriendCard: React.FC<FriendCardProps> = ({ friend, onRemove }) => {
  return (
    <div className="group rounded-2xl bg-slate-900 border border-slate-800 p-5 hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-950/20 transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar src={friend.avatar_url} name={friend.full_name} size="lg" />
            <div>
              <h4 className="font-bold text-slate-100 text-sm group-hover:text-indigo-400 transition-colors">
                {friend.full_name}
              </h4>
              <p className="text-xs text-slate-400">@{friend.username}</p>
            </div>
          </div>

          {onRemove && (
            <button
              onClick={() => onRemove(friend.id)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 transition-colors"
              title="Remove Friend"
            >
              <UserMinus className="w-4 h-4" />
            </button>
          )}
        </div>

        {friend.bio && (
          <p className="text-xs text-slate-400 mt-3 line-clamp-2 leading-relaxed">
            {friend.bio}
          </p>
        )}

        {friend.travel_interests && friend.travel_interests.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {friend.travel_interests.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="neutral" size="sm">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
        <span>Style: <strong className="text-slate-200">{friend.travel_style}</strong></span>
        <span>Budget: <strong className="text-slate-200">{friend.budget_preference}</strong></span>
      </div>
    </div>
  );
};
