# ==============================================================================
# Multi-Stage Production Dockerfile: apps/api (NestJS)
# Base: Alpine Linux (Node.js 20 LTS)
# Security: Non-root user (UID 10001), read-only root filesystem compatible
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Base Alpine Environment
# ------------------------------------------------------------------------------
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat dumb-init
WORKDIR /app

# ------------------------------------------------------------------------------
# Stage 2: Development & Build Dependencies
# ------------------------------------------------------------------------------
FROM base AS dependencies
COPY package*.json ./
RUN npm ci --include=dev

# ------------------------------------------------------------------------------
# Stage 3: TypeScript Compilation & Asset Bundling
# ------------------------------------------------------------------------------
FROM base AS builder
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 4: Pruned Production Dependencies
# ------------------------------------------------------------------------------
FROM base AS prod-dependencies
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# ------------------------------------------------------------------------------
# Stage 5: Hardened Minimal Production Runner
# ------------------------------------------------------------------------------
FROM base AS runner

ENV NODE_ENV=production \
    PORT=3000

# Create dedicated non-root application user and group
RUN addgroup -g 10001 -S appgroup && \
    adduser -u 10001 -S appuser -G appgroup

WORKDIR /app

# Copy production artifacts with ownership
COPY --chown=appuser:appgroup --from=prod-dependencies /app/node_modules ./node_modules
COPY --chown=appuser:appgroup --from=builder /app/dist ./dist
COPY --chown=appuser:appgroup package.json ./

# Ensure write access to /tmp for read-only root filesystems
RUN mkdir -p /tmp && chown -R appuser:appgroup /tmp

# Switch to unprivileged non-root user
USER 10001:10001

EXPOSE 3000

# Signal handling via dumb-init prevents zombie process proliferation
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "dist/main.js"]
