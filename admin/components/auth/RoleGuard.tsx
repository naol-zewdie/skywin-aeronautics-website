'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/lib/route-roles';

interface RoleGuardProps {
  roles: UserRole[];
  redirectTo?: string;
  children: ReactNode;
}

export function RoleGuard({ roles, redirectTo = '/dashboard', children }: RoleGuardProps) {
  const { user, isLoading, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user && !hasRole(roles)) {
      router.replace(redirectTo);
    }
  }, [isLoading, user, hasRole, roles, redirectTo, router]);

  if (isLoading || !user) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!hasRole(roles)) {
    return null;
  }

  return <>{children}</>;
}
