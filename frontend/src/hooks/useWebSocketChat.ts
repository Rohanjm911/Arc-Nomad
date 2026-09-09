'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ChatMessage } from '../types';
import { getAuthToken } from '../services/api';
import { getWebSocketUrl } from '../config/api';

interface TypingUser {
  userId: string;
  userName: string;
}

export function useWebSocketChat(tripId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const connectRef = useRef<() => void>(() => {});

  const connect = useCallback(() => {
    const token = getAuthToken();
    if (!token || !tripId) return;

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const wsUrl = getWebSocketUrl(tripId, token);
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setIsConnected(true);
        setError(null);
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);

          if (payload.type === 'message' || payload.type === 'chat_message') {
            const newMsg: ChatMessage = payload.data || payload;
            setMessages((prev) => {
              if (prev.some((m) => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
          } else if (payload.type === 'typing') {
            const { user_id, user_name, is_typing } = payload.data;
            setTypingUsers((prev) => {
              const filtered = prev.filter((u) => u.userId !== user_id);
              if (is_typing) {
                return [...filtered, { userId: user_id, userName: user_name }];
              }
              return filtered;
            });
          } else if (payload.type === 'presence') {
            setOnlineUsers(payload.data?.online_users || []);
          }
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e);
        }
      };

      ws.onclose = (event) => {
        setIsConnected(false);
        // Do not auto-reconnect if intentionally closed or unauthorized/forbidden
        if (event.code === 1000 || event.code === 4001 || event.code === 4003 || event.code === 4004) {
          return;
        }
        // Attempt reconnect after 5 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connectRef.current();
        }, 5000);
      };

      ws.onerror = () => {
        setError('Real-time connection interrupted.');
      };

      socketRef.current = ws;
    } catch (err) {
      console.warn('WebSocket initialization note:', err);
    }
  }, [tripId]);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [connect]);

  const sendMessage = useCallback((message: string) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          action: 'send_message',
          message,
        })
      );
    }
  }, []);

  const sendTyping = useCallback((isTyping: boolean = true) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          action: 'typing',
          is_typing: isTyping,
        })
      );
    }
  }, []);

  const sendReaction = useCallback((messageId: string, emoji: string) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          action: 'reaction',
          message_id: messageId,
          emoji,
        })
      );
    }
  }, []);

  return {
    messages,
    setMessages,
    onlineUsers,
    typingUsers,
    isConnected,
    error,
    sendMessage,
    sendTyping,
    sendReaction,
  };
}
