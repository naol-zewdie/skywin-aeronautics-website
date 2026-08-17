const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
let apiHost, apiPort, apiProtocol;
try {
  const u = new URL(apiBase);
  apiHost = u.hostname;
  apiPort = u.port || undefined;
  apiProtocol = u.protocol.replace(':', '');
} catch {
  apiHost = 'localhost';
  apiPort = '3001';
  apiProtocol = 'http';
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
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
        port: '3001',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '3001',
        pathname: '/uploads/**',
      },
      {
        protocol: apiProtocol,
        hostname: apiHost,
        ...(apiPort ? { port: apiPort } : {}),
        pathname: '/uploads/**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/login',
        permanent: false,
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
