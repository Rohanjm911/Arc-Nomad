'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Users } from 'lucide-react';
import { Trip, ChatMessage } from '../../types';
import { useAuth } from '../../store/AuthContext';
import { useWebSocketChat } from '../../hooks/useWebSocketChat';
import { chatService } from '../../services/chatService';
import { MessageBubble } from './MessageBubble';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';

interface GroupChatRoomProps {
  trip: Trip;
}

export const GroupChatRoom: React.FC<GroupChatRoomProps> = ({ trip }) => {
  const { user } = useAuth();
  const [inputText, setInputText] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    setMessages,
    onlineUsers,
    typingUsers,
    isConnected,
    sendMessage,
    sendTyping,
    sendReaction,
  } = useWebSocketChat(trip.id);

  // Load message history initially
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await chatService.getMessages(trip.id, 60);
        setMessages(history);
      } catch (err) {
        console.error('Failed to load chat history:', err);
      } finally {
        setInitialLoading(false);
      }
    };
    loadHistory();
  }, [trip.id, setMessages]);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    sendMessage(inputText.trim());
    setInputText('');
    sendTyping(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    sendTyping(e.target.value.length > 0);
  };

  const handleReact = (messageId: string, emoji: string) => {
    sendReaction(messageId, emoji);
  };

  return (
    <div className="rounded-3xl bg-theme-surface border border-theme-subtle shadow-2xl flex flex-col h-[650px] overflow-hidden">
      {/* Chat Top Header */}
      <div className="p-4 bg-theme-surface-raised border-b border-theme-subtle flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center -space-x-2">
            {trip.members.slice(0, 3).map((m) => (
              <Avatar
                key={m.id}
                src={m.user?.avatar_url}
                name={m.user?.full_name || 'Member'}
                size="sm"
                className="border-2 border-theme-surface"
              />
            ))}
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              {trip.title} Collective Chat
            </h3>
            <p className="text-[11px] text-slate-400">
              {trip.members.length} collaborators • Real-time encrypted
            </p>
          </div>
        </div>

        {/* Connection status indicator */}
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
            }`}
          />
          <span className="text-[11px] font-semibold text-slate-400">
            {isConnected ? 'Online' : 'Connecting...'}
          </span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {initialLoading ? (
          <div className="flex items-center justify-center h-full text-xs text-slate-400 animate-pulse">
            Loading message thread...
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-theme-surface-raised border border-theme-subtle flex items-center justify-center mx-auto text-theme-accent">
              <Users className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-white">No messages yet</h4>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Coordinate flights, vote on activities, and discuss itinerary plans in real-time.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              currentUser={user}
              onReact={handleReact}
            />
          ))
        )}

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2 text-[11px] text-slate-400 italic">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-theme-accent animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-theme-accent animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-theme-accent animate-bounce [animation-delay:0.4s]" />
            </div>
            <span>
              {typingUsers.map((u) => u.userName.split(' ')[0]).join(', ')} is typing...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Bar */}
      <form onSubmit={handleSend} className="p-3 bg-theme-surface-raised border-t border-theme-subtle flex items-center gap-2">
        <input
          type="text"
          placeholder="Message trip members in real time..."
          value={inputText}
          onChange={handleInputChange}
          className="flex-1 rounded-2xl bg-theme-surface border border-theme-subtle px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-theme-accent shadow-inner"
        />

        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={!inputText.trim()}
          className="rounded-2xl px-4 py-3 shrink-0 gap-1.5 bg-theme-accent text-white font-bold"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Send</span>
        </Button>
      </form>
    </div>
  );
};
