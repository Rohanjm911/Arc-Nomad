'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';
import { getAuthToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: { email_or_username: string; password: string }) => Promise<void>;
  register: (data: {
    email: string;
    username: string;
    password: string;
    full_name: string;
    travel_interests?: string[];
    travel_style?: string;
    budget_preference?: string;
  }) => Promise<void>;
  demoLogin: (username?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const currentUser = await authService.getMe();
      setUser(currentUser);
    } catch (err: any) {
      // Stale or expired token in storage - silently clear and set unauthenticated
      authService.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (data: { email_or_username: string; password: string }) => {
    setLoading(true);
    try {
      const res = await authService.login(data);
      setUser(res.user);
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: {
    email: string;
    username: string;
    password: string;
    full_name: string;
    travel_interests?: string[];
    travel_style?: string;
    budget_preference?: string;
  }) => {
    setLoading(true);
    try {
      const res = await authService.register(data);
      setUser(res.user);
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async (username: string = 'alex_nomad') => {
    setLoading(true);
    try {
      const res = await authService.demoLogin(username);
      setUser(res.user);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        demoLogin,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
