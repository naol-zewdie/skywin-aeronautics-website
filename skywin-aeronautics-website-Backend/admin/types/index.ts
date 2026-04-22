export interface User {
  id: string;
  fullName: string;
  email: string;
  role: 'admin' | 'operator' | 'viewer';
  status: boolean;
  audit?: AuditInfo;
}

export interface AuditInfo {
  createdBy?: string;
  createdAt: string;
  updatedBy?: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  image?: string;
  stock: number;
  status: boolean;
  audit?: AuditInfo;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  status: boolean;
  audit?: AuditInfo;
}

export interface CareerOpening {
  id: string;
  title: string;
  location: string;
  employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  description: string;
  status: boolean;
  audit?: AuditInfo;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;        // accessToken (for backward compatibility)
  refreshToken: string;
  expiresAt: number;    // Timestamp when access token expires
  user: User;
}

export interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalServices: number;
  activeJobs: number;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  entityType: 'user' | 'product' | 'service' | 'career' | 'post';
  entityId?: string;
}

export type ContentType = 'news' | 'blog' | 'event';

export interface Post {
  id: string;
  title: string;
  content: string;
  type: ContentType;
  author: string;
  excerpt?: string;
  coverImage?: string;
  tags?: string[];
  eventDate?: string;
  eventLocation?: string;
  status: boolean;
  views?: number;
  audit?: AuditInfo;
}
