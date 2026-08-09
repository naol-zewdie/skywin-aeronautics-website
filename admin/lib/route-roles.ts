export type UserRole = 'admin' | 'operator' | 'viewer';

/** Route-prefix → allowed roles. Order matters: more specific prefixes first. */
const ROUTE_RULES: { prefix: string; roles: UserRole[] }[] = [
  { prefix: '/users', roles: ['admin'] },
  { prefix: '/settings', roles: ['admin'] },
  { prefix: '/products', roles: ['admin', 'operator'] },
  { prefix: '/services', roles: ['admin', 'operator'] },
  { prefix: '/careers', roles: ['admin', 'operator'] },
  { prefix: '/posts', roles: ['admin', 'operator'] },
  { prefix: '/dashboard', roles: ['admin', 'operator', 'viewer'] },
];

export function getRequiredRoles(pathname: string): UserRole[] {
  for (const rule of ROUTE_RULES) {
    if (pathname === rule.prefix || pathname.startsWith(`${rule.prefix}/`)) {
      return rule.roles;
    }
  }
  return ['admin', 'operator', 'viewer'];
}

export function hasRequiredRole(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  return requiredRoles.includes(userRole);
}
