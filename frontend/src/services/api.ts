import { API_BASE_URL } from '../config/api';

class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('arc_nomade_token');
  }
  return null;
};

export const setAuthToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('arc_nomade_token', token);
  }
};

export const removeAuthToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('arc_nomade_token');
  }
};

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return {} as T;
  }

  if (!response.ok) {
    let errorDetail = 'An unexpected error occurred';
    let errorData = null;
    try {
      errorData = await response.json();
      if (typeof errorData.detail === 'string') {
        errorDetail = errorData.detail;
      } else if (Array.isArray(errorData.detail)) {
        errorDetail = errorData.detail
          .map((e: any) => `${e.loc ? e.loc.slice(-1)[0] : 'field'}: ${e.msg}`)
          .join(', ');
      } else if (errorData.detail && typeof errorData.detail === 'object') {
        errorDetail = JSON.stringify(errorData.detail);
      } else if (errorData.message) {
        errorDetail = errorData.message;
      }
    } catch {
      // response is not JSON
    }

    if (response.status === 401 && typeof window !== 'undefined') {
      // Don't auto-redirect if checking auth or on login page
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        removeAuthToken();
      }
    }

    throw new ApiError(errorDetail, response.status, errorData);
  }

  return response.json();
}
