export type UserRole = 'r_9a3f' | 'r_4b7e' | 'r_1c2d' | 'admin' | 'operator' | 'viewer';

/** Route-prefix → allowed roles. Order matters: more specific prefixes first. */
const ROUTE_RULES: { prefix: string; roles: UserRole[] }[] = [
  { prefix: '/users', roles: ['r_9a3f', 'admin'] },
  { prefix: '/settings', roles: ['r_9a3f', 'admin'] },
  { prefix: '/products', roles: ['r_9a3f', 'r_4b7e', 'admin', 'operator'] },
  { prefix: '/services', roles: ['r_9a3f', 'r_4b7e', 'admin', 'operator'] },
  { prefix: '/careers', roles: ['r_9a3f', 'r_4b7e', 'admin', 'operator'] },
  { prefix: '/posts', roles: ['r_9a3f', 'r_4b7e', 'admin', 'operator'] },
  { prefix: '/dashboard', roles: ['r_9a3f', 'r_4b7e', 'r_1c2d', 'admin', 'operator', 'viewer'] },
];

export function getRequiredRoles(pathname: string): UserRole[] {
  for (const rule of ROUTE_RULES) {
    if (pathname === rule.prefix || pathname.startsWith(`${rule.prefix}/`)) {
      return rule.roles;
    }
  }
  return ['r_9a3f', 'r_4b7e', 'r_1c2d', 'admin', 'operator', 'viewer'];
}

export function hasRequiredRole(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  return requiredRoles.includes(userRole);
}
