#!/bin/sh
set -e

# Prisma Migrate needs a direct Postgres session. Neon's *-pooler* host cannot run
# pg_advisory_lock (P1002). Use DIRECT_URL or strip "-pooler" from DATABASE_URL.
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
  url="$1"
  url="$(printf '%s' "$url" | sed 's/[?&]channel_binding=[^&]*//g' | sed 's/?&/?/' | sed 's/[?&]$//')"
  case "$url" in
    *connect_timeout=*) printf '%s' "$url" ;;
    *\?*) printf '%s' "${url}&connect_timeout=30" ;;
    *) printf '%s' "${url}?connect_timeout=30" ;;
  esac
}

run_migrate_deploy() {
  raw_url="$(resolve_migrate_database_url)"
  migrate_url="$(sanitize_pg_url "$raw_url")"

  echo "[entrypoint] migrate target host: $(printf '%s' "$migrate_url" | sed -E 's|^[^@]+@([^/:?]+).*|\1|')"

  attempt=1
  max_attempts="${PRISMA_MIGRATE_MAX_ATTEMPTS:-3}"
  while [ "$attempt" -le "$max_attempts" ]; do
    echo "[entrypoint] Running prisma migrate deploy (attempt ${attempt}/${max_attempts})..."
    # Render rolling deploys can run two entrypoints at once; advisory lock then times out.
    # Safe on Render (WEB_CONCURRENCY=1): only one migrate should win via _prisma_migrations.
    if DATABASE_URL="$migrate_url" PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK=1 npx prisma migrate deploy; then
      echo "[entrypoint] Migrations applied."
      return 0
    fi
    if [ "$attempt" -eq "$max_attempts" ]; then
      echo "[entrypoint] ERROR: prisma migrate deploy failed after ${max_attempts} attempts." >&2
      echo "[entrypoint] Tip: run migrations once via Render Pre-Deploy Command:" >&2
      echo "[entrypoint]   /bin/sh /app/docker/render-predeploy.sh" >&2
      echo "[entrypoint] Or apply locally: DIRECT_URL=<neon-direct> npx prisma migrate deploy" >&2
      return 1
    fi
    delay=$((attempt * 8))
    echo "[entrypoint] Migrate failed — retrying in ${delay}s..."
    sleep "$delay"
    attempt=$((attempt + 1))
  done
}

run_migrate_deploy

echo "[entrypoint] Chromium check: $(command -v chromium || echo MISSING)"
echo "[entrypoint] PUPPETEER_EXECUTABLE_PATH=${PUPPETEER_EXECUTABLE_PATH}"

echo "[entrypoint] Starting NestJS..."
exec node dist/src/main.js
