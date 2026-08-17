import { jwtVerify } from 'jose';
import type { UserRole } from './route-roles';

export interface VerifiedToken {
  role: UserRole;
  sub: string;
}

const VALID_ROLES: UserRole[] = ['r_9a3f', 'r_4b7e', 'r_1c2d', 'admin', 'operator', 'viewer'];

export async function verifyAccessToken(token: string): Promise<VerifiedToken | null> {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), {
      algorithms: ['HS256'],
    });

    if (payload.type !== 'access') {
      return null;
    }

    const role = payload.role as string;
    if (!VALID_ROLES.includes(role as UserRole)) {
      return null;
    }

    if (typeof payload.sub !== 'string') {
      return null;
    }

    return { role: role as UserRole, sub: payload.sub };
  } catch {
    return null;
  }
}
