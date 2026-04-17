# Skywin Aeronautics

Skywin Aeronautics project with Next.js frontend and NestJS backend.

## Project Structure

```
skywin-aeronautics-website/
├── frontend/          # Next.js 16 frontend application
│   ├── app/          # Next.js app router
│   ├── public/       # Static assets
│   └── package.json  # Frontend dependencies
│
├── server/           # NestJS 11 backend API
│   ├── src/         # Source code
│   ├── dist/        # Compiled output
│   ├── Dockerfile   # Docker configuration
│   └── package.json # Backend dependencies
│
├── .env.example      # Environment variables template
└── .gitignore       # Git ignore rules
```

## Getting Started

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:3000

### Server

```bash
cd server
npm install
npm run start:dev
```

API runs on http://localhost:3000

### Using Docker

```bash
cd server
docker-compose up
```

## Environment Variables

Copy `.env.example` to `.env.local` (frontend) and `.env` (server) and fill in your values.

## Tech Stack

- **Frontend**: Next.js 16, React 19, TailwindCSS 4, TypeScript
- **Backend**: NestJS 11, TypeORM, PostgreSQL, Swagger
