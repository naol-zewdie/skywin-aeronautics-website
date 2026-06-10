# Skywin Admin Dashboard

A modern, scalable admin dashboard for Skywin Aeronautics built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- **Authentication**: JWT-based auth with role-based access control
- **Dashboard**: Real-time statistics and activity feed
- **CRUD Operations**: Full management of users, products, services, and careers
- **Responsive Design**: Works on desktop and mobile devices
- **Type Safety**: Fully typed with TypeScript

## Tech Stack

- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Radix UI (shadcn-style components)
- Axios (API client)
- Zod (validation)
- React Hook Form

## Getting Started

### Prerequisites

- Node.js 18+
- Backend API running on `http://localhost:3001`

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

The dashboard will be available at `http://localhost:3002`

### Default Login

- Email: `admin@skywin.aero`
- Password: `admin123`

## Project Structure

```
admin/
├── app/                    # Next.js App Router
│   ├── (dashboard)/        # Protected routes group
│   │   ├── dashboard/      # Dashboard home
│   │   ├── products/       # Product management
│   │   ├── services/       # Service management
│   │   ├── careers/        # Career management
│   │   ├── users/          # User management
│   │   ├── settings/       # System settings
│   │   └── layout.tsx      # Dashboard layout
│   ├── login/              # Login page
│   ├── layout.tsx          # Root layout
│   └── globals.css         # Global styles
├── components/
│   ├── ui/                 # Reusable UI components
│   └── layout/             # Layout components
├── contexts/
│   └── AuthContext.tsx     # Authentication context
├── hooks/
│   └── use-toast.ts        # Toast notifications
├── lib/
│   ├── api.ts              # API client
│   └── utils.ts            # Utility functions
├── types/
│   └── index.ts            # TypeScript types
└── public/                 # Static assets
```

## Role-Based Access

| Role | Access |
|------|--------|
| Admin | Full access to all features |
| IT | Products, Services, Dashboard |
| HR | Careers, Dashboard |
| Viewer | Dashboard only (read-only) |

## API Integration

The dashboard connects to the backend API at `http://localhost:3001`. See the API documentation in the `server` folder for endpoint details.

## Building for Production

```bash
npm run build
npm run start
```

## Development

### Code Style

- Follow the existing component patterns
- Use TypeScript strictly
- Components should be reusable and composable
- Use the `cn()` utility for class merging

### Adding New Pages

1. Create a new folder in `app/(dashboard)/`
2. Add `page.tsx` with the page component
3. Update `sidebar.tsx` if navigation is needed
4. Add API functions in `lib/api.ts` if needed

### Adding New Components

1. Create the component in `components/ui/`
2. Follow the existing component structure
3. Export from the file
4. Use in pages as needed
