FROM node:20-alpine AS base

# ─── Stage 1: Install dependencies ───────────────────────────────────────────
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# ─── Stage 2: Build ──────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Pass in the build arg for NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build
# next.config.ts has output:"standalone", so the build emits:
#   .next/standalone/          ← self-contained Node server + minimal node_modules
#   .next/static/              ← pre-built static assets (JS chunks, CSS, images)
#   public/                    ← public directory assets

# ─── Stage 3: Production runner ──────────────────────────────────────────────
# Only the standalone bundle is copied — no npm, no full node_modules tree.
# Final image is typically 3–5× smaller than a naive `COPY . .` approach.
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Static assets served directly by the embedded server
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Pre-built static chunks (JS/CSS) — served from /_next/static/
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# The standalone bundle: node server.js + minimal node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Use node directly — no npm needed in the runner image
CMD ["node", "server.js"]
