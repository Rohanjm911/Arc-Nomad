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
          const { event: eventType, data } = payload;

          if (eventType === 'new_message') {
            setMessages((prev) => {
              // Avoid duplicate messages
              if (prev.some((m) => m.id === data.id)) return prev;
              return [...prev, data];
            });
          } else if (eventType === 'reaction_updated') {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === data.message_id ? { ...msg, reactions: data.reactions } : msg
              )
            );
          } else if (eventType === 'user_typing') {
            if (data.is_typing) {
              setTypingUsers((prev) => {
                if (prev.some((u) => u.userId === data.user_id)) return prev;
                return [...prev, { userId: data.user_id, userName: data.user_name }];
              });
            } else {
              setTypingUsers((prev) => prev.filter((u) => u.userId !== data.user_id));
            }
          } else if (eventType === 'user_status') {
            if (data.online_users) {
              setOnlineUsers(data.online_users);
            }
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
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
          connect();
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
