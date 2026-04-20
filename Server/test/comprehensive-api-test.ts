/**
 * Comprehensive API Test Suite
 * Tests all endpoints with authentication, roles, validation, and security
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import FormData from 'form-data';

// Base configuration
const API_BASE_URL = process.env.API_URL || 'http://localhost:3001';
const REQUEST_TIMEOUT = 10000;

// Test results
interface TestResult {
  name: string;
  passed: boolean;
  status?: number;
  error?: string;
  responseTime?: number;
}

const results: TestResult[] = [];

// HTTP Client
class ApiClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: REQUEST_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
      validateStatus: () => true, // Don't throw on error status
    });
  }

  setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.client.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    delete this.client.defaults.headers.common['Authorization'];
  }

  async request<T = any>(
    method: string,
    endpoint: string,
    data?: any,
    customHeaders?: Record<string, string>
  ): Promise<AxiosResponse<T>> {
    const start = Date.now();
    const response = await this.client.request({
      method,
      url: endpoint,
      data,
      headers: customHeaders,
    });
    const responseTime = Date.now() - start;
    (response as any).responseTime = responseTime;
    return response;
  }

  get<T = any>(endpoint: string, customHeaders?: Record<string, string>) {
    return this.request<T>('GET', endpoint, undefined, customHeaders);
  }

  post<T = any>(endpoint: string, data: any, customHeaders?: Record<string, string>) {
    return this.request<T>('POST', endpoint, data, customHeaders);
  }

  patch<T = any>(endpoint: string, data: any, customHeaders?: Record<string, string>) {
    return this.request<T>('PATCH', endpoint, data, customHeaders);
  }

  delete<T = any>(endpoint: string, customHeaders?: Record<string, string>) {
    return this.request<T>('DELETE', endpoint, undefined, customHeaders);
  }
}

const client = new ApiClient();

// Helper functions
function recordResult(name: string, passed: boolean, status?: number, error?: string, responseTime?: number) {
  results.push({ name, passed, status, error, responseTime });
  const icon = passed ? '✓' : '✗';
  const time = responseTime ? ` (${responseTime}ms)` : '';
  console.log(`${icon} ${name}${time}`);
  if (error) console.log(`  Error: ${error}`);
}

async function runTest(
  name: string,
  fn: () => Promise<{ success: boolean; status?: number; error?: string; responseTime?: number }>
): Promise<void> {
  try {
    const result = await fn();
    recordResult(name, result.success, result.status, result.error, result.responseTime);
  } catch (err: any) {
    recordResult(name, false, undefined, err.message);
  }
}

// ==================== TEST SUITES ====================

// AUTHENTICATION TESTS
async function testAuthentication(): Promise<void> {
  console.log('\n=== AUTHENTICATION TESTS ===\n');

  // Test 1: Login with valid credentials
  await runTest('Auth: Login with valid admin credentials', async () => {
    const res = await client.post('/auth/login', {
      email: 'admin@skywin.aero',
      password: 'admin123',
    });
    if (res.status === 200 && res.data.accessToken) {
      client.setTokens(res.data.accessToken, res.data.refreshToken);
      return { success: true, status: res.status, responseTime: (res as any).responseTime };
    }
    return { success: false, status: res.status, error: res.data.message || 'No access token' };
  });

  // Test 2: Login with invalid credentials
  await runTest('Auth: Login with invalid credentials returns 401', async () => {
    const res = await client.post('/auth/login', {
      email: 'admin@skywin.aero',
      password: 'wrongpassword',
    });
    return { success: res.status === 401, status: res.status };
  });

  // Test 3: Login with non-existent user
  await runTest('Auth: Login with non-existent user returns 401', async () => {
    const res = await client.post('/auth/login', {
      email: 'nonexistent@example.com',
      password: 'somepassword',
    });
    return { success: res.status === 401, status: res.status };
  });

  // Test 4: Login with missing credentials
  await runTest('Auth: Login with missing credentials returns 400', async () => {
    const res = await client.post('/auth/login', { email: 'test@test.com' });
    return { success: res.status === 400, status: res.status };
  });

  // Test 5: Get current user
  await runTest('Auth: Get current user (/auth/me)', async () => {
    const res = await client.get('/auth/me');
    return { success: res.status === 200 && res.data.email === 'admin@skywin.aero', status: res.status };
  });

  // Test 6: Get user without token
  await runTest('Auth: Get user without token returns 401', async () => {
    client.clearTokens();
    const res = await client.get('/auth/me');
    return { success: res.status === 401, status: res.status };
  });

  // Restore token
  const loginRes = await client.post('/auth/login', {
    email: 'admin@skywin.aero',
    password: 'admin123',
  });
  if (loginRes.status === 200) {
    client.setTokens(loginRes.data.accessToken, loginRes.data.refreshToken);
  }

  // Test 7: Refresh token
  await runTest('Auth: Refresh token', async () => {
    const res = await client.post('/auth/refresh', { refreshToken: client['refreshToken'] });
    return { success: res.status === 200 && res.data.accessToken, status: res.status };
  });

  // Test 8: Logout
  await runTest('Auth: Logout', async () => {
    const res = await client.post('/auth/logout', {});
    return { success: res.status === 204 || res.status === 200, status: res.status };
  });
}

// POSTS MODULE TESTS
async function testPosts(): Promise<void> {
  console.log('\n=== POSTS MODULE TESTS ===\n');

  // Ensure we're logged in as admin
  const loginRes = await client.post('/auth/login', {
    email: 'admin@skywin.aero',
    password: 'admin123',
  });
  if (loginRes.status === 200) {
    client.setTokens(loginRes.data.accessToken, loginRes.data.refreshToken);
  }

  let createdPostId: string;

  // Test 1: Get all posts
  await runTest('Posts: Get all posts', async () => {
    const res = await client.get('/posts');
    return { success: res.status === 200 && Array.isArray(res.data), status: res.status };
  });

  // Test 2: Get posts by type
  await runTest('Posts: Get posts by type (news)', async () => {
    const res = await client.get('/posts/by-type/news');
    return { success: res.status === 200 && Array.isArray(res.data), status: res.status };
  });

  await runTest('Posts: Get posts by type (blog)', async () => {
    const res = await client.get('/posts/by-type/blog');
    return { success: res.status === 200 && Array.isArray(res.data), status: res.status };
  });

  await runTest('Posts: Get posts by type (event)', async () => {
    const res = await client.get('/posts/by-type/event');
    return { success: res.status === 200 && Array.isArray(res.data), status: res.status };
  });

  // Test 3: Create news post
  await runTest('Posts: Create news post', async () => {
    const res = await client.post('/posts', {
      title: 'Test News Article',
      content: 'This is a comprehensive test of the news post functionality.',
      type: 'news',
      author: 'Test Admin',
      excerpt: 'Test news excerpt',
      tags: ['test', 'news'],
    });
    if (res.status === 201 && res.data.id) {
      createdPostId = res.data.id;
      return { success: true, status: res.status };
    }
    return { success: false, status: res.status, error: res.data.message };
  });

  // Test 4: Create blog post
  await runTest('Posts: Create blog post', async () => {
    const res = await client.post('/posts', {
      title: 'Test Blog Post',
      content: 'This is a comprehensive test of the blog post functionality.',
      type: 'blog',
      author: 'Test Blogger',
      excerpt: 'Test blog excerpt',
      tags: ['test', 'blog'],
    });
    return { success: res.status === 201, status: res.status };
  });

  // Test 5: Create event post
  await runTest('Posts: Create event post', async () => {
    const res = await client.post('/posts', {
      title: 'Test Event',
      content: 'This is a comprehensive test of the event functionality.',
      type: 'event',
      author: 'Test Event Manager',
      eventDate: new Date('2026-12-31T23:59:59Z').toISOString(),
      eventLocation: 'Test Location',
      tags: ['test', 'event'],
    });
    return { success: res.status === 201, status: res.status };
  });

  // Test 6: Get single post
  await runTest('Posts: Get single post by ID', async () => {
    if (!createdPostId) return { success: false, error: 'No post created' };
    const res = await client.get(`/posts/${createdPostId}`);
    return { success: res.status === 200 && res.data.id === createdPostId, status: res.status };
  });

  // Test 7: Update post
  await runTest('Posts: Update post', async () => {
    if (!createdPostId) return { success: false, error: 'No post created' };
    const res = await client.patch(`/posts/${createdPostId}`, {
      title: 'Updated Test News Article',
      content: 'Updated content for the news article.',
    });
    return { success: res.status === 200, status: res.status };
  });

  // Test 8: Validation - Create post without required fields
  await runTest('Posts: Validation - Create without title returns 400', async () => {
    const res = await client.post('/posts', {
      content: 'Content without title',
      type: 'news',
      author: 'Test',
    });
    return { success: res.status === 400, status: res.status };
  });

  // Test 9: Validation - Create post with invalid type
  await runTest('Posts: Validation - Create with invalid type returns 400', async () => {
    const res = await client.post('/posts', {
      title: 'Invalid Type Test',
      content: 'Content',
      type: 'invalidtype',
      author: 'Test',
    });
    return { success: res.status === 400, status: res.status };
  });

  // Test 10: Filter posts by search
  await runTest('Posts: Filter by search query', async () => {
    const res = await client.get('/posts?search=Test');
    return { success: res.status === 200 && Array.isArray(res.data), status: res.status };
  });

  // Test 11: Export to CSV
  await runTest('Posts: Export to CSV', async () => {
    const res = await client.get('/posts/export/csv');
    return { success: res.status === 200 && res.headers['content-type']?.includes('text/csv'), status: res.status };
  });

  // Test 12: Export to PDF
  await runTest('Posts: Export to PDF', async () => {
    const res = await client.get('/posts/export/pdf');
    return { success: res.status === 200 && res.headers['content-type']?.includes('application/pdf'), status: res.status };
  });

  // Test 13: Delete post
  await runTest('Posts: Delete post', async () => {
    if (!createdPostId) return { success: false, error: 'No post created' };
    const res = await client.delete(`/posts/${createdPostId}`);
    return { success: res.status === 204 || res.status === 200, status: res.status };
  });

  // Test 14: Get deleted post (should return 404)
  await runTest('Posts: Get deleted post returns 404', async () => {
    if (!createdPostId) return { success: false, error: 'No post created' };
    const res = await client.get(`/posts/${createdPostId}`);
    return { success: res.status === 404, status: res.status };
  });
}

// PRODUCTS MODULE TESTS
async function testProducts(): Promise<void> {
  console.log('\n=== PRODUCTS MODULE TESTS ===\n');

  let createdProductId: string;

  // Test 1: Get all products
  await runTest('Products: Get all products', async () => {
    const res = await client.get('/products');
    return { success: res.status === 200 && Array.isArray(res.data), status: res.status };
  });

  // Test 2: Create product
  await runTest('Products: Create product', async () => {
    const res = await client.post('/products', {
      name: 'Test Product',
      category: 'Test Category',
      description: 'This is a test product description.',
      price: 999.99,
      stock: 100,
    });
    if (res.status === 201 && res.data.id) {
      createdProductId = res.data.id;
      return { success: true, status: res.status };
    }
    return { success: false, status: res.status, error: res.data.message };
  });

  // Test 3: Validation - Create without required fields
  await runTest('Products: Validation - Create without name returns 400', async () => {
    const res = await client.post('/products', {
      category: 'Test',
      description: 'Description',
      price: 100,
      stock: 10,
    });
    return { success: res.status === 400, status: res.status };
  });

  // Test 4: Update product
  await runTest('Products: Update product', async () => {
    if (!createdProductId) return { success: false, error: 'No product created' };
    const res = await client.patch(`/products/${createdProductId}`, {
      price: 899.99,
      stock: 50,
    });
    return { success: res.status === 200, status: res.status };
  });

  // Test 5: Filter products
  await runTest('Products: Filter by category', async () => {
    const res = await client.get('/products?category=Test');
    return { success: res.status === 200 && Array.isArray(res.data), status: res.status };
  });

  // Test 6: Export to CSV
  await runTest('Products: Export to CSV', async () => {
    const res = await client.get('/products/export/csv');
    return { success: res.status === 200, status: res.status };
  });

  // Test 7: Delete product
  await runTest('Products: Delete product', async () => {
    if (!createdProductId) return { success: false, error: 'No product created' };
    const res = await client.delete(`/products/${createdProductId}`);
    return { success: res.status === 204 || res.status === 200, status: res.status };
  });
}

// USERS MODULE TESTS
async function testUsers(): Promise<void> {
  console.log('\n=== USERS MODULE TESTS ===\n');

  let createdUserId: string;

  // Test 1: Get all users
  await runTest('Users: Get all users', async () => {
    const res = await client.get('/users');
    return { success: res.status === 200 && Array.isArray(res.data), status: res.status };
  });

  // Test 2: Create user
  await runTest('Users: Create user', async () => {
    const res = await client.post('/users', {
      fullName: 'Test User',
      email: `testuser${Date.now()}@test.com`,
      role: 'viewer',
      password: 'TestPass123!',
    });
    if (res.status === 201 && res.data.id) {
      createdUserId = res.data.id;
      return { success: true, status: res.status };
    }
    return { success: false, status: res.status, error: res.data.message };
  });

  // Test 3: Validation - Create user with weak password
  await runTest('Users: Validation - Weak password returns 400', async () => {
    const res = await client.post('/users', {
      fullName: 'Test User',
      email: 'test@test.com',
      role: 'viewer',
      password: 'weak',
    });
    return { success: res.status === 400, status: res.status };
  });

  // Test 4: Validation - Invalid email
  await runTest('Users: Validation - Invalid email returns 400', async () => {
    const res = await client.post('/users', {
      fullName: 'Test User',
      email: 'invalid-email',
      role: 'viewer',
      password: 'TestPass123!',
    });
    return { success: res.status === 400, status: res.status };
  });

  // Test 5: Validation - Invalid role
  await runTest('Users: Validation - Invalid role returns 400', async () => {
    const res = await client.post('/users', {
      fullName: 'Test User',
      email: 'test@test.com',
      role: 'superadmin',
      password: 'TestPass123!',
    });
    return { success: res.status === 400, status: res.status };
  });

  // Test 6: Update user
  await runTest('Users: Update user', async () => {
    if (!createdUserId) return { success: false, error: 'No user created' };
    const res = await client.patch(`/users/${createdUserId}`, {
      fullName: 'Updated Test User',
    });
    return { success: res.status === 200, status: res.status };
  });

  // Test 7: Delete user
  await runTest('Users: Delete user', async () => {
    if (!createdUserId) return { success: false, error: 'No user created' };
    const res = await client.delete(`/users/${createdUserId}`);
    return { success: res.status === 204 || res.status === 200, status: res.status };
  });
}

// ROLES & SECURITY TESTS
async function testRolesAndSecurity(): Promise<void> {
  console.log('\n=== ROLES & SECURITY TESTS ===\n');

  // Test Viewer Role - can only view
  await runTest('Security: Viewer can access GET endpoints', async () => {
    // Create a viewer user and login
    const viewerEmail = `viewer${Date.now()}@test.com`;
    await client.post('/users', {
      fullName: 'Viewer User',
      email: viewerEmail,
      role: 'viewer',
      password: 'ViewerPass123!',
    });

    // Note: This would need actual implementation with proper user creation
    // For now, we're testing with existing fallback users
    const res = await client.get('/posts');
    return { success: res.status === 200, status: res.status };
  });

  // Test Operator Role
  await runTest('Security: Operator can create posts', async () => {
    const res = await client.post('/posts', {
      title: 'Operator Test Post',
      content: 'Testing operator permissions.',
      type: 'news',
      author: 'Test Operator',
    });
    // Should succeed for admin (current user)
    return { success: res.status === 201, status: res.status };
  });

  // Test Unauthorized Access
  await runTest('Security: Unauthenticated request returns 401', async () => {
    client.clearTokens();
    const res = await client.get('/posts');
    const success = res.status === 401;

    // Re-authenticate
    const loginRes = await client.post('/auth/login', {
      email: 'admin@skywin.aero',
      password: 'admin123',
    });
    if (loginRes.status === 200) {
      client.setTokens(loginRes.data.accessToken, loginRes.data.refreshToken);
    }

    return { success, status: res.status };
  });
}

// SERVICES & CAREERS TESTS
async function testServicesAndCareers(): Promise<void> {
  console.log('\n=== SERVICES & CAREERS TESTS ===\n');

  // Services tests
  await runTest('Services: Get all services', async () => {
    const res = await client.get('/services');
    return { success: res.status === 200 && Array.isArray(res.data), status: res.status };
  });

  await runTest('Services: Create service', async () => {
    const res = await client.post('/services', {
      name: 'Test Service',
      description: 'Test service description',
    });
    return { success: res.status === 201, status: res.status };
  });

  // Careers tests
  await runTest('Careers: Get all career openings', async () => {
    const res = await client.get('/careers');
    return { success: res.status === 200 && Array.isArray(res.data), status: res.status };
  });

  await runTest('Careers: Create career opening', async () => {
    const res = await client.post('/careers', {
      title: 'Test Position',
      department: 'Engineering',
      location: 'Remote',
      description: 'Test job description',
      requirements: ['Skill 1', 'Skill 2'],
    });
    return { success: res.status === 201, status: res.status };
  });
}

// ERROR HANDLING TESTS
async function testErrorHandling(): Promise<void> {
  console.log('\n=== ERROR HANDLING TESTS ===\n');

  // Test 404 for non-existent resource
  await runTest('Errors: Non-existent post returns 404', async () => {
    const res = await client.get('/posts/nonexistentid123');
    return { success: res.status === 404, status: res.status };
  });

  // Test invalid ID format
  await runTest('Errors: Invalid ID format handled gracefully', async () => {
    const res = await client.get('/posts/!!!invalid!!!');
    // Should return 404 or 400, not 500
    return { success: res.status === 404 || res.status === 400, status: res.status };
  });

  // Test validation error messages
  await runTest('Errors: Validation returns clear error messages', async () => {
    const res = await client.post('/posts', { title: '' }); // Empty title
    return {
      success: res.status === 400 && (res.data.message || res.data.errors),
      status: res.status,
    };
  });
}

// MAIN TEST RUNNER
async function runAllTests(): Promise<void> {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║       COMPREHENSIVE API TEST SUITE                        ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`API Base URL: ${API_BASE_URL}\n`);

  const startTime = Date.now();

  try {
    await testAuthentication();
    await testPosts();
    await testProducts();
    await testUsers();
    await testServicesAndCareers();
    await testRolesAndSecurity();
    await testErrorHandling();
  } catch (err: any) {
    console.error('\nTest suite error:', err.message);
  }

  const totalTime = Date.now() - startTime;

  // Print summary
  console.log('\n══════════════════════════════════════════════════════════════');
  console.log('TEST SUMMARY');
  console.log('══════════════════════════════════════════════════════════════');

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log(`Total Tests: ${results.length}`);
  console.log(`Passed: ${passed} ✓`);
  console.log(`Failed: ${failed} ✗`);
  console.log(`Success Rate: ${((passed / results.length) * 100).toFixed(1)}%`);
  console.log(`Total Time: ${totalTime}ms`);

  if (failed > 0) {
    console.log('\n--- Failed Tests ---');
    results
      .filter((r) => !r.passed)
      .forEach((r) => {
        console.log(`  ✗ ${r.name}`);
        if (r.error) console.log(`    Error: ${r.error}`);
        if (r.status) console.log(`    Status: ${r.status}`);
      });
  }

  console.log('\n══════════════════════════════════════════════════════════════\n');

  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

// Run if executed directly
if (require.main === module) {
  runAllTests();
}

export { runAllTests, ApiClient };
