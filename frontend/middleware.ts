import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const isDev = process.env.NODE_ENV !== 'production';

function buildCsp(nonce: string): string {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3005';
  let connectSrc = "'self'";
  try {
    const u = new URL(backendUrl);
    connectSrc += ` ${u.origin}`;
  } catch {
    connectSrc += ' http://localhost:3005';
  }
  if (process.env.CSP_CONNECT_SRC) {
    connectSrc += ` ${process.env.CSP_CONNECT_SRC}`;
  }

  // Strict CSP Level 3: Nonce-based execution with strict-dynamic.
  // In development, 'unsafe-eval' is permitted for Turbopack/HMR debugging.
  // In production, zero unsafe-inline and zero unsafe-eval are permitted.
  const scriptSrc = isDev
    ? `script-src 'self' 'nonce-${nonce}' 'unsafe-eval' 'strict-dynamic'`
    : `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`;

  return [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' http: https: data: blob:",
    "font-src 'self' data: https:",
    `connect-src ${connectSrc}`,
    "media-src 'self' data: blob:",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');
}

export default function middleware(request: NextRequest) {
  // Generate a cryptographically secure random base64 nonce
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const csp = buildCsp(nonce);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', csp);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|avif|svg|ico|JPG|woff|woff2)$).*)',
};
