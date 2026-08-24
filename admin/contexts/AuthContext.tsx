'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { type User, type LoginCredentials } from '@/types';
import { authApi, getAccessToken, getRoleFromJwt } from '@/lib/api';
import { OPAQUE_MAP_TO_ROLE } from '@/lib/route-roles';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (roles: string[]) => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PUBLIC_PATHS = ['/login', '/forgot-password', '/reset-password'];

const ROLE_REVALIDATION_INTERVAL_MS = 5 * 60 * 1000; // re-validate role from server every 5 minutes

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const authChecked = useRef(false);

  const clearAuthState = useCallback(() => {
    setUser(null);
  }, []);

  /**
   * Enforces role directly from the cryptographically signed JWT.
   * If an attacker modifies the response body of /v1/auth/me or /v1/auth/login with a proxy
   * (e.g. Burp Suite), the signed JWT cannot be forged, ensuring the UI NEVER renders
   * unauthorized admin buttons.
   */
  const enforceJwtRole = useCallback((userData: User): User => {
    const tokenRole = getRoleFromJwt(getAccessToken());
    if (tokenRole) {
      return { ...userData, role: tokenRole as any };
    }
    return userData;
  }, []);

  // Server-side role re-validation — fetches authoritative user data from /auth/me
  const refreshUser = useCallback(async () => {
    try {
      const userData = await authApi.getMe();
      setUser(enforceJwtRole(userData));
    } catch {
      clearAuthState();
    }
  }, [clearAuthState, enforceJwtRole]);

  useEffect(() => {
    if (authChecked.current) return;

    const initAuth = async () => {
      try {
        if (PUBLIC_PATHS.includes(pathname)) {
          // No session probe needed on public pages (login/forgot/reset).
          return;
        }
        const userData = await authApi.getMe();
        setUser(enforceJwtRole(userData));
      } catch {
        clearAuthState();
        if (!PUBLIC_PATHS.includes(pathname)) {
          router.push('/login');
        }
      } finally {
        setIsLoading(false);
        authChecked.current = true;
      }
    };

    initAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enforceJwtRole]);

  // Periodic role re-validation — detects server-side role changes (e.g., admin downgraded user)
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      refreshUser();
    }, ROLE_REVALIDATION_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [user, refreshUser]);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const authRes = await authApi.login(credentials);
      const userData = await authApi.getMe();
      const tokenRole = getRoleFromJwt(authRes.token || getAccessToken());
      if (tokenRole) {
        userData.role = tokenRole as any;
      }
      setUser(userData);
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      clearAuthState();
      setIsLoading(false);
      router.push('/login');
    }
  };

  const hasRole = (roles: string[]): boolean => {
    if (!user) return false;
    const userRole = OPAQUE_MAP_TO_ROLE[user.role] || user.role;
    const targetRoles = roles.map((r) => OPAQUE_MAP_TO_ROLE[r] || r);
    return targetRoles.includes(userRole);
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
        refreshUser,
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
