import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

/**
 * Prefer DIRECT_URL (Neon non-pooler) for migrate; fall back to DATABASE_URL.
 * Neon console often appends channel_binding=require which breaks Prisma on
 * Windows/pooler (P1001 despite TCP succeeding) — strip it here.
 */
function normalizeDatasourceUrl(raw: string): string {
  try {
    const u = new URL(raw);
    if (u.searchParams.get('channel_binding') === 'require') {
      u.searchParams.delete('channel_binding');
    }
    if (!u.searchParams.get('sslmode')) {
      u.searchParams.set('sslmode', 'require');
    }
    if (!u.searchParams.get('connect_timeout')) {
      u.searchParams.set('connect_timeout', '30');
    }
    return u.toString();
  } catch {
    return raw;
  }
}

const datasourceUrl = normalizeDatasourceUrl(
  process.env.DIRECT_URL?.trim() || env('DATABASE_URL'),
);

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'ts-node -r tsconfig-paths/register prisma/seed/super-admin.ts',
  },
  datasource: {
    url: datasourceUrl,
  },
});
