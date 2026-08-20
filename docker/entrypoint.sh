#!/bin/sh
set -e

# Prisma Migrate needs a direct Postgres session (pg_advisory_lock). Neon's *-pooler*
# host cannot acquire it → P1002. Use DIRECT_URL, or derive by stripping "-pooler".
resolve_migrate_database_url() {
  if [ -n "$DIRECT_URL" ]; then
    printf '%s' "$DIRECT_URL"
    return
  fi
  if [ -z "$DATABASE_URL" ]; then
    echo "[entrypoint] ERROR: DATABASE_URL is not set" >&2
    exit 1
  fi
  case "$DATABASE_URL" in
    *-pooler*) printf '%s' "$(printf '%s' "$DATABASE_URL" | sed 's/-pooler//')" ;;
    *) printf '%s' "$DATABASE_URL" ;;
  esac
}

sanitize_pg_url() {
  # channel_binding=require is libpq-only and can break node/pg + Prisma CLI on Alpine.
  printf '%s' "$1" | sed 's/[?&]channel_binding=[^&]*//g' | sed 's/?&/?/' | sed 's/[?&]$//'
}

run_migrate_deploy() {
  raw_url="$(resolve_migrate_database_url)"
  migrate_url="$(sanitize_pg_url "$raw_url")"

  echo "[entrypoint] migrate target host: $(printf '%s' "$migrate_url" | sed -E 's|^[^@]+@([^/:?]+).*|\1|')"

  attempt=1
  max_attempts="${PRISMA_MIGRATE_MAX_ATTEMPTS:-5}"
  while [ "$attempt" -le "$max_attempts" ]; do
    echo "[entrypoint] Running prisma migrate deploy (attempt ${attempt}/${max_attempts})..."
    if DATABASE_URL="$migrate_url" npx prisma migrate deploy; then
      echo "[entrypoint] Migrations applied."
      return 0
    fi
    if [ "$attempt" -eq "$max_attempts" ]; then
      echo "[entrypoint] ERROR: prisma migrate deploy failed after ${max_attempts} attempts." >&2
      echo "[entrypoint] Set DIRECT_URL on Render (Neon direct host, no -pooler) if this persists." >&2
      return 1
    fi
    delay=$((attempt * 5))
    echo "[entrypoint] Migrate failed — retrying in ${delay}s (Neon wake / advisory lock)..."
    sleep "$delay"
    attempt=$((attempt + 1))
  done
}

run_migrate_deploy

echo "[entrypoint] Chromium check: $(command -v chromium || echo MISSING)"
echo "[entrypoint] PUPPETEER_EXECUTABLE_PATH=${PUPPETEER_EXECUTABLE_PATH}"

echo "[entrypoint] Starting NestJS..."
exec node dist/src/main.js
