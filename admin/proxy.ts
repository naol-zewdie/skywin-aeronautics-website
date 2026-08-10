import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getRequiredRoles, hasRequiredRole } from './lib/route-roles';
import { verifyAccessToken } from './lib/verify-token';

const PUBLIC_PATHS = ['/login', '/forgot-password', '/reset-password'];

function buildCsp(nonce: string): string {
  const isDev = process.env.NODE_ENV !== 'production';
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  let connectSrc = "'self'";
  try {
    const u = new URL(apiBase);
    connectSrc += ` ${u.origin}`;
  } catch {
    connectSrc += ' http://localhost:3001';
  }

  const scriptSrc = isDev
    ? `script-src 'self' 'nonce-${nonce}' 'unsafe-eval'`
    : `script-src 'self' 'nonce-${nonce}'`;

  return [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    `connect-src ${connectSrc}`,
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');
}

function applySecurityHeaders(response: NextResponse, csp: string): NextResponse {
  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  }
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicPath = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const isApiPath = pathname.startsWith('/api/');

  if (isApiPath) {
    return NextResponse.next();
  }

  const nonce = crypto.randomUUID();
  const csp = buildCsp(nonce);

  // Forward the nonce to Next.js via a request header so it can automatically
  // inject it into its own internal scripts (hydration, chunk loader, etc.)
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

  if (!isPublicPath) {
    const accessToken = request.cookies.get('accessToken')?.value;
    if (!accessToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('returnTo', pathname);
      return applySecurityHeaders(NextResponse.redirect(loginUrl), csp);
    }

    // Role-based route enforcement requires JWT_SECRET (must match Server)
    if (!process.env.JWT_SECRET) {
      return applySecurityHeaders(
        new NextResponse("Configuration Error: JWT_SECRET missing", { status: 500 }),
        csp
      );
    }

    const verified = await verifyAccessToken(accessToken);
    if (!verified) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('returnTo', pathname);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('accessToken');
      response.cookies.delete('refreshToken');
      return applySecurityHeaders(response, csp);
    }

    const requiredRoles = getRequiredRoles(pathname);
    if (!hasRequiredRole(verified.role, requiredRoles)) {
      return applySecurityHeaders(NextResponse.redirect(new URL('/dashboard', request.url)), csp);
    }
  }

  return applySecurityHeaders(
    NextResponse.next({ request: { headers: requestHeaders } }),
    csp,
  );
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
};
