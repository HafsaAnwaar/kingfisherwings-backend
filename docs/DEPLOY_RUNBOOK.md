# Production Deploy Runbook (Render + Neon)

**Target:** `https://kingfisherwings.onrender.com`

## Pre-deploy checklist

1. `npm run build` passes locally.
2. `npx prisma validate` and migrations committed.
3. Review env vars against [`.env.production.example`](../.env.production.example).

## Deploy steps

1. Merge to `main` → CI pipeline (lint, test, e2e, build) must pass.
2. Render deploy triggers (or manual deploy from dashboard).
3. **Pre-deploy command** (recommended): `/bin/sh /app/docker/render-predeploy.sh`  
   - Runs `prisma migrate deploy` against Neon `DIRECT_URL`.
4. After deploy, for **each live tenant**:
   ```http
   POST /tenants/{tenantId}/sync-permissions
   Authorization: Bearer {super_admin_token}
   ```
5. Run smoke tests within 15 minutes:
   ```bash
   BASE_URL=https://kingfisherwings.onrender.com node scripts/week21-documentation-api-test.cjs
   BASE_URL=https://kingfisherwings.onrender.com node scripts/week22-documentation-api-test.cjs
   CRON_SECRET=your_secret BASE_URL=https://kingfisherwings.onrender.com node scripts/live-api-test-suite.cjs
   ```
   Pass `CRON_SECRET` as `X-Throttle-Bypass` header to avoid 429 during bulk live tests.

## Critical migrations

| Migration | Purpose |
|-----------|---------|
| `20260831100000_week21_documentation_module` | Documentation tables + API keys |
| `20260831120000_week23_28_closure` | Party EDI, webhook deliveries, sea scans, indexes |

## Rollback

- Render: redeploy previous successful build.
- DB: Neon PITR restore if migration caused data issues (contact DBA).

## Post-deploy monitoring

- `GET /health` — database connected
- Sentry dashboard (when `SENTRY_DSN` configured)
- Render logs for PDF queue / Redis connection warnings
