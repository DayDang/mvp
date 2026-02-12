'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api, { getAccessToken, setAccessToken, removeAccessToken } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  memberships: Array<{
    id: string;
    workspace_id: string;
    role: string;
    workspace: {
      id: string;
      name: string;
    }
  }>;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
  currentWorkspaceId: string | null;
  switchWorkspace: (workspaceId: string) => void;
  updateProfile: (data: { name?: string; avatar_url?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const checkAuth = useCallback(async () => {
    try {
      const token = getAccessToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      const res = await api.get('/auth/me');
      const userData = res.data.user;
      setUser(userData);

      // Initialize workspace
      if (typeof window !== 'undefined') {
        const storedWorkspaceId = localStorage.getItem('currentWorkspaceId');
        const userHasWorkspace = userData.memberships.some(
          (m: any) => m.workspace_id === storedWorkspaceId
        );

        if (storedWorkspaceId && userHasWorkspace) {
          setCurrentWorkspaceId(storedWorkspaceId);
        } else if (userData.memberships.length > 0) {
          const firstId = userData.memberships[0].workspace_id;
          setCurrentWorkspaceId(firstId);
          localStorage.setItem('currentWorkspaceId', firstId);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      removeAccessToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const switchWorkspace = (workspaceId: string) => {
    setCurrentWorkspaceId(workspaceId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentWorkspaceId', workspaceId);
    }
    // Refresh page or trigger cross-tab state update if needed
    // For now, components using currentWorkspaceId will re-render
    window.location.reload(); // Simplest way to ensure all API calls use new header
  };

  const login = async (email: string, password: string) => {
    const loginRes = await api.post('/auth/login', { email, password });
    const { accessToken } = loginRes.data;

    setAccessToken(accessToken);
    
    // Fetch full user data to ensure nested workspaces are included correctly
    const meRes = await api.get('/auth/me');
    const userData = meRes.data.user;
    
    setUser(userData);
    
    // Set default workspace on login
    if (userData.memberships && userData.memberships.length > 0) {
      const firstId = userData.memberships[0].workspace_id;
      setCurrentWorkspaceId(firstId);
      localStorage.setItem('currentWorkspaceId', firstId);
    }

    router.push('/');
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Logout endpoint may fail if token is already expired, that's fine
    }

    removeAccessToken();
    localStorage.removeItem('currentWorkspaceId');
    setUser(null);
    setCurrentWorkspaceId(null);
    router.push('/login');
  };

  const updateProfile = async (data: { name?: string; avatar_url?: string }) => {
    const res = await api.patch('/auth/me', data);
    setUser(res.data.user);
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isLoading,
      isAuthenticated: !!user,
      currentWorkspaceId,
      switchWorkspace,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
