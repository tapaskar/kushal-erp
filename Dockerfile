# Stage 1: Install dependencies (Debian-based so @next/swc-linux-x64-gnu works)
FROM node:20-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# Stage 2: Build application (Debian-based for Turbopack/SWC native binaries)
FROM node:20-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Disable Next.js telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Stage 3: Production runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public assets
COPY --from=builder /app/public ./public

# Copy standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy drizzle migration files + runner script
COPY --from=builder --chown=nextjs:nodejs /app/drizzle ./drizzle
COPY --from=builder --chown=nextjs:nodejs /app/migrate.mjs ./migrate.mjs

# Copy seed files (for one-off seeding via run-task)
COPY --from=builder --chown=nextjs:nodejs /app/seed-prod.mjs ./seed-prod.mjs
COPY --from=builder --chown=nextjs:nodejs /app/seed-staff-security-housekeeping.sql ./seed-staff-security-housekeeping.sql

# Copy full postgres package from builder so migrate.mjs can import it (standalone only has partial ESM)
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/postgres ./node_modules/postgres

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Run migrations then start the Next.js server
CMD ["sh", "-c", "node migrate.mjs && node server.js"]
