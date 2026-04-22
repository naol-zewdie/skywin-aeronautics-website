# Skywin Aeronautics - Frontend/Backend Architecture Plan

## Overview
- **Public Frontend**: Marketing website for customers, partners, job seekers
- **Admin Portal**: Protected dashboard for admin/IT staff only
- **Backend API**: Secured with JWT authentication, role-based access

---

## 1. FRONTEND ARCHITECTURE

### A. Public Marketing Site (`/frontend` - Next.js App Router)

```
frontend/
├── app/                          # Next.js App Router
│   ├── (marketing)/             # Marketing route group
│   │   ├── page.tsx             # Homepage
│   │   ├── about/
│   │   │   └── page.tsx         # Company overview
│   │   ├── products/
│   │   │   ├── page.tsx         # Product catalog (public view)
│   │   │   └── [slug]/
│   │   │       └── page.tsx     # Individual product page
│   │   ├── services/
│   │   │   └── page.tsx         # Services overview
│   │   ├── careers/
│   │   │   ├── page.tsx         # Job listings (public)
│   │   │   └── apply/
│   │   │       └── page.tsx     # Job application form
│   │   ├── contact/
│   │   │   └── page.tsx         # Contact form
│   │   ├── certifications/
│   │   │   └── page.tsx         # Quality certs
│   │   └── layout.tsx           # Marketing layout (navbar, footer)
│   │
│   ├── (admin)/                 # Admin route group (protected)
│   │   ├── login/
│   │   │   └── page.tsx         # Admin login
│   │   ├── dashboard/
│   │   │   └── page.tsx         # Admin dashboard
│   │   ├── users/
│   │   │   ├── page.tsx         # User management
│   │   │   └── [id]/
│   │   │       └── page.tsx     # Edit user
│   │   ├── products/
│   │   │   ├── page.tsx         # Product management (CRUD)
│   │   │   └── [id]/
│   │   │       └── page.tsx     # Edit product
│   │   ├── services/
│   │   │   └── page.tsx         # Service management
│   │   ├── careers/
│   │   │   ├── page.tsx         # Job opening management
│   │   │   └── applications/
│   │   │       └── page.tsx     # View applications
│   │   ├── settings/
│   │   │   └── page.tsx         # System settings
│   │   └── layout.tsx           # Admin layout (sidebar, header)
│   │
   ├── api/                       # Next.js API routes (for auth)
│   │   ├── auth/
│   │   │   ├── login/route.ts   # Login handler
│   │   │   ├── logout/route.ts  # Logout handler
│   │   │   └── me/route.ts      # Current user
│   │   └── contact/route.ts     # Public contact form
│   │
│   └── layout.tsx               # Root layout
│
├── components/
│   ├── marketing/               # Public site components
│   │   ├── Navbar.tsx
│   │   ├── Hero.tsx
│   │   ├── ProductCard.tsx
│   │   ├── ServiceCard.tsx
│   │   ├── JobListing.tsx
│   │   ├── ContactForm.tsx
│   │   └── Footer.tsx
│   │
│   ├── admin/                   # Admin portal components
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   ├── StatCard.tsx
│   │   ├── DataTable.tsx
│   │   ├── ProductForm.tsx
│   │   ├── UserForm.tsx
│   │   ├── JobForm.tsx
│   │   └── DeleteConfirmModal.tsx
│   │
│   └── shared/                  # Shared components
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── LoadingSpinner.tsx
│       └── ErrorBoundary.tsx
│
├── lib/
│   ├── api/                     # API clients
│   │   ├── public.ts            # Public API calls (no auth)
│   │   └── admin.ts             # Admin API calls (with auth)
│   │
│   ├── auth/                    # Authentication
│   │   ├── AuthContext.tsx      # React context for auth state
│   │   ├── useAuth.ts           # Auth hook
│   │   ├── requireAuth.ts       # HOC for protected routes
│   │   └── auth-utils.ts        # Token handling
│   │
│   ├── utils/
│   │   └── validators.ts        # Client-side validation
│   │
│   └── constants.ts             # App constants
│
├── hooks/
│   ├── useProducts.ts           # Fetch products (public)
│   ├── useServices.ts           # Fetch services (public)
│   ├── useCareers.ts            # Fetch careers (public)
│   └── useAdminData.ts          # Fetch admin data (protected)
│
├── types/
│   ├── public.ts                # Public DTO types
│   └── admin.ts                 # Admin types
│
└── middleware.ts                # Route protection middleware
```

---

## 2. AUTHENTICATION FLOW

### Login Flow
```
1. Admin visits /admin/login
2. Enters credentials (email + password)
3. Frontend POST /api/auth/login → Backend /auth/login
4. Backend validates, returns JWT + user data
5. Frontend stores JWT in httpOnly cookie
6. Redirect to /admin/dashboard
```

### Protected Route Middleware
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token');
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isLoginPage = request.nextUrl.pathname === '/admin/login';

  if (isAdminRoute && !isLoginPage && !token) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  if (isLoginPage && token) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  return NextResponse.next();
}
```

---

## 3. PAGE DETAILS

### Public Marketing Pages

| Page | Purpose | Data Source |
|------|---------|-------------|
| `/` | Hero, company intro, featured products | Static + CMS |
| `/about` | Company history, mission, team | Static |
| `/products` | Product catalog with filters | `GET /products` (public endpoint) |
| `/products/[slug]` | Product details, specs | `GET /products/:id` |
| `/services` | Services grid | `GET /services` |
| `/careers` | Active job listings | `GET /careers` (only status=true) |
| `/careers/apply` | Job application form | `POST /applications` |
| `/contact` | Contact form | `POST /api/contact` |
| `/certifications` | ISO certs, quality standards | Static |

### Admin Portal Pages

| Page | Purpose | Required Role |
|------|---------|---------------|
| `/admin/login` | Login form | None |
| `/admin/dashboard` | Stats, recent activity | admin, it |
| `/admin/users` | CRUD users | admin |
| `/admin/users/[id]` | Edit user | admin |
| `/admin/products` | CRUD products | admin, it |
| `/admin/products/[id]` | Edit product | admin, it |
| `/admin/services` | CRUD services | admin, it |
| `/admin/careers` | CRUD job openings | admin, hr |
| `/admin/careers/applications` | View applications | admin, hr |
| `/admin/settings` | System config | admin |

---

## 4. API SECURITY STRATEGY

### Backend Route Protection
```typescript
// All admin routes require JWT + role check
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  
  @Get('users')
  @Roles('admin')  // Only admin
  findAllUsers() {}

  @Get('products')
  @Roles('admin', 'it')  // Admin or IT
  findAllProducts() {}
}
```

### Public vs Protected Endpoints
```
PUBLIC (no auth):
  GET  /products           - List products
  GET  /products/:id       - Product details
  GET  /services           - List services
  GET  /careers            - Active job listings
  POST /contact            - Submit contact form
  POST /applications       - Submit job application

PROTECTED (JWT + roles):
  POST   /auth/login       - Login
  GET    /auth/me          - Current user
  
  GET    /admin/users      - List all users (admin)
  POST   /admin/users      - Create user (admin)
  PATCH  /admin/users/:id   - Update user (admin)
  DELETE /admin/users/:id   - Delete user (admin)
  
  POST   /products         - Create product (admin/it)
  PATCH  /products/:id     - Update product (admin/it)
  DELETE /products/:id     - Delete product (admin/it)
  
  [Similar for services, careers, settings]
```

---

## 5. FRONTEND IMPLEMENTATION STEPS

### Phase 1: Public Marketing Site
1. Set up Next.js project structure with route groups
2. Create marketing layout (Navbar, Footer)
3. Build homepage with hero section
4. Create static pages (About, Certifications)
5. Build dynamic product catalog page
6. Build individual product detail pages
7. Create services listing page
8. Build careers listing + application form
9. Create contact form with API integration

### Phase 2: Admin Authentication
1. Create login page UI
2. Implement auth context/provider
3. Set up middleware for route protection
4. Create API routes for login/logout
5. Implement JWT storage (httpOnly cookies)
6. Create "require auth" HOC

### Phase 3: Admin Dashboard
1. Create admin layout (sidebar + header)
2. Build dashboard home with stats
3. Create reusable DataTable component
4. Build user management pages
5. Build product CRUD pages
6. Build services CRUD pages
7. Build careers management pages
8. Add application viewer for job submissions
9. Create settings page

### Phase 4: Polish & Security
1. Add loading states
2. Error handling
3. Form validation feedback
4. Role-based UI (hide buttons based on role)
5. Audit logging in admin actions
6. Session timeout handling
7. CSRF protection

---

## 6. KEY COMPONENTS TO BUILD

### Marketing Components
```typescript
// ProductCard.tsx - Public product display
interface ProductCardProps {
  product: {
    id: string;
    name: string;
    category: string;
    description: string;
    price: number;
    image: string;
  };
}

// JobListing.tsx - Public job display
interface JobListingProps {
  job: {
    id: string;
    title: string;
    location: string;
    employmentType: string;
    description: string;
  };
}
```

### Admin Components
```typescript
// DataTable.tsx - Reusable CRUD table
interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
  canEdit: boolean;      // Role-based
  canDelete: boolean;   // Role-based
}

// ProductForm.tsx - Admin product CRUD
interface ProductFormProps {
  product?: Product;     // Undefined = create mode
  onSubmit: (data: CreateProductDto) => void;
  onCancel: () => void;
}
```

---

## 7. DATA FLOW EXAMPLES

### Public: View Products
```
User → /products page → useProducts hook 
  → GET /api/products → Backend (public endpoint)
  → Return filtered products (status=true only)
  → Render ProductCards
```

### Admin: Edit Product
```
Admin → /admin/products → DataTable
  → Click "Edit" → Navigate to /admin/products/[id]
  → Fetch product details (JWT required)
  → Render ProductForm with data
  → Submit → PATCH /admin/products/:id (JWT + role check)
  → Backend validates role (admin/it)
  → Update product + audit log
  → Redirect back to list
```

### Public: Apply for Job
```
User → /careers → JobListing components
  → Click "Apply" → Navigate to /careers/apply
  → Fill form → Submit
  → POST /api/applications (public endpoint)
  → Backend creates application record
  → Show success message
```

---

## 8. ENVIRONMENT VARIABLES (Frontend)

```env
# Public (accessible in browser)
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_COMPANY_NAME=Skywin Aeronautics

# Private (server-only)
API_URL=http://localhost:3001
JWT_SECRET=your-jwt-secret
```

---

## Implementation Priority

1. **Week 1**: Public marketing site (homepage, about, contact)
2. **Week 2**: Public products/services pages + API integration
3. **Week 3**: Admin auth + dashboard shell
4. **Week 4**: Admin CRUD pages (users, products, services)
5. **Week 5**: Admin careers management + polish
