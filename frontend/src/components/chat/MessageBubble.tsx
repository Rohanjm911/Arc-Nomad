'use client';

import React from 'react';
import { ChatMessage, User } from '../../types';
import { Avatar } from '../ui/Avatar';

interface MessageBubbleProps {
  message: ChatMessage;
  currentUser: User | null;
  onReact: (messageId: string, emoji: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  currentUser,
  onReact,
}) => {
  const isMe = currentUser?.id === message.user_id;
  const timeStr = new Date(message.created_at).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const quickEmojis = ['👍', '❤️', '🔥', '🍣', '✈️', '🙌'];

  return (
    <div className={`group flex items-start gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
      <Avatar
        src={message.user?.avatar_url}
        name={message.user?.full_name || 'Traveler'}
        size="sm"
        className="mt-0.5"
      />

      <div className={`max-w-[75%] sm:max-w-md ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
        {/* Sender Name & Timestamp */}
        <div className="flex items-center gap-2 mb-1 px-1">
          <span className="text-[11px] font-bold text-slate-300">
            {isMe ? 'You' : message.user?.full_name || 'Traveler'}
          </span>
          <span className="text-[10px] text-slate-500">{timeStr}</span>
        </div>

        {/* Message Bubble Body */}
        <div
          className={`relative rounded-2xl p-3.5 text-xs leading-relaxed shadow-md ${
            isMe
              ? 'bg-indigo-600 text-white rounded-tr-none'
              : 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700/60'
          }`}
        >
          {message.message}

          {/* Quick Emoji Reaction Popup on Hover */}
          <div
            className={`absolute top-0 -translate-y-1/2 hidden group-hover:flex items-center gap-0.5 p-1 rounded-full bg-slate-900 border border-slate-700 shadow-xl z-10 ${
              isMe ? 'right-0' : 'left-0'
            }`}
          >
            {quickEmojis.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => onReact(message.id, emoji)}
                className="hover:scale-125 transition-transform px-1 text-xs cursor-pointer"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Active Reactions Pills */}
        {message.reactions && Object.keys(message.reactions).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5 px-1">
            {Object.entries(message.reactions).map(([emoji, userIds]) => {
              if (!userIds || userIds.length === 0) return null;
              const hasReacted = currentUser && userIds.includes(currentUser.id);

              return (
                <button
                  key={emoji}
                  onClick={() => onReact(message.id, emoji)}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
                    hasReacted
                      ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40'
                      : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <span>{emoji}</span>
                  <span>{userIds.length}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
