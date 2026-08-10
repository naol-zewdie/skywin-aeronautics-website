import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const PROXY_HEADERS = new Set([
  'authorization',
  'content-type',
  'x-csrf-token',
  'x-requested-with',
  'accept',
  'accept-encoding',
  'accept-language',
]);

async function proxy(request: NextRequest, params: { path: string[] }) {
  const path = params.path.join('/');
  
  if (path.includes('..') || !path.startsWith('v1/')) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
  }
  
  const targetUrl = `${BACKEND_URL}/${path}`;
  const targetUrlObj = new URL(targetUrl);

  const headers = new Headers();
  headers.set('host', targetUrlObj.host);

  for (const [key, value] of request.headers.entries()) {
    if (PROXY_HEADERS.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  }

  // Set trusted client IP for rate limiting
  // NextRequest.ip contains the IP of the client, avoiding spoofable x-forwarded-for headers
  const clientIp = (request as unknown as { ip?: string }).ip || '127.0.0.1';
  headers.set('x-forwarded-for', clientIp);

  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    headers.set('cookie', cookieHeader);
  }


  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: 'manual',
  };

  if (!['GET', 'HEAD'].includes(request.method)) {
    init.body = request.body;
    // @ts-expect-error duplex is needed for streaming body in Node fetch
    init.duplex = 'half';
  }

  const backendResponse = await fetch(targetUrl, init);

  const proxyResponse = new NextResponse(backendResponse.body, {
    status: backendResponse.status,
    statusText: backendResponse.statusText,
  });

  const setCookies = typeof backendResponse.headers.getSetCookie === 'function'
    ? backendResponse.headers.getSetCookie()
    : null;

  backendResponse.headers.forEach((value, key) => {
    if (setCookies && key.toLowerCase() === 'set-cookie') {
      return;
    }
    proxyResponse.headers.set(key, value);
  });

  if (setCookies) {
    for (const sc of setCookies) {
      proxyResponse.headers.append('set-cookie', sc);
    }
  }

  return proxyResponse;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(request, await params);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(request, await params);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(request, await params);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(request, await params);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(request, await params);
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    // Native Next.js routes within the same origin do not require explicit CORS headers
  });
}
