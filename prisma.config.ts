import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

/** Prefer DIRECT_URL (Neon non-pooler) for migrate; fall back to DATABASE_URL. */
const datasourceUrl =
  process.env.DIRECT_URL?.trim() || env('DATABASE_URL');

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
