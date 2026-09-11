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
| GET | `/reports/templates` | Active only unless `include_inactive=true` |
| GET | `/reports/templates/:idOrCode` | Detail + `parameters[]` (returns **inactive** for FRESA browse) |
| POST | `/reports/templates/import` | `reports.manage` — upsert registry JSON body |
| POST | `/reports/templates/:code/activate` | `reports.manage` — requires non-`pending.*` renderer |
| POST | `/reports/templates/:code/deactivate` | `reports.manage` |
| POST | `/reports/generate` | **201**; Redis on → `queued`; Redis off → sync `ready` + `download_url`/`expires_at` |
| GET | `/reports/jobs/:jobId` | Poll status |
| GET | `/reports/jobs/:jobId/download` | Binary blob |

## Permissions

- `reports.read`
- `reports.generate`
- `reports.manage` (import / activate / deactivate)

Sync onto existing tenants via tenant permission sync.

## Registry + activation (zero FE change)

1. On boot: Phase-1 ops_list + Phase-2 sea_docs packs upserted as **active**.
2. Then FRESA registry import: if [`src/modules/reports/seed/fresaReportRegistry.json`](../src/modules/reports/seed/fresaReportRegistry.json) has a non-empty `templates` list, upsert those codes as **inactive** (`renderer_key=pending.{code}`). If missing or empty, ~607 generated stubs are seeded inactive.
3. Pack-protected codes are never downgraded by registry import.
4. To activate a sample: implement `renderer_key` data pack → `POST /reports/templates/:code/activate` → appears on next `GET /reports/templates` (no FE PR).

### Inactive vs active (FE)

| Action | Inactive | Active |
|--------|----------|--------|
| Default list | Hidden | Shown |
| Detail by code | Returned (`is_active:false`) | Returned |
| Generate | 404/error | Job created |

## Phase packs

| Phase | Family | Status |
|------:|--------|--------|
| 1 | `ops_list` (~10) | Active |
| 2 | `sea_docs` (~8) | Active pilot |
| 3–6 | air / quotation / commercial / finance / wms | Registry stubs only until packs land |

## Env

- `REPORT_MAX_CONCURRENT` (default `3`)
- Report file TTL: 24 hours (`expires_at`)

## P2 / do not implement

- `/users/:id/homepage-config`
- `/finance/summary/revenue-mtd` (use MIS)
- `/tasks/pending` (use portal/vendor task APIs)
- Jasper server / full ~600 renderers in one epic
