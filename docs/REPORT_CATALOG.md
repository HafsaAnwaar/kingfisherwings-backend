# Report Catalog (FRESA)

Staff report catalog APIs under `/reports/*`. Catalog templates are **additive** — they do not replace:

- `POST/GET /quotations/:id/pdf*`
- `POST/GET /invoices/:id/pdf*`
- Portal / vendor PDF flows
- On-screen MIS / GL / documentation JSON reports

## Engine

Puppeteer + Handlebars (PDF) and ExcelJS / csv-stringify (XLSX/CSV). Jasper/JRXML is **not** integrated; this stack is the in-repo Jasper equivalent.

## Endpoints

| Method | Path | Notes |
|--------|------|--------|
| GET | `/reports/templates` | Paginated active templates |
| GET | `/reports/templates/:idOrCode` | Detail + hydrated `parameters[]` |
| POST | `/reports/generate` | Async when Redis on; sync `ready` when Redis off |
| GET | `/reports/jobs/:jobId` | Poll status |
| GET | `/reports/jobs/:jobId/download` | Binary blob |

## Permissions

- `reports.read`
- `reports.generate`

Sync onto existing tenants via tenant permission sync.

## Phase packs

Phase 1 ships ~10 active `ops_list` templates (seeded on boot). Later families (`sea_docs`, `air_docs`, `commercial`, `finance`, `wms`, `quotation`) activate by seeding rows with `is_active` + implementing `renderer_key` data packs — **no new endpoints**.

## P2 / do not implement

- `/users/:id/homepage-config`
- `/finance/summary/revenue-mtd` (use MIS)
- `/tasks/pending` (use portal/vendor task APIs)

## Env

- `REPORT_MAX_CONCURRENT` (default `3`) — max `queued`+`running` jobs per tenant
- Report file TTL: 24 hours (`expires_at`)
