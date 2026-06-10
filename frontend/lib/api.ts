import { 
  BackendService, 
  BackendProduct, 
  BackendCareer,
  BackendPost,
  ContentType,
  FrontendService,
  FrontendProduct,
  FrontendCareer,
  FrontendPost
} from './types';

const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';

function getApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';
  if (configured.startsWith('http')) return configured.replace(/\/$/, '');
  // Server-side fetches need an absolute URL; browser uses the Next.js proxy path.
  if (typeof window === 'undefined') {
    return (process.env.BACKEND_URL || 'http://localhost:3001').replace(/\/$/, '');
  }
  return configured.replace(/\/$/, '');
}

const stripHtml = (html: string): string => {
  if (!html) return '';
  return html.replace(/<[^>]*>?/gm, '');
};

class ApiClient {
  private defaultHeaders: Record<string, string>;

  constructor() {
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  private getBaseUrl(): string {
    return `${getApiBaseUrl()}/${API_VERSION}`;
  }

  private async doFetch(url: string, options: RequestInit = {}) {
    const controller = new AbortController();
    const timeoutMs = 10000;
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const token = this.getAuthToken();

      const headersInit: HeadersInit = ((): HeadersInit => {
        if (options.headers instanceof Headers) {
          const h = new Headers(options.headers as Headers);
          Object.entries(this.defaultHeaders).forEach(([k, v]) => {
            if (!h.has(k)) h.set(k, v);
          });
          if (token) h.set('Authorization', `Bearer ${token}`);
          return h;
        }
        const base: Record<string, string> = { ...this.defaultHeaders, ...(options.headers as Record<string, string> || {}) };
        if (token) base['Authorization'] = `Bearer ${token}`;
        return base;
      })();

      const res = await fetch(url, {
        credentials: 'include',
        mode: 'cors',
        headers: headersInit,
        signal: controller.signal,
        ...options,
      });
      return res;
    } finally {
      clearTimeout(timeout);
    }
  }
  // Try localStorage first, then cookie named 'token'
  private getAuthToken(): string | null {
    try {
      if (typeof window !== 'undefined') {
        const ls = window.localStorage.getItem('token');
        if (ls) return ls;

        const match = document.cookie.match(new RegExp('(^| )token=([^;]+)'));
        if (match) return decodeURIComponent(match[2]);
      }
    } catch (e) {
      // ignore
    }
    return null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const isAbsolute = /^https?:\/\//i.test(endpoint);
    const normalized = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = isAbsolute ? endpoint : `${this.getBaseUrl()}${normalized}`;

    try {
      const response = await this.doFetch(url, options);
      if (!response.ok) {
        const body = await response.text().catch(() => '');
        throw new Error(`API Error: ${response.status} ${response.statusText} ${body ? '- ' + body : ''}`);
      }

      const ct = response.headers.get('content-type') || '';
      if (ct.includes('application/json')) return await response.json();
      return (await response.text()) as unknown as T;
    } catch (err: any) {
      console.error('API Request Error:', err);

      // If direct backend URL fails (CORS/network), retry via same-origin Next.js proxy.
      const isNetworkError = err?.name === 'TypeError' || String(err).toLowerCase().includes('failed to fetch') || err?.name === 'AbortError';
      if (isNetworkError && typeof window !== 'undefined' && isAbsolute) {
        const proxied = `/api/${API_VERSION}${normalized}`;
        try {
          const response2 = await this.doFetch(proxied, options);
          if (!response2.ok) {
            const body = await response2.text().catch(() => '');
            throw new Error(`API Error: ${response2.status} ${response2.statusText} ${body ? '- ' + body : ''}`);
          }
          const ct2 = response2.headers.get('content-type') || '';
          if (ct2.includes('application/json')) return await response2.json();
          return (await response2.text()) as unknown as T;
        } catch (err2: any) {
          if (err2?.name === 'AbortError') throw new Error('Request timed out');
          throw new Error(`Network error (original: ${String(err?.message)}; proxy retry: ${String(err2?.message)})`);
        }
      }

      if (err?.name === 'AbortError') throw new Error('Request timed out');
      throw err;
    }
  }

  private getImageUrl(imagePath?: string): string {
    if (!imagePath) return '/drone.jpg';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    const baseUrl = getApiBaseUrl();
    const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    if (baseUrl.startsWith('/')) {
      // In browser, return proxied path which Next will forward to backend
      return `${baseUrl}${path}`;
    }
    // Absolute backend base (e.g. http://localhost:3001)
    return `${baseUrl}${path}`;
  }

  async getServices(): Promise<FrontendService[]> {
    try {
      const services = await this.request<BackendService[]>('/public/services');
      return services.filter(s => s.status !== false).map(s => this.mapBackendToFrontendService(s));
    } catch (error) {
      console.error('Failed to fetch services:', error);
      return this.getFallbackServices();
    }
  }

  async getProducts(): Promise<FrontendProduct[]> {
    try {
      const products = await this.request<BackendProduct[]>('/public/products');
      return products.filter(p => p.status !== false).map(p => this.mapBackendToFrontendProduct(p));
    } catch (error) {
      console.error('Failed to fetch products:', error);
      return this.getFallbackProducts();
    }
  }

  async getCareers(): Promise<FrontendCareer[]> {
    try {
      const careers = await this.request<BackendCareer[]>('/public/careers');
      return careers.filter(c => c.status !== false).map(c => this.mapBackendToFrontendCareer(c));
    } catch (error) {
      console.error('Failed to fetch careers:', error);
      return this.getFallbackCareers();
    }
  }

  async getPosts(options?: {
    type?: ContentType;
    search?: string;
    author?: string;
    status?: boolean;
    tags?: string[];
  }): Promise<FrontendPost[]> {
    try {
      const params = new URLSearchParams();
      if (options?.type) params.append('type', options.type);
      if (options?.search) params.append('search', options.search);
      if (options?.author) params.append('author', options.author);
      if (options?.tags) params.append('tags', options.tags.join(','));

      const posts = await this.request<BackendPost[]>(`/public/posts?${params.toString()}`);
      return posts.filter(p => p.status !== false).map(p => this.mapBackendToFrontendPost(p));
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      return this.getFallbackPosts();
    }
  }

  async getPostsByType(type: ContentType): Promise<FrontendPost[]> {
    try {
      const posts = await this.request<BackendPost[]>(`/public/posts/by-type/${type}`);
      return posts.filter(p => p.status !== false).map(p => this.mapBackendToFrontendPost(p));
    } catch (error) {
      console.error(`Failed to fetch ${type} posts:`, error);
      return this.getFallbackPosts().filter(post => post.type === type);
    }
  }

  async getPost(id: string): Promise<FrontendPost | null> {
    try {
      const post = await this.request<BackendPost>(`/public/posts/${id}`);
      return this.mapBackendToFrontendPost(post);
    } catch (error) {
      console.error('Failed to fetch post:', error);
      return null;
    }
  }

  private mapBackendToFrontendService(backend: BackendService): FrontendService {
    return {
      title: backend.name,
      description: backend.description,
      image: '/drone.jpg',
    };
  }

  private mapBackendToFrontendProduct(backend: BackendProduct): FrontendProduct {
    const plainText = stripHtml(backend.description || '');
    return {
      title: backend.name,
      shortDescription: plainText.substring(0, 150) + (plainText.length > 150 ? '...' : ''),
      description: backend.description || '',
      images: [this.getImageUrl(backend.image)],
    };
  }

  private normalizeEmploymentType(type: string): FrontendCareer['type'] {
    const normalized = type.trim().toLowerCase().replace(/\s+/g, '-');
    if (normalized === 'part-time') return 'part-time';
    if (normalized === 'contract') return 'contract';
    return 'full-time';
  }

  private mapBackendToFrontendCareer(backend: BackendCareer): FrontendCareer {
    return {
      title: backend.title,
      description: backend.description,
      requirements: [],
      location: backend.location,
      type: this.normalizeEmploymentType(backend.employmentType),
      image: '/consulting.jpg',
    };
  }

  private mapBackendToFrontendPost(backend: BackendPost): FrontendPost {
    return {
      _id: backend.id,
      title: backend.title,
      content: backend.content,
      type: backend.type,
      author: backend.author,
      excerpt: backend.excerpt,
      coverImage: this.getImageUrl(backend.coverImage),
      tags: backend.tags || [],
      eventDate: backend.eventDate,
      eventLocation: backend.eventLocation,
      status: backend.status,
      views: backend.views || 0,
      createdAt: backend.createdAt || new Date().toISOString(),
      updatedAt: backend.updatedAt || backend.createdAt || new Date().toISOString(),
    };
  }

  private getFallbackServices(): FrontendService[] {
    return [
      {
        title: "Aerial Mapping and Surveying",
        description: "We provide accurate aerial mapping and surveying solutions using advanced drone technology. Our services support land assessment, construction planning, and geospatial data collection. We ensure high-resolution outputs that help clients make informed decisions efficiently.",
        image: "/drone.jpg",
      },
      {
        title: "Drone Piloting Training",
        description: "Our drone piloting training equips individuals with practical flying skills and industry knowledge. Trainees learn safety procedures, flight control, and mission planning. The program is designed for both beginners and those looking to enhance their expertise.",
        image: "/simulation.jpg",
      },
      {
        title: "Technician Training",
        description: "We offer technician training focused on drone maintenance, troubleshooting, and system management. Participants gain hands-on experience with real equipment and tools. This training prepares technicians to ensure reliable and safe drone operations.",
        image: "/consulting.jpg",
      },
      {
        title: "Drone Engineering Training",
        description: "Our drone engineering training covers design, assembly, and system integration. Students learn technical foundations behind drone technology and innovation. The course is ideal for those interested in building and improving drone systems.",
        image: "/drone.jpg",
      },
      {
        title: "Consultancy",
        description: "We provide expert consultancy services tailored to your drone-related needs. Our team supports project planning, technology selection, and operational strategy. We help organizations adopt drone solutions effectively and responsibly.",
        image: "/simulation.jpg",
      },
      {
        title: "Agricultural and Infrastructure Inspection",
        description: "Our drones enable efficient inspection of agricultural fields and infrastructure assets. We help identify issues such as crop health concerns, structural damage, or maintenance needs. This approach saves time while improving accuracy and safety.",
        image: "/consulting.jpg",
      },
      {
        title: "Customized Missions",
        description: "We design and execute customized drone missions based on specific client requirements. Whether for research, monitoring, or specialized operations, we adapt our solutions accordingly. Our team ensures precision, flexibility, and reliable results in every project.",
        image: "/drone.jpg",
      },
    ];
  }

  private getFallbackProducts(): FrontendProduct[] {
    return [
      {
        title: "Tew-k 01",
        shortDescription: "Advanced FPV drone with 3kg payload capacity and 15km range",
        description: `
          <h2 class="text-2xl font-semibold text-[color:var(--primary)] mb-4">Description</h2>
          <p class="text-lg leading-7 text-[color:var(--muted)] mb-6">
            Tew K are models of our best FPV drones in field. They are capable of precise hovering and high maneuverability, making them suitable for accurate attacks. The Tew K have been well tested, and their performance is assured for different purposes.
          </p>
          
          <h3 class="text-xl font-semibold text-[color:var(--primary)] mb-3">Tew k 01</h3>
          <div class="space-y-2 text-lg text-[color:var(--muted)] mb-6">
            <p><strong>Total empty weight:</strong> 3 kg</p>
            <p><strong>Payload weight:</strong> 2 kg</p>
            <p><strong>Power system:</strong> Battery power system</p>
            <p><strong>Altitude climb:</strong> 3500 m</p>
            <p><strong>Range:</strong> 15 km with a supported signal</p>
            <p><strong>Endurance time:</strong> 15 min</p>
          </div>
          
          <h3 class="text-xl font-semibold text-[color:var(--primary)] mb-3">Application:</h3>
          <p class="text-lg text-[color:var(--muted)]">
            Defense and security
          </p>
        `,
        images: ["/website_images/10 inch Tew-k 01.jpg", "/website_images/10 inch Tew-k 01.jpg", "/website_images/10 inch Tew-k 01.jpg", "/website_images/10 inch Tew-k 01.jpg"],
      },
      {
        title: "Tew-k 02",
        shortDescription: "Enhanced FPV drone with 4kg payload capacity and 20km range",
        description: `
          <h2 class="text-2xl font-semibold text-[color:var(--primary)] mb-4">Description</h2>
          <p class="text-lg leading-7 text-[color:var(--muted)] mb-6">
            Tew K are models of our best FPV drones in field. They are capable of precise hovering and high maneuverability, making them suitable for accurate attacks. The Tew K have been well tested, and their performance is assured for different purposes.
          </p>
          
          <h3 class="text-xl font-semibold text-[color:var(--primary)] mb-3">Tew k 02</h3>
          <div class="space-y-2 text-lg text-[color:var(--muted)] mb-6">
            <p><strong>Total empty weight:</strong> 5 kg</p>
            <p><strong>Payload weight:</strong> 4 kg</p>
            <p><strong>Power system:</strong> Battery power system</p>
            <p><strong>Altitude climb:</strong> 3500 m</p>
            <p><strong>Range:</strong> 20 km with a supported signal</p>
            <p><strong>Endurance time:</strong> 30 min</p>
          </div>
          
          <h3 class="text-xl font-semibold text-[color:var(--primary)] mb-3">Application:</h3>
          <p class="text-lg text-[color:var(--muted)]">
            Defense and security
          </p>
        `,
        images: ["/website_images/10 inch Tew-k 02.jpg", "/website_images/10 inch Tew-k 02.jpg", "/website_images/10 inch Tew-k 02.jpg", "/website_images/10 inch Tew-k 02.jpg"],
      },
      {
        title: "SR (Surveillance)",
        shortDescription: "High-altitude surveillance drone with 40x optical zoom and thermal imaging",
        description: `
          <h2 class="text-2xl font-semibold text-[color:var(--primary)] mb-4">Description</h2>
          <p class="text-lg leading-7 text-[color:var(--muted)] mb-6">
            SR is a sophisticated aerial vehicle, proudly designed and manufactured by Skywin Aeronautics. Equipped with a high-precision camera, it thrives in high-altitude environments, capable of climbing up to 4,000 meters with ease. Primarily built for surveillance, SR excels at scouting hostile zones and tracking moving objects with unwavering accuracy.
          </p>
          
          <h3 class="text-xl font-semibold text-[color:var(--primary)] mb-3">Specifications</h3>
          <div class="space-y-2 text-lg text-[color:var(--muted)] mb-6">
            <p><strong>Total empty weight:</strong> 50 kg</p>
            <p><strong>Payload weight:</strong> 5 kg</p>
            <p><strong>Power system:</strong> Battery power system</p>
            <p><strong>Altitude climb:</strong> 4000 m</p>
            <p><strong>Range:</strong> 30 km</p>
            <p><strong>Endurance time:</strong> 50 min @ 4000 m alt</p>
            <p><strong>All weather flight capability</strong></p>
            <p><strong>Integrated with high precision camera with optical zoom up to 40x & IR thermal night vision</strong></p>
            <p><strong>Laser rangefinder:</strong> up to 3000 m</p>
          </div>
          
          <h3 class="text-xl font-semibold text-[color:var(--primary)] mb-3">Suitable for</h3>
          <div class="space-y-1 text-lg text-[color:var(--muted)] mb-6">
            <p>Defense and Security service</p>
            <p>Surveillance and reconnaissance</p>
            <p>Target tracking and security surveillance</p>
            <p>Support for other drones</p>
          </div>
        `,
        images: ["/website_images/Survaillance.jpg", "/website_images/Survaillance(2).jpg", "/website_images/Survaillance.jpg", "/website_images/Survaillance(2).jpg"],
      },
      {
        title: "Mebrek",
        shortDescription: "Heavy lift quadcopter with 20kg payload capacity and advanced surveillance systems",
        description: `
          <h2 class="text-2xl font-semibold text-[color:var(--primary)] mb-4">Description</h2>
          <p class="text-lg leading-7 text-[color:var(--muted)] mb-6">
            Mebrek is one of our biggest aerial vehicles proudly designed, tested, and expertly manufactured entirely in Skywin Aeronautics. Integrated with state-of-the-art equipment, it conquers most hostile environments while soaring to altitudes of 4,000 meters above sea level with unshakable stability. Whether integrating payloads, delivering critical cargo, or executing stealthy scouting missions, Mebrek adapts seamlessly to virtually any role you imagine.
          </p>
          
          <h3 class="text-xl font-semibold text-[color:var(--primary)] mb-3">Specifications</h3>
          <div class="space-y-2 text-lg text-[color:var(--muted)] mb-6">
            <p><strong>Total empty weight:</strong> 150 kg</p>
            <p><strong>Payload weight:</strong> 20 kg</p>
            <p><strong>Power system:</strong> Battery power system</p>
            <p><strong>Altitude climb:</strong> 4000 m</p>
            <p><strong>Range:</strong> 25 km</p>
            <p><strong>Endurance time:</strong> 50 min @ 4000 m alt</p>
            <p><strong>All weather flight capability</strong></p>
            <p><strong>Integrated with high precision camera with optical zoom up to 40x & IR thermal night vision</strong></p>
            <p><strong>Laser rangefinder:</strong> up to 2500 m</p>
          </div>
          
          <h3 class="text-xl font-semibold text-[color:var(--primary)] mb-3">Suitable for</h3>
          <div class="space-y-1 text-lg text-[color:var(--muted)] mb-6">
            <p>Defense and Security service</p>
            <p>Surveillance and reconnaissance</p>
            <p>Target tracking and security surveillance</p>
            <p>Large payload delivery</p>
            <p>Firefighting payload and reconnaissance</p>
          </div>
        `,
        images: ["/website_images/Heavy lift quadcopter.jpg", "/website_images/Heavy lift quadcopter (2).jpg", "/website_images/Heavy lift quadcopter.jpg", "/website_images/Heavy lift quadcopter (2).jpg"],
      },
      {
        title: "Battery Packs",
        shortDescription: "Custom engineered battery packs for any specification from low-energy to high-power applications",
        description: `
          <h2 class="text-2xl font-semibold text-[color:var(--primary)] mb-4">Description</h2>
          <p class="text-lg leading-7 text-[color:var(--muted)] mb-6">
            Here at Skywin Aeronautics, we don't just build drones, we engineer custom battery packs in any specification you demand. From low-energy applications to most power-devouring machines. Every cell we use is tested, fully certified, and renowned for an exceptional energy density delivering maximum power without the penalty of bulk. Whether you need a compact, lightweight pack or a massive energy beast, we tailor each battery precisely to your specifications, from smallest to largest.
          </p>
        `,
        images: ["/drone.jpg", "/drone.jpg", "/drone.jpg", "/drone.jpg"],
      },
      {
        title: "Vtol SW-01",
        shortDescription: "Largest VTOL vehicle with AI-integrated system and 30kg payload capacity",
        description: `
          <h2 class="text-2xl font-semibold text-[color:var(--primary)] mb-4">Description</h2>
          <p class="text-lg leading-7 text-[color:var(--muted)] mb-6">
            SW-01 is our largest VTOL vehicle proudly designed and manufactured here at Skywin Aeronautics. Equipped with cutting-edge equipment and an AI-integrated system, its performance is remarkable in whether tackling the most demanding missions or enduring brutally harsh environments, SW-01 stands unshaken. Thanks to its sustained energy efficiency, it achieves seamless vertical takeoff and landing while delivering exceptional endurance when every second in the sky counts.
          </p>
          
          <h3 class="text-xl font-semibold text-[color:var(--primary)] mb-3">Specifications</h3>
          <div class="space-y-2 text-lg text-[color:var(--muted)] mb-6">
            <p><strong>Total empty weight:</strong> 60 kg</p>
            <p><strong>Payload weight:</strong> 30 kg</p>
            <p><strong>Power system:</strong> Hybrid system</p>
            <p><strong>Altitude climb:</strong> 4500 m - 5000 m</p>
            <p><strong>Range:</strong> 100 km</p>
            <p><strong>Endurance time:</strong> 5 - 7 hrs</p>
            <p><strong>Cruise speed:</strong> 100 km/ hr - 120 km/ hr</p>
          </div>
          
          <h3 class="text-xl font-semibold text-[color:var(--primary)] mb-3">Payload with integrated high precision camera and ER sensors ideal for</h3>
          <div class="space-y-1 text-lg text-[color:var(--muted)] mb-6">
            <p>Mapping and Surveillance</p>
            <p>Boarder monitoring</p>
            <p>Targeted reconnaissance and Tracking capability</p>
            <p>Defense and Security</p>
          </div>
        `,
        images: ["/website_images/vtol3.png", "/website_images/vtol1.png", "/website_images/vtol2.png", "/website_images/vtol3.png"],
      },
    ];
  }

  private getFallbackCareers(): FrontendCareer[] {
    return [
      {
        title: "Senior Drone Pilot",
        description: "We are seeking an experienced drone pilot to join our operations team. The ideal candidate will have extensive experience in commercial drone operations and hold relevant certifications.",
        requirements: [
          "Commercial Drone Pilot License",
          "3+ years of commercial drone experience",
          "Experience with various drone platforms",
          "Strong understanding of aviation regulations",
          "Excellent communication skills"
        ],
        location: "Addis Ababa, Ethiopia",
        type: "full-time",
        image: "/consulting.jpg",
      },
      {
        title: "Drone Engineer",
        description: "Join our engineering team to design and develop cutting-edge drone systems. You will work on both hardware and software aspects of drone development.",
        requirements: [
          "Bachelor's degree in Engineering or related field",
          "Experience with drone hardware design",
          "Programming skills (Python, C++, Arduino)",
          "Knowledge of flight control systems",
          "Problem-solving abilities"
        ],
        location: "Addis Ababa, Ethiopia",
        type: "full-time",
        image: "/drone.jpg",
      },
      {
        title: "Aerial Survey Specialist",
        description: "We are looking for a specialist in aerial surveying and mapping to support our data collection services. Experience with photogrammetry and GIS is essential.",
        requirements: [
          "Degree in Geography, Surveying, or related field",
          "Experience with aerial photogrammetry",
          "GIS software proficiency",
          "Data analysis skills",
          "Attention to detail"
        ],
        location: "Addis Ababa, Ethiopia",
        type: "full-time",
        image: "/simulation.jpg",
      },
    ];
  }

  private getFallbackPosts(): FrontendPost[] {
    return [
      {
        _id: '1',
        title: "Skywin Aeronautics Launches New Drone Training Program",
        content: "We are excited to announce our comprehensive drone training program designed to equip the next generation of aerospace professionals with cutting-edge skills and knowledge.",
        type: ContentType.NEWS,
        author: "Skywin Team",
        excerpt: "New training program launched to develop drone piloting and engineering expertise.",
        coverImage: "/drone.jpg",
        tags: ["training", "education", "drones"],
        status: true,
        views: 1250,
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: "2024-01-15T10:00:00Z",
      },
      {
        _id: '2',
        title: "The Future of Drone Technology in Agriculture",
        content: "Exploring how drone technology is revolutionizing agricultural practices and improving crop management efficiency.",
        type: ContentType.BLOG,
        author: "Dr. John Smith",
        excerpt: "Discover the transformative impact of drones on modern agriculture and farming practices.",
        coverImage: "/consulting.jpg",
        tags: ["agriculture", "drones", "innovation"],
        status: true,
        views: 890,
        createdAt: "2024-01-10T14:30:00Z",
        updatedAt: "2024-01-10T14:30:00Z",
      },
      {
        _id: '3',
        title: "Skywin Annual Drone Expo 2024",
        content: "Join us for our annual drone expo showcasing the latest innovations in drone technology and aerospace engineering.",
        type: ContentType.EVENT,
        author: "Skywin Events Team",
        excerpt: "Annual drone expo featuring latest innovations and networking opportunities.",
        coverImage: "/simulation.jpg",
        tags: ["event", "expo", "networking"],
        eventDate: new Date("2024-03-15T09:00:00Z"),
        eventLocation: "Addis Ababa, Ethiopia",
        status: true,
        views: 2100,
        createdAt: "2024-01-05T12:00:00Z",
        updatedAt: "2024-01-05T12:00:00Z",
      },
    ];
  }
}

export const apiClient = new ApiClient();

export const getServices = () => apiClient.getServices();
export const getProducts = () => apiClient.getProducts();
export const getCareers = () => apiClient.getCareers();
export const getPosts = (options?: {
  type?: ContentType;
  search?: string;
  author?: string;
  status?: boolean;
  tags?: string[];
}) => apiClient.getPosts(options);
export const getPostsByType = (type: ContentType) => apiClient.getPostsByType(type);
export const getPost = (id: string) => apiClient.getPost(id);

export type { FrontendService, FrontendProduct, FrontendCareer, FrontendPost, ContentType };