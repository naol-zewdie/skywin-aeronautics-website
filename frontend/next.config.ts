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
  reactStrictMode: true,
  poweredByHeader: false,
  allowedDevOrigins: ['127.0.0.1'],
  images: {
    dangerouslyAllowLocalIP: true,
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
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
