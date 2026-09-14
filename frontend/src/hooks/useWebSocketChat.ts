'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ChatMessage } from '../types';
import { getAuthToken } from '../services/api';
import { chatService } from '../services/chatService';
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
          const eventType = payload.event || payload.type;
          const data = payload.data || payload;

          if (eventType === 'new_message' || eventType === 'message' || eventType === 'chat_message') {
            const newMsg: ChatMessage = data;
            setMessages((prev) => {
              if (prev.some((m) => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
          } else if (eventType === 'user_typing' || eventType === 'typing') {
            const { user_id, user_name, is_typing } = data;
            setTypingUsers((prev) => {
              const filtered = prev.filter((u) => u.userId !== user_id);
              if (is_typing) {
                return [...filtered, { userId: user_id, userName: user_name }];
              }
              return filtered;
            });
          } else if (eventType === 'user_status' || eventType === 'presence') {
            setOnlineUsers(data?.online_users || []);
          } else if (eventType === 'reaction_updated' || eventType === 'reaction') {
            const messageId = data?.message_id;
            const updatedReactions = data?.reactions;
            if (messageId && updatedReactions !== undefined) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === messageId ? { ...m, reactions: updatedReactions } : m
                )
              );
            }
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
    // 0. Optimistic update so UI reflects immediately
    const token = getAuthToken();
    let currentUserId: string | null = null;
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        currentUserId = payload.sub || payload.user_id || payload.id;
      } catch {
        // ignore token parse error
      }
    }

    if (currentUserId) {
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id !== messageId) return m;
          const reactions = { ...(m.reactions || {}) };
          const userList = [...(reactions[emoji] || [])];
          const userIdx = userList.indexOf(currentUserId!);
          if (userIdx > -1) {
            userList.splice(userIdx, 1);
            if (userList.length === 0) {
              delete reactions[emoji];
            } else {
              reactions[emoji] = userList;
            }
          } else {
            userList.push(currentUserId!);
            reactions[emoji] = userList;
          }
          return { ...m, reactions };
        })
      );
    }

    // 1. Send via WebSocket if open
    let sentWs = false;
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      try {
        socketRef.current.send(
          JSON.stringify({
            action: 'reaction',
            message_id: messageId,
            emoji,
          })
        );
        sentWs = true;
      } catch (err) {
        console.warn('WebSocket reaction send failed, falling back to HTTP:', err);
      }
    }

    // 2. Always also call or fallback to REST API if WebSocket is not open
    if (!sentWs && tripId) {
      chatService.toggleReaction(tripId, messageId, emoji)
        .then((res) => {
          if (res?.message_id && res?.reactions !== undefined) {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === res.message_id ? { ...m, reactions: res.reactions } : m
              )
            );
          }
        })
        .catch((err) => {
          console.error('Failed to toggle reaction via HTTP fallback:', err);
        });
    }
  }, [tripId]);

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
