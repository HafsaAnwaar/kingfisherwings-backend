#!/bin/sh
set -e

echo "[entrypoint] Running prisma migrate deploy..."
npx prisma migrate deploy

echo "[entrypoint] Chromium check: $(command -v chromium || echo MISSING)"
echo "[entrypoint] PUPPETEER_EXECUTABLE_PATH=${PUPPETEER_EXECUTABLE_PATH}"

echo "[entrypoint] Starting NestJS..."
exec node dist/src/main.js
