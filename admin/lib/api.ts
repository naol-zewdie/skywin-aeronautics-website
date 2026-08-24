import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import {
  type Post,
  type Product,
  type Service,
  type CareerOpening,
  type User,
  type LoginCredentials,
  type AuthResponse,
  type DashboardStats,
  type ActivityItem,
} from '@/types';

interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}


// In-memory access token — sent as Bearer header for reliable proxy forwarding
let inMemoryToken: string | null = null;

export function setAccessToken(token: string | null) {
  inMemoryToken = token;
}

export function getAccessToken(): string | null {
  return inMemoryToken;
}

/**
 * Extracts and decodes the user role directly from the cryptographically signed JWT.
 * Prevents response-tampering attacks (e.g. Burp Suite response modification).
 */
export function getRoleFromJwt(token: string | null): string | null {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    return payload.role || null;
  } catch {
    return null;
  }
}

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  timeout: 30000,
  withCredentials: true,
});

// Attach Bearer token (from memory) and CSRF token from cookie to requests
function getCsrfCookie(): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(/(?:^|;\s*)csrf-token=([^;]*)/);
  return match?.[1];
}

api.interceptors.request.use(async (config) => {
  if (inMemoryToken) {
    config.headers['Authorization'] = `Bearer ${inMemoryToken}`;
  }
  if (config.method && !['get', 'head', 'options'].includes(config.method)) {
    let token = getCsrfCookie();
    if (!token) {
      try {
        const { data } = await axios.get('/api/v1/auth/csrf-token', { withCredentials: true });
        token = data.token;
      } catch {
        // If we can't get a CSRF token, continue without one (may fail on server)
      }
    }
    if (token) {
      config.headers['X-CSRF-Token'] = token;
    }
  }
  return config;
}, (error) => Promise.reject(error));

// Handle auth errors and redirect to login
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If we get a 403 (Forbidden), the user's role may have been changed server-side.
    // Only refresh the auth state if it's not a business-logic denial (which has a specific message).
    if (error.response?.status === 403) {
      const data = error.response.data as { message?: string } | undefined;
      const isBusinessLogicDenial = data?.message && (
        data.message.includes('Cannot promote') ||
        data.message.includes('Cannot edit') ||
        data.message.includes('Cannot change') ||
        data.message.includes('You can only') ||
        data.message.includes('privilege')
      );
      if (!isBusinessLogicDenial) {
        try {
          await authApi.getMe();
        } catch {
          // getMe failed — session is invalid, proceed to handle as auth failure
        }
      }
    }

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (originalRequest.url?.includes('/auth/refresh')) {
        // Refresh itself failed — the session is truly dead.
        setAccessToken(null);
        if (window.location.pathname !== '/login') {
          // eslint-disable-next-line @next/next/no-location-assign-relative-destination
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        const csrfToken = getCsrfCookie();
        const { data } = await axios.post<RefreshTokenResponse>('/api/v1/auth/refresh', {}, {
          withCredentials: true,
          headers: csrfToken ? { 'X-CSRF-Token': csrfToken } : undefined,
        });
        setAccessToken(data.accessToken);
        originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        setAccessToken(null);
        if (window.location.pathname !== '/login') {
          // eslint-disable-next-line @next/next/no-location-assign-relative-destination
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as { message?: string; error?: string } | undefined;
      if (status >= 500) {
        console.error('Server error:', data?.message || 'Unknown server error');
      }
    } else if (error.request) {
      console.error('Network error: No response received');
    }

    return Promise.reject(error);
  },
);

// Auth API
export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await api.post<{
      accessToken: string;
      refreshToken: string;
      expiresAt: number;
      user: User;
    }>('/v1/auth/login', credentials);

    setAccessToken(data.accessToken);

    return {
      token: data.accessToken,
      refreshToken: data.refreshToken,
      expiresAt: data.expiresAt,
      user: data.user,
    };
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/v1/auth/logout');
    } finally {
      setAccessToken(null);
    }
  },

  refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    const { data } = await api.post<RefreshTokenResponse>('/v1/auth/refresh', { refreshToken });
    return data;
  },

  getMe: async (): Promise<User> => {
    const { data } = await api.get<User>('/v1/auth/me');
    return data;
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const { data } = await api.post<{ message: string }>('/v1/auth/forgot-password', { email });
    return data;
  },

  resetPassword: async (email: string, token: string, password: string): Promise<{ message: string }> => {
    const { data } = await api.post<{ message: string }>('/v1/auth/reset-password', { email, token, password });
    return data;
  },
};

// Users API
export const usersApi = {
  getAll: async (): Promise<User[]> => {
    const { data } = await api.get<User[]>('/v1/users');
    return data;
  },

  getById: async (id: string): Promise<User> => {
    const { data } = await api.get<User>(`/v1/users/${id}`);
    return data;
  },

  create: async (user: Omit<User, 'id' | 'audit'>): Promise<User> => {
    const { data } = await api.post<User>('/v1/users', user);
    return data;
  },

  update: async (id: string, user: Partial<User>): Promise<User> => {
    const { data } = await api.patch<User>(`/v1/users/${id}`, user);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/v1/users/${id}`);
  },

  exportCsv: async (): Promise<Blob> => {
    const { data } = await api.get('/v1/users/export/csv', { responseType: 'blob' });
    return data;
  },

  exportPdf: async (): Promise<Blob> => {
    const { data } = await api.get('/v1/users/export/pdf', { responseType: 'blob' });
    return data;
  },

  changePassword: async (id: string, payload: { currentPassword: string; newPassword: string }): Promise<void> => {
    await api.post(`/v1/users/${id}/change-password`, payload);
  },
};

// Products API
export const productsApi = {
  getAll: async (): Promise<Product[]> => {
    const { data } = await api.get<Product[]>('/v1/products');
    return data;
  },

  getById: async (id: string): Promise<Product> => {
    const { data } = await api.get<Product>(`/v1/products/${id}`);
    return data;
  },

  create: async (product: Omit<Product, 'id' | 'audit'>): Promise<Product> => {
    const { data } = await api.post<Product>('/v1/products', product);
    return data;
  },

  update: async (id: string, product: Partial<Product>): Promise<Product> => {
    const { data } = await api.patch<Product>(`/v1/products/${id}`, product);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/v1/products/${id}`);
  },

  exportCsv: async (): Promise<Blob> => {
    const { data } = await api.get('/v1/products/export/csv', { responseType: 'blob' });
    return data;
  },

  exportPdf: async (): Promise<Blob> => {
    const { data } = await api.get('/v1/products/export/pdf', { responseType: 'blob' });
    return data;
  },

  toggleStatus: async (id: string): Promise<Product> => {
    const { data } = await api.patch<Product>(`/v1/products/${id}/toggle-status`);
    return data;
  },
};

// Services API
export const servicesApi = {
  getAll: async (): Promise<Service[]> => {
    const { data } = await api.get<Service[]>('/v1/services');
    return data;
  },

  getById: async (id: string): Promise<Service> => {
    const { data } = await api.get<Service>(`/v1/services/${id}`);
    return data;
  },

  create: async (service: Omit<Service, 'id' | 'audit'>): Promise<Service> => {
    const { data } = await api.post<Service>('/v1/services', service);
    return data;
  },

  update: async (id: string, service: Partial<Service>): Promise<Service> => {
    const { data } = await api.patch<Service>(`/v1/services/${id}`, service);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/v1/services/${id}`);
  },

  exportCsv: async (): Promise<Blob> => {
    const { data } = await api.get('/v1/services/export/csv', { responseType: 'blob' });
    return data;
  },

  exportPdf: async (): Promise<Blob> => {
    const { data } = await api.get('/v1/services/export/pdf', { responseType: 'blob' });
    return data;
  },

  toggleStatus: async (id: string): Promise<Service> => {
    const { data } = await api.patch<Service>(`/v1/services/${id}/toggle-status`);
    return data;
  },
};

// Careers API
export const careersApi = {
  getAll: async (): Promise<CareerOpening[]> => {
    const { data } = await api.get<CareerOpening[]>('/v1/careers');
    return data;
  },

  getById: async (id: string): Promise<CareerOpening> => {
    const { data } = await api.get<CareerOpening>(`/v1/careers/${id}`);
    return data;
  },

  create: async (career: Omit<CareerOpening, 'id' | 'audit'>): Promise<CareerOpening> => {
    const { data } = await api.post<CareerOpening>('/v1/careers', career);
    return data;
  },

  update: async (id: string, career: Partial<CareerOpening>): Promise<CareerOpening> => {
    const { data } = await api.patch<CareerOpening>(`/v1/careers/${id}`, career);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/v1/careers/${id}`);
  },

  exportCsv: async (): Promise<Blob> => {
    const { data } = await api.get('/v1/careers/export/csv', { responseType: 'blob' });
    return data;
  },

  exportPdf: async (): Promise<Blob> => {
    const { data } = await api.get('/v1/careers/export/pdf', { responseType: 'blob' });
    return data;
  },

  toggleStatus: async (id: string): Promise<CareerOpening> => {
    const { data } = await api.patch<CareerOpening>(`/v1/careers/${id}/toggle-status`);
    return data;
  },
};

// Dashboard API
export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const { data } = await api.get<DashboardStats>('/v1/activity/stats');
    return data;
  },

  getRecentActivity: async (): Promise<ActivityItem[]> => {
    const { data } = await api.get<ActivityItem[]>('/v1/activity/recent');
    return data;
  },
};

// Posts API
export const postsApi = {
  getAll: async (): Promise<Post[]> => {
    const { data } = await api.get<Post[]>('/v1/posts');
    return data;
  },

  getById: async (id: string): Promise<Post> => {
    const { data } = await api.get<Post>(`/v1/posts/${id}`);
    return data;
  },

  getByType: async (type: string): Promise<Post[]> => {
    const { data } = await api.get<Post[]>(`/v1/posts/by-type/${type}`);
    return data;
  },

  create: async (post: Omit<Post, 'id' | 'audit'>): Promise<Post> => {
    const { data } = await api.post<Post>('/v1/posts', post);
    return data;
  },

  update: async (id: string, post: Partial<Post>): Promise<Post> => {
    const { data } = await api.patch<Post>(`/v1/posts/${id}`, post);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/v1/posts/${id}`);
  },

  exportCsv: async (): Promise<Blob> => {
    const { data } = await api.get('/v1/posts/export/csv', { responseType: 'blob' });
    return data;
  },

  exportPdf: async (): Promise<Blob> => {
    const { data } = await api.get('/v1/posts/export/pdf', { responseType: 'blob' });
    return data;
  },

  toggleStatus: async (id: string): Promise<Post> => {
    const { data } = await api.patch<Post>(`/v1/posts/${id}/toggle-status`);
    return data;
  },
};

// Upload API
export const uploadApi = {
  uploadImage: async (file: File): Promise<{ url: string; filename: string; size: number }> => {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await api.post<{ url: string; filename: string; size: number }>('/v1/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },
};

export default api;
