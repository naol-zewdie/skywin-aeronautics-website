# Skywin Aeronautics

A modern aerospace company management system with a Next.js admin dashboard and NestJS backend API.

## Project Structure

```
skywin-aeronautics-website/
├── frontend/          # Next.js 14 public website (company site)
│   ├── app/          # Next.js app router
│   ├── components/   # React components
│   └── package.json  # Frontend dependencies
│
├── admin/            # Next.js 14 Admin Dashboard
│   ├── app/          # Dashboard pages
│   ├── components/   # UI components (shadcn/ui)
│   ├── contexts/     # React contexts (auth, toast)
│   ├── lib/          # API client, utilities
│   └── package.json  # Admin dependencies
│
├── server/           # NestJS 11 backend API
│   ├── src/         # Source code
│   │   ├── modules/ # Feature modules
│   │   │   ├── auth/        # JWT authentication
│   │   │   ├── users/       # User management
│   │   │   ├── products/    # Product catalog
│   │   │   ├── services/    # Services catalog
│   │   │   ├── careers/     # Job openings
│   │   │   ├── notifications/ # Notification system
│   │   │   ├── upload/        # File upload
│   │   │   └── activity/      # Activity logging
│   ├── dist/        # Compiled output
│   ├── test/        # Test files
│   └── package.json # Backend dependencies
│
└── .env.example     # Environment variables template
```

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### 1. Install Dependencies

```bash
# Backend
cd server
npm install

# Admin Dashboard (in a new terminal)
cd admin
npm install
```

### 2. Environment Setup

Copy the example env file and configure your settings:

```bash
cd server
cp .env.example .env
```

Edit `.env` with your values:
```env
# MongoDB Atlas (recommended for production)
DATABASE_URL=mongodb+srv://dbuser:YOUR_PASSWORD@cluster0.efzbkhn.mongodb.net/skywin?retryWrites=true&w=majority
ENABLE_DB=true

# OR Local MongoDB (for development)
# DATABASE_URL=mongodb://localhost:27017/skywin

# JWT Secret (change in production!)
JWT_SECRET=skywin-super-secret-jwt-key-2024-secure

# CORS (your frontend URL)
CORS_ORIGIN=http://localhost:3003
```

### 3. Run the Application

```bash
# Start Backend (http://localhost:3001)
cd server
npm run start:dev

# Start Admin Dashboard (http://localhost:3003) - in new terminal
cd admin
npm run dev
```

### 4. Access the Application

| Service | URL | Credentials |
|---------|-----|-------------|
| **Admin Dashboard** | http://localhost:3003 | `admin@skywin.aero` / `admin123` |
| **Backend API** | http://localhost:3001 | - |
| **API Documentation** | http://localhost:3001/swagger | - |

## Features

### Core Features
- **Authentication**: JWT-based auth with role-based access (admin, it, hr)
- **User Management**: CRUD operations with password hashing
- **Product Catalog**: Manage aerospace products with search, filters, CSV export
- **Services**: Manage company services
- **Careers**: Job posting and management

### Advanced Features
- **Notifications**: Real-time notification system for events
- **File Upload**: Image upload for products (5MB limit)
- **Advanced Search**: Multi-field search with filters (category, price range, status)
- **Data Export**: Export products to CSV
- **Activity Logging**: Track all system actions with statistics dashboard
- **Responsive UI**: Modern dashboard with Tailwind CSS + shadcn/ui

### API Endpoints

| Endpoint | Description |
|----------|-------------|
| `POST /auth/login` | User authentication |
| `GET /auth/me` | Get current user |
| `GET /products?search=&category=&minPrice=&maxPrice=` | List products with filters |
| `GET /products/export/csv` | Export products to CSV |
| `POST /upload/image` | Upload image files |
| `GET /notifications/unread` | Get unread notifications |
| `GET /activity/stats` | Get activity statistics |

## Testing

```bash
cd server

# Run unit tests (79 tests)
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run e2e tests
npm run test:e2e
```

## Tech Stack

### Backend
- **Framework**: NestJS 11
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT + Passport
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest + Supertest
- **File Upload**: Multer

### Admin Dashboard
- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18 + Tailwind CSS
- **Components**: shadcn/ui
- **Icons**: Lucide React
- **State**: React Context (Auth, Toast)
- **HTTP Client**: Axios

### Public Website
- **Framework**: Next.js 14
- **Styling**: CSS Modules

## Deployment

### Using Docker

```bash
cd server
docker-compose up
```

### Environment Variables for Production

```env
NODE_ENV=production
PORT=3001
DATABASE_URL=mongodb+srv://...
ENABLE_DB=true
JWT_SECRET=your-secure-secret-here
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://your-domain.com
```

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@skywin.aero | admin123 |
| IT | rohan@skywin.aero | rohan123 |
| HR | priya@skywin.aero | priya123 |

## Project Status

- ✅ Backend API (100% - 79 tests passing)
- ✅ Admin Dashboard (100% - all features working)
- ✅ Authentication & Authorization
- ✅ Product/Service/Career Management
- ✅ Notifications System
- ✅ File Upload
- ✅ Advanced Search & Filters
- ✅ Activity Logging
- ✅ CSV Export

## License

MIT
