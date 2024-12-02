'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, LoginCredentials } from '../types/user';
import { apiClient } from '../api/apiClient';
import { useRouter } from 'next/navigation';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { toast } from 'sonner';

interface UserContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { handleError } = useErrorHandler();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await apiClient.getMe();
      setUser(currentUser.user);
    } catch (err) {
      handleError(err);
      setUser(null);
      if (!window.location.pathname.includes('/login')) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      const loggedInUser = await apiClient.login(credentials);
      setUser(loggedInUser);
      toast.success('Successfully logged in!');
    } catch (err) {
      handleError(err);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
      setUser(null);
      toast.success('Successfully logged out!');
      router.push('/login');
    } catch (err) {
      handleError(err);
      throw err;
    }
  };

  return (
    <UserContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
} 