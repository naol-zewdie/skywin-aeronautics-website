import type { NextConfig } from "next";

const apiHost = process.env.BACKEND_URL
  ? new URL(process.env.BACKEND_URL).hostname
  : 'localhost';
const apiPort = process.env.BACKEND_URL
  ? new URL(process.env.BACKEND_URL).port || undefined
  : '3005';
const apiProtocol = process.env.BACKEND_URL
  ? new URL(process.env.BACKEND_URL).protocol.replace(':', '')
  : 'http';

const nextConfig: NextConfig = {
  /*
   * Standalone output — emits a self-contained .next/standalone directory
   * during `npm run build`. The Dockerfile's runner stage copies only that
   * directory, dramatically reducing the final image size (no npm, no
   * full node_modules tree). The server is started with `node server.js`
   * instead of `npm start`.
   */
  output: "standalone",
  compress: true,
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],
  reactStrictMode: true,
  poweredByHeader: false,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
  experimental: {
    optimizePackageImports: ['@react-three/drei', 'three'],
  },
  allowedDevOrigins: ['127.0.0.1'],
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== 'production',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3005',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '3005',
        pathname: '/uploads/**',
      },
      {
        protocol: apiProtocol as 'http' | 'https',
        hostname: apiHost,
        ...(apiPort ? { port: apiPort } : {}),
        pathname: '/uploads/**',
      },
    ],
  },
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3005';
    return [
      {
        source: '/api/v1/public/:path*',
        destination: `${backendUrl}/v1/public/:path*`,
      },
      {
        source: '/api/uploads/:path*',
        destination: `${backendUrl}/uploads/:path*`,
      },
    ];
  },
  async headers() {
    /*
     * Security headers — split between here and proxy.ts:
     *
     * proxy.ts owns (per-request, nonce-aware):
     *   Content-Security-Policy  ← nonce injected fresh per request
     *   X-Frame-Options
     *   X-Content-Type-Options
     *   Referrer-Policy
     *   Permissions-Policy
     *
     * next.config.ts owns (static, applied to all routes including static files):
     *   Strict-Transport-Security ← HSTS must survive even if proxy is bypassed
     *
     * DO NOT add Content-Security-Policy here — it would create a duplicate
     * header alongside proxy.ts's live nonce-stamped version and break CSP.
     */
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key:   'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },

};

export default nextConfig;
