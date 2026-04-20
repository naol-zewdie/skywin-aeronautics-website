import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import {
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

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Storage keys (must match AuthContext)
const STORAGE_KEYS = {
  accessToken: 'skywin_access_token',
  refreshToken: 'skywin_refresh_token',
  expiresAt: 'skywin_token_expires',
  user: 'skywin_user',
} as const;

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// Subscribe to token refresh
function subscribeTokenRefresh(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

// Notify all subscribers of new token
function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}

// Add auth token to requests
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(STORAGE_KEYS.accessToken);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Handle auth errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // Check if this is a refresh token request - don't retry those
      if (originalRequest.url?.includes('/auth/refresh')) {
        // Clear all auth data and redirect to login
        Object.values(STORAGE_KEYS).forEach((key) => {
          localStorage.removeItem(key);
        });
        window.location.href = '/login';
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Wait for token refresh and retry original request
        return new Promise((resolve) => {
          subscribeTokenRefresh((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem(STORAGE_KEYS.refreshToken);
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Call refresh endpoint
        const { data } = await axios.post<RefreshTokenResponse>(
          `${API_URL}/auth/refresh`,
          { refreshToken },
        );

        // Update tokens
        localStorage.setItem(STORAGE_KEYS.accessToken, data.accessToken);
        localStorage.setItem(STORAGE_KEYS.refreshToken, data.refreshToken);
        localStorage.setItem(STORAGE_KEYS.expiresAt, data.expiresAt.toString());

        // Notify subscribers
        onTokenRefreshed(data.accessToken);

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Clear auth data on refresh failure
        Object.values(STORAGE_KEYS).forEach((key) => {
          localStorage.removeItem(key);
        });
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other errors
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data as { message?: string; error?: string } | undefined;

      // Log for debugging (in production, use proper error tracking)
      if (status >= 500) {
        console.error('Server error:', data?.message || 'Unknown server error');
      }
    } else if (error.request) {
      // Request was made but no response received
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

    // Transform to match AuthResponse interface
    return {
      token: data.accessToken,
      refreshToken: data.refreshToken,
      expiresAt: data.expiresAt,
      user: data.user,
    };
  },

  logout: async (): Promise<void> => {
    await api.post('/v1/auth/logout');
  },

  refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    const { data } = await api.post<RefreshTokenResponse>('/v1/auth/refresh', { refreshToken });
    return data;
  },

  getMe: async (): Promise<User> => {
    const { data } = await api.get<User>('/v1/auth/me');
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
