# Dockerfile  (production — Render / Docker)
FROM node:20-alpine AS builder

RUN apk add --no-cache python3 make g++ openssl

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./

# Prisma 7 config requires DATABASE_URL at generate time (not used to connect).
ENV DATABASE_URL="postgresql://build:build@127.0.0.1:5432/build"
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

# ── Production stage ──────────────────────────────────────────
FROM node:20-alpine AS production

RUN apk add --no-cache \
    openssl \
    dumb-init \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    font-noto-emoji

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
# Alpine chromium package installs as /usr/bin/chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV PUPPETEER_TIMEOUT=60000
ENV NODE_ENV=production
ENV STORAGE_PATH=/app/storage/uploads
ENV STORAGE_PUBLIC_BASE_URL=/files

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nestjs

COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./
COPY --from=builder --chown=nestjs:nodejs /app/prisma.config.ts ./prisma.config.ts

RUN if [ ! -x /usr/bin/chromium ] && [ -x /usr/bin/chromium-browser ]; then \
      ln -sf /usr/bin/chromium-browser /usr/bin/chromium; \
    fi && \
    mkdir -p /app/storage/uploads && chown -R nestjs:nodejs /app/storage && \
    test -x /usr/bin/chromium

# Apply migrations then start (DATABASE_URL must be set at runtime by host/Render)
COPY --chown=nestjs:nodejs docker/entrypoint.sh /app/entrypoint.sh
# Strip Windows CRLF if present — otherwise Linux reports "Exec format error"
RUN sed -i 's/\r$//' /app/entrypoint.sh && chmod +x /app/entrypoint.sh

USER nestjs

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]
# Invoke via sh so a bad shebang never blocks boot
CMD ["/bin/sh", "/app/entrypoint.sh"]
