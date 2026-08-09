export interface BackendService {
  id: string;
  name: string;
  description: string;
  image?: string;
  status: boolean;
}

export interface BackendProduct {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  image?: string;
  stock: number;
  status: boolean;
}

export interface BackendCareer {
  id: string;
  title: string;
  location: string;
  employmentType: string;
  description: string;
  status: boolean;
}

export interface FrontendService {
  title: string;
  description: string;
  image: string;
}

export interface FrontendProduct {
  title: string;
  shortDescription: string;
  description: string;
  images: string[];
}

export interface FrontendCareer {
  title: string;
  description: string;
  requirements?: string[];
  location?: string;
  type: 'full-time' | 'part-time' | 'contract';
  image?: string;
}

export interface BackendPost {
  id: string;
  title: string;
  content: string;
  type: ContentType;
  author: string;
  excerpt?: string;
  coverImage?: string;
  tags?: string[];
  eventDate?: Date;
  eventLocation?: string;
  status: boolean;
  views?: number;
  createdAt?: string;
  updatedAt?: string;
}

export enum ContentType {
  NEWS = 'news',
  BLOG = 'blog',
  EVENT = 'event',
}

export interface FrontendPost {
  _id: string;
  title: string;
  content: string;
  type: ContentType;
  author: string;
  excerpt?: string;
  coverImage?: string;
  tags?: string[];
  eventDate?: Date;
  eventLocation?: string;
  status: boolean;
  views?: number;
  createdAt: string;
  updatedAt: string;
}