#!/bin/sh
# Render Pre-Deploy Command (runs once per deploy, before new instances boot).
# Dashboard → Settings → Pre-Deploy Command:
#   /bin/sh /app/docker/render-predeploy.sh
#
# Set DIRECT_URL in Render env (Neon direct host, no -pooler).

set -e

resolve_migrate_database_url() {
  if [ -n "$DIRECT_URL" ]; then
    printf '%s' "$DIRECT_URL"
    return
  fi
  if [ -z "$DATABASE_URL" ]; then
    echo "[predeploy] ERROR: DATABASE_URL is not set" >&2
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

migrate_url="$(sanitize_pg_url "$(resolve_migrate_database_url)")"
echo "[predeploy] migrate target host: $(printf '%s' "$migrate_url" | sed -E 's|^[^@]+@([^/:?]+).*|\1|')"

attempt=1
max_attempts="${PRISMA_MIGRATE_MAX_ATTEMPTS:-3}"
while [ "$attempt" -le "$max_attempts" ]; do
  echo "[predeploy] prisma migrate deploy (attempt ${attempt}/${max_attempts})..."
  if DATABASE_URL="$migrate_url" PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK=1 npx prisma migrate deploy; then
    echo "[predeploy] Migrations applied."
    exit 0
  fi
  if [ "$attempt" -eq "$max_attempts" ]; then
    echo "[predeploy] ERROR: migrate deploy failed." >&2
    exit 1
  fi
  sleep $((attempt * 8))
  attempt=$((attempt + 1))
done
