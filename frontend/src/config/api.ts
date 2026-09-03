export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const getWebSocketUrl = (tripId: string, token: string): string => {
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  // Use backend host (default localhost:8000)
  const host = process.env.NEXT_PUBLIC_WS_HOST || 'localhost:8000';
  return `${wsProtocol}//${host}/api/v1/chat/${tripId}/ws?token=${encodeURIComponent(token)}`;
};
