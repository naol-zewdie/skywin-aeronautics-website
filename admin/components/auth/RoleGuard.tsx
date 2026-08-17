'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/lib/route-roles';

interface RoleGuardProps {
  roles: UserRole[];
  redirectTo?: string;
  children: ReactNode;
}

/**
 * Client-side secondary defence for role-based page access.
 *
 * Primary enforcement is handled by middleware.ts (server-side, Edge runtime),
 * which reads the signed JWT cookie and checks roles BEFORE any page renders.
 * This component is a defence-in-depth layer that catches:
 *   - Direct React state manipulation (DevTools)
 *   - Race conditions during client-side navigation
 *
 * It does NOT guard against Burp Suite response interception on its own
 * (that is handled by the middleware). Do not remove the middleware.
 */
export function RoleGuard({ roles, redirectTo = '/dashboard', children }: RoleGuardProps) {
  const { user, isLoading, hasRole } = useAuth();
  const router = useRouter();

  const allowed = !isLoading && !!user && hasRole(roles);

  useEffect(() => {
    if (!isLoading && user && !hasRole(roles)) {
      router.replace(redirectTo);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, user, roles, redirectTo]);

  // While loading: render nothing (prevents flash of protected content).
  // The middleware has already verified the JWT, so authenticated users
  // with the right role will see content as soon as isLoading becomes false.
  if (isLoading || !user) {
    return null;
  }

  if (!allowed) {
    return null;
  }

  return <>{children}</>;
}
