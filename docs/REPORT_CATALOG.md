# Report Catalog (FRESA)

Staff report catalog APIs under `/reports/*`. Catalog templates are **additive** — they do not replace:

- `POST/GET /quotations/:id/pdf*`
- `POST/GET /invoices/:id/pdf*`
- Portal / vendor PDF flows
- On-screen MIS / GL / documentation JSON reports

## Engine

Puppeteer + Handlebars (PDF) and ExcelJS / csv-stringify (XLSX/CSV). Jasper/JRXML is **not** integrated; this stack is the in-repo Jasper equivalent. There is **no** Jasper pack upload — use **bind-renderer** to attach an implemented pack key.

## Endpoints

| Method | Path | Notes |
|--------|------|--------|
| GET | `/reports/templates` | Active only unless `include_inactive=true` |
| GET | `/reports/templates/renderers` | Implemented `ops.*` / `sea.*` keys FE can bind |
| GET | `/reports/templates/:idOrCode` | Detail + `parameters[]` (returns **inactive** for FRESA browse) |
| POST | `/reports/templates/import` | `reports.manage` — upsert registry JSON body |
| POST | `/reports/templates/:code/bind-renderer` | `reports.manage` — set real `renderer_key` (clears `pending.*`); optional `activate: true` |
| POST | `/reports/templates/:code/activate` | `reports.manage` — activate; optional body `{ "renderer_key": "ops.…" }` binds+activates |
| POST | `/reports/templates/:code/deactivate` | `reports.manage` |
| POST | `/reports/generate` | **201**; Redis on → `queued`; Redis off → sync `ready` + `download_url`/`expires_at` |
| GET | `/reports/jobs/:jobId` | Poll status |
| GET | `/reports/jobs/:jobId/download` | Binary blob |

## Permissions

- `reports.read`
- `reports.generate`
- `reports.manage` (import / bind-renderer / activate / deactivate)

Sync onto existing tenants via tenant permission sync.

## FE Activate → Generate (today)

Registry stubs start as `renderer_key=pending.{code}` and **cannot** generate until bound to a real pack.

```http
GET  /reports/templates/renderers
POST /reports/templates/ACTIVITY_COMPLETED_JOBS_LIST_REPORT_FORMAT/activate
Content-Type: application/json

{ "renderer_key": "ops.delivered_jobs_period" }
```

Equivalent two-step:

```http
POST /reports/templates/{code}/bind-renderer
{ "renderer_key": "ops.delivered_jobs_period", "activate": true }
```

Then: `POST /reports/generate` → poll job → download.

Empty stub `parameters_schema` is copied from the donor pack when binding.

## Registry + activation

1. On boot: Phase-1 ops_list + Phase-2 sea_docs packs upserted as **active**.
2. Then FRESA registry import from [`src/modules/reports/seed/fresaReportRegistry.json`](../src/modules/reports/seed/fresaReportRegistry.json) (~607 stubs shipped; replace with FE taxonomy when ready). Upserts as **inactive** (`renderer_key=pending.{code}`) except pack-protected codes.
3. Pack-protected codes are never downgraded by registry import.
4. To activate a FRESA sample without a new backend pack: **bind** an existing `ops.*` / `sea.*` key → activate → appears on next `GET /reports/templates`.

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
- Jasper server / JRXML upload / full ~600 unique renderers in one epic
