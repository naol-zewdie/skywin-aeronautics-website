import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { getRequiredRoles, hasRequiredRole } from '@/lib/route-roles';
import type { UserRole } from '@/lib/route-roles';

/**
 * Next.js Edge Middleware — Server-Side Route Authorization
 *
 * This middleware runs on the Edge runtime BEFORE any page is rendered or
 * any client-side JavaScript executes. It is therefore immune to:
 *   - Burp Suite / interceptor manipulation of API response bodies
 *   - localStorage / sessionStorage tampering
 *   - React state manipulation via DevTools
 *
 * How it works:
 *   1. Reads the `accessToken` HttpOnly cookie (set by the backend on login)
 *   2. Cryptographically verifies the JWT signature using the shared secret
 *   3. Extracts the role from the verified payload (cannot be tampered with)
 *   4. Checks route-role rules and redirects unauthorized users immediately
 *
 * An attacker intercepting the /auth/login or /auth/me response can change
 * the JSON body, but they CANNOT change the HttpOnly cookie (which is set by
 * the Set-Cookie header, not accessible to JS) or forge a valid JWT signature.
 */

const PUBLIC_PATHS = [
  '/login',
  '/forgot-password',
  '/reset-password',
  '/api/',         // proxy routes — backend handles auth
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p)
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow static assets and Next.js internals
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/public/')
  ) {
    return NextResponse.next();
  }

  // Allow public pages without auth check
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // --- Step 1: Read the access token from the HttpOnly cookie ---
  // Cookie name must match what the backend sets (auth.controller.ts line 369: "accessToken")
  const accessToken = request.cookies.get('accessToken')?.value;

  if (!accessToken) {
    // No token cookie → redirect to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // --- Step 2: Cryptographically verify the JWT ---
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    // Misconfiguration — fail safe by redirecting to login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  let verifiedRole: UserRole;
  try {
    const { payload } = await jwtVerify(
      accessToken,
      new TextEncoder().encode(jwtSecret),
      { algorithms: ['HS256'] }
    );

    // Reject if not an access token
    if (payload.type !== 'access') {
      throw new Error('Not an access token');
    }

    const role = payload.role as string;
    verifiedRole = role as UserRole;
  } catch {
    // Invalid, expired, or tampered token → clear cookie and redirect
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('access_token');
    return response;
  }

  // --- Step 3: Check route-level role requirements ---
  const requiredRoles = getRequiredRoles(pathname);
  if (!hasRequiredRole(verifiedRole, requiredRoles)) {
    // Authenticated but insufficient role → redirect to dashboard (not login)
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  /*
   * Match all routes except:
   * - Static files (_next/static, _next/image, favicon, etc.)
   * - Public assets
   *
   * The API proxy routes (/api/*) are intentionally included in PUBLIC_PATHS
   * above so the middleware skips them — the backend NestJS handles auth there.
   */
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
