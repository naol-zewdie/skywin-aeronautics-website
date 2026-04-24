import { POST } from '../../app/api/contact/route';

// Mock next/server
jest.mock('next/server', () => ({
  NextRequest: class MockNextRequest {
    url: string;
    method: string;
    headers: any;
    formData: any;
    constructor(url: string, init: any) {
      this.url = url;
      this.method = init?.method || 'GET';
      this.headers = init?.headers || new Map();
      this.formData = init?.formData || jest.fn();
    }
  },
  NextResponse: {
    json: (body: any, init: any) => ({
      status: init?.status || 200,
      json: async () => body,
    }),
  },
}));

// Mock Resend
jest.mock('resend', () => {
  return {
    Resend: jest.fn().mockImplementation(() => ({
      emails: {
        send: jest.fn().mockResolvedValue({ data: { id: 'test-id' }, error: null }),
      },
    })),
  };
});

describe('Contact API Route', () => {
  let mockRequest: any;

  beforeEach(() => {
    mockRequest = {
      formData: jest.fn(),
      headers: new Headers(),
    };
  });

  it('returns 400 if fields are missing', async () => {
    const formData = new FormData();
    const req: any = new (require('next/server').NextRequest)('http://localhost/api/contact', {
      method: 'POST',
      headers: new Map(),
    });
    req.formData = jest.fn().mockResolvedValue(formData);

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('All fields are required');
  });

  it('returns 400 for invalid email format', async () => {
    const formData = new FormData();
    formData.append('name', 'John Doe');
    formData.append('email', 'invalid-email');
    formData.append('message', 'Hello World');
    
    const req: any = new (require('next/server').NextRequest)('http://localhost/api/contact', {
      method: 'POST',
      headers: new Map(),
    });
    req.formData = jest.fn().mockResolvedValue(formData);

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid email address');
  });

  it('returns 200 for successful submission', async () => {
    const formData = new FormData();
    formData.append('name', 'John Doe');
    formData.append('email', 'john@example.com');
    formData.append('message', 'Hello World');
    
    const headers = new Map();
    headers.set('x-forwarded-for', '192.168.1.100');
    
    const req: any = new (require('next/server').NextRequest)('http://localhost/api/contact', {
      method: 'POST',
      headers: headers
    });
    req.formData = jest.fn().mockResolvedValue(formData);

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
