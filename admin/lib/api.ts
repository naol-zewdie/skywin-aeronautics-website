import axios, { AxiosError } from 'axios';
import { type Product, type Service, type CareerOpening, type User, type LoginCredentials, type AuthResponse, type DashboardStats } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/login', credentials);
    return data;
  },

  getMe: async (): Promise<User> => {
    const { data } = await api.get<User>('/auth/me');
    return data;
  },
};

// Users API
export const usersApi = {
  getAll: async (): Promise<User[]> => {
    const { data } = await api.get<User[]>('/users');
    return data;
  },

  getById: async (id: string): Promise<User> => {
    const { data } = await api.get<User>(`/users/${id}`);
    return data;
  },

  create: async (user: Omit<User, 'id' | 'audit'>): Promise<User> => {
    const { data } = await api.post<User>('/users', user);
    return data;
  },

  update: async (id: string, user: Partial<User>): Promise<User> => {
    const { data } = await api.patch<User>(`/users/${id}`, user);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};

// Products API
export const productsApi = {
  getAll: async (): Promise<Product[]> => {
    const { data } = await api.get<Product[]>('/products');
    return data;
  },

  getById: async (id: string): Promise<Product> => {
    const { data } = await api.get<Product>(`/products/${id}`);
    return data;
  },

  create: async (product: Omit<Product, 'id' | 'audit'>): Promise<Product> => {
    const { data } = await api.post<Product>('/products', product);
    return data;
  },

  update: async (id: string, product: Partial<Product>): Promise<Product> => {
    const { data } = await api.patch<Product>(`/products/${id}`, product);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`);
  },
};

// Services API
export const servicesApi = {
  getAll: async (): Promise<Service[]> => {
    const { data } = await api.get<Service[]>('/services');
    return data;
  },

  getById: async (id: string): Promise<Service> => {
    const { data } = await api.get<Service>(`/services/${id}`);
    return data;
  },

  create: async (service: Omit<Service, 'id' | 'audit'>): Promise<Service> => {
    const { data } = await api.post<Service>('/services', service);
    return data;
  },

  update: async (id: string, service: Partial<Service>): Promise<Service> => {
    const { data } = await api.patch<Service>(`/services/${id}`, service);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/services/${id}`);
  },
};

// Careers API
export const careersApi = {
  getAll: async (): Promise<CareerOpening[]> => {
    const { data } = await api.get<CareerOpening[]>('/careers');
    return data;
  },

  getById: async (id: string): Promise<CareerOpening> => {
    const { data } = await api.get<CareerOpening>(`/careers/${id}`);
    return data;
  },

  create: async (career: Omit<CareerOpening, 'id' | 'audit'>): Promise<CareerOpening> => {
    const { data } = await api.post<CareerOpening>('/careers', career);
    return data;
  },

  update: async (id: string, career: Partial<CareerOpening>): Promise<CareerOpening> => {
    const { data } = await api.patch<CareerOpening>(`/careers/${id}`, career);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/careers/${id}`);
  },
};

// Dashboard API
export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const { data } = await api.get<DashboardStats>('/admin/dashboard/stats');
    return data;
  },
};

export default api;
