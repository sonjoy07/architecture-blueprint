# ==============================================================================
# Multi-Stage Production Dockerfile: apps/web (Next.js 15 Standalone)
# Base: Alpine Linux (Node.js 20 LTS)
# Footprint: Optimized < 150MB via Next.js Standalone Output
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Base Alpine Environment
# ------------------------------------------------------------------------------
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat dumb-init
WORKDIR /app

# ------------------------------------------------------------------------------
# Stage 2: Install Dependencies
# ------------------------------------------------------------------------------
FROM base AS deps
COPY package*.json ./
RUN npm ci

# ------------------------------------------------------------------------------
# Stage 3: Build Standalone Bundle
# ------------------------------------------------------------------------------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production

RUN npm run build

# ------------------------------------------------------------------------------
# Stage 4: Minimal Production Runner
# ------------------------------------------------------------------------------
FROM base AS runner

ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME="0.0.0.0" \
    NEXT_TELEMETRY_DISABLED=1

# Create unprivileged system group & user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

WORKDIR /app

# Copy public assets and standalone output
COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER 1001:1001

EXPOSE 3000

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "server.js"]
