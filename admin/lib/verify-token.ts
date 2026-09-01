import { jwtVerify } from 'jose';
import type { UserRole } from './route-roles';

export interface VerifiedToken {
  role: UserRole;
  sub: string;
}

const VALID_ROLES: UserRole[] = ['r_9a3f', 'r_4b7e', 'admin', 'operator'];

export async function verifyAccessToken(token: string): Promise<VerifiedToken | null> {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('[verifyAccessToken] JWT_SECRET is not defined in environment variables! Ensure JWT_SECRET is set in admin/.env.local or production env.');
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), {
      algorithms: ['HS256'],
    });

    if (payload.type !== 'access') {
      console.warn('[verifyAccessToken] Token rejected: payload.type is not "access" (got: ' + String(payload.type) + ')');
      return null;
    }

    const role = payload.role as string;
    if (!VALID_ROLES.includes(role as UserRole)) {
      console.warn('[verifyAccessToken] Token rejected: role "' + role + '" is not in VALID_ROLES:', VALID_ROLES);
      return null;
    }

    if (typeof payload.sub !== 'string') {
      console.warn('[verifyAccessToken] Token rejected: payload.sub is not a string');
      return null;
    }

    return { role: role as UserRole, sub: payload.sub };
  } catch (err: any) {
    console.warn('[verifyAccessToken] Token verification failed:', err?.message || err);
    return null;
  }
}
