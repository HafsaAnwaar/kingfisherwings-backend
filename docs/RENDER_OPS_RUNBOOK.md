# Render Production Operations Runbook — Week 28

**Production URL:** `https://kingfisherwings.onrender.com`  
**Database:** Neon PostgreSQL (pooled `DATABASE_URL` + `DIRECT_URL` for migrations)  
**Cache/Queue:** Managed Redis (`REDIS_ENABLED=true`)

## Deploy pipeline

1. Merge to `main` → GitHub Actions CI (lint, test, e2e, build, Docker).
2. Render: manual or auto deploy from `main`.
3. Pre-deploy: `docker/render-predeploy.sh` → `prisma migrate deploy` on `DIRECT_URL`.
4. Post-deploy (within 15 minutes):
   ```bash
   POST /tenants/{id}/sync-permissions   # each live tenant
   BASE_URL=https://kingfisherwings.onrender.com node scripts/week21-documentation-api-test.cjs
   BASE_URL=https://kingfisherwings.onrender.com node scripts/week22-documentation-api-test.cjs
   CRON_SECRET=xxx BASE_URL=https://kingfisherwings.onrender.com node scripts/week23-deploy-check.cjs
   ```

## Monitoring

| Signal | Where |
|--------|-------|
| Liveness | Render health check → `GET /health` |
| Errors | Sentry (`SENTRY_DSN`) |
| Redis | Render/managed Redis dashboard; app logs if queue noop |
| DB | Neon dashboard, connection count, PITR |

## Backups

- **Neon PITR:** enable on production branch; document restore drill quarterly.
- **Secrets:** Render env groups; rotation calendar (JWT, CRON, webhook secrets, Stripe).

## Redis fallback

When Redis is unavailable:
- PDF/document generation queue noop (warn in logs)
- Documentation upload processes synchronously
- Rate limiting falls back to in-memory (single instance)

## Storage

- Single Render instance: local disk OK for dev/staging.
- Multi-instance production: **must** use S3 (`storage` config).

## Incident response

1. Check Render deploy status + logs.
2. `GET /health` — database connected?
3. If migration failure: stop deploy, Neon PITR if needed, redeploy previous build.
4. Run smoke scripts with `X-Throttle-Bypass: $CRON_SECRET`.

## Deferred (explicit — not forgotten)

- Mobile Sales App (Fresa Ch.26)
- Customer payment gateway (portal)
- Live WhatsApp CRM
- General Trading bridge (`docs/GENERAL_TRADING_PLAN.md`)

See also: [DEPLOY_RUNBOOK.md](./DEPLOY_RUNBOOK.md)
