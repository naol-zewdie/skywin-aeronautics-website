'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { type User, type LoginCredentials } from '@/types';
import { authApi } from '@/lib/api';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (roles: string[]) => boolean;
  refreshAccessToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PUBLIC_PATHS = ['/login'];
const TOKEN_REFRESH_BUFFER = 5 * 60 * 1000; // Refresh 5 minutes before expiry

// Storage keys
const STORAGE_KEYS = {
  accessToken: 'skywin_access_token',
  refreshToken: 'skywin_refresh_token',
  expiresAt: 'skywin_token_expires',
  user: 'skywin_user',
} as const;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Clear all auth data
  const clearAuthData = useCallback(() => {
    setUser(null);
    setTokens(null);
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }, []);

  // Initialize auth state from storage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const accessToken = localStorage.getItem(STORAGE_KEYS.accessToken);
        const refreshToken = localStorage.getItem(STORAGE_KEYS.refreshToken);
        const expiresAt = localStorage.getItem(STORAGE_KEYS.expiresAt);
        const savedUser = localStorage.getItem(STORAGE_KEYS.user);

        if (!accessToken || !refreshToken) {
          setIsLoading(false);
          if (!PUBLIC_PATHS.includes(pathname)) {
            router.push('/login');
          }
          return;
        }

        const expirationTime = expiresAt ? parseInt(expiresAt, 10) : 0;
        const now = Date.now();

        // Check if token is expired or about to expire
        if (expirationTime - TOKEN_REFRESH_BUFFER < now) {
          // Try to refresh the token
          const refreshSuccess = await handleTokenRefresh(refreshToken);
          if (!refreshSuccess) {
            clearAuthData();
            if (!PUBLIC_PATHS.includes(pathname)) {
              router.push('/login');
            }
            setIsLoading(false);
            return;
          }
        }

        // Token still valid, restore session
        setTokens({
          accessToken,
          refreshToken,
          expiresAt: expirationTime,
        });

        if (savedUser) {
          setUser(JSON.parse(savedUser));
        } else {
          // Validate token by fetching current user
          const userData = await authApi.getMe();
          setUser(userData);
          localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(userData));
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        clearAuthData();
        if (!PUBLIC_PATHS.includes(pathname)) {
          router.push('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [pathname, router, clearAuthData]);

  // Token refresh handler
  const handleTokenRefresh = async (refreshToken: string): Promise<boolean> => {
    try {
      const newTokens = await authApi.refreshToken(refreshToken);
      setTokens(newTokens);
      localStorage.setItem(STORAGE_KEYS.accessToken, newTokens.accessToken);
      localStorage.setItem(STORAGE_KEYS.refreshToken, newTokens.refreshToken);
      localStorage.setItem(STORAGE_KEYS.expiresAt, newTokens.expiresAt.toString());

      // Refresh user data
      const userData = await authApi.getMe();
      setUser(userData);
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(userData));

      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  };

  // Auto-refresh token before expiry
  useEffect(() => {
    if (!tokens?.expiresAt) return;

    const now = Date.now();
    const timeUntilRefresh = tokens.expiresAt - TOKEN_REFRESH_BUFFER - now;

    if (timeUntilRefresh <= 0) return;

    const refreshTimer = setTimeout(() => {
      if (tokens.refreshToken) {
        handleTokenRefresh(tokens.refreshToken);
      }
    }, timeUntilRefresh);

    return () => clearTimeout(refreshTimer);
  }, [tokens]);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(credentials);

      // Store tokens
      localStorage.setItem(STORAGE_KEYS.accessToken, response.token);
      localStorage.setItem(STORAGE_KEYS.refreshToken, response.refreshToken);
      localStorage.setItem(STORAGE_KEYS.expiresAt, response.expiresAt.toString());
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(response.user));

      setTokens({
        accessToken: response.token,
        refreshToken: response.refreshToken,
        expiresAt: response.expiresAt,
      });
      setUser(response.user);

      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      // Call logout endpoint
      await authApi.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      clearAuthData();
      setIsLoading(false);
      router.push('/login');
    }
  };

  const refreshAccessToken = async (): Promise<boolean> => {
    const refreshToken = tokens?.refreshToken || localStorage.getItem(STORAGE_KEYS.refreshToken);
    if (!refreshToken) {
      clearAuthData();
      router.push('/login');
      return false;
    }

    const success = await handleTokenRefresh(refreshToken);
    if (!success) {
      clearAuthData();
      router.push('/login');
    }
    return success;
  };

  const hasRole = (roles: string[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        hasRole,
        refreshAccessToken,
      }}
    >
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
