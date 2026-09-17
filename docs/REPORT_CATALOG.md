# Report Catalog (FRESA)

Staff report catalog APIs under `/reports/*`. Catalog templates are **additive** — they do not replace:

- `POST/GET /quotations/:id/pdf*`
- `POST/GET /invoices/:id/pdf*`
- Portal / vendor PDF flows
- On-screen MIS / GL / documentation JSON reports

## Engine

Puppeteer + Handlebars (PDF) and ExcelJS / csv-stringify (XLSX/CSV). Jasper/JRXML is **not** integrated; this stack is the in-repo Jasper equivalent. There is **no** Jasper pack upload — use **bind-renderer** to attach an implemented pack key.

**List packs** render a shared table shell. **Document packs** (invoice Format-1, HBL, AN/DO, HAWB, etc.) use dedicated HTML templates via `kind: "document"`.

## Endpoints

| Method | Path | Notes |
|--------|------|--------|
| GET | `/reports/templates` | Active only unless `include_inactive=true` |
| GET | `/reports/templates/renderers` | Implemented pack keys (`ops.*`, `sea.*`, `air.*`, `commercial.*`, `finance.*`, `wms.*`, `quotation.*`) |
| GET | `/reports/templates/:idOrCode` | Detail + `parameters[]` (returns **inactive** for FRESA browse) |
| POST | `/reports/templates/import` | `reports.manage` — upsert registry JSON body; auto-maps codes → packs when implemented |
| POST | `/reports/templates/:code/bind-renderer` | `reports.manage` — set real `renderer_key` (clears `pending.*`); optional `activate: true` |
| POST | `/reports/templates/:code/activate` | `reports.manage` — activate; optional body `{ "renderer_key": "…" }`; auto-binds from map if pending + pack exists |
| POST | `/reports/templates/:code/deactivate` | `reports.manage` |
| POST | `/reports/generate` | **201**; Redis on → `queued`; Redis off → sync `ready` + `download_url`/`expires_at` |
| GET | `/reports/jobs/:jobId` | Poll status |
| GET | `/reports/jobs/:jobId/download` | Binary blob |
| GET | `/invoices/:id/format-payload?format=` | Debug `InvoiceFormatPayload` (does **not** change default invoice PDF) |

## Permissions

- `reports.read`
- `reports.generate`
- `reports.manage` (import / bind-renderer / activate / deactivate)

Sync onto existing tenants via tenant permission sync.

## FE Activate → Generate

Registry stubs start as `renderer_key=pending.{code}` (or an auto-mapped pack key still **inactive**) and **cannot** generate until activated.

```http
GET  /reports/templates/renderers
POST /reports/templates/INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA/activate
Content-Type: application/json

{ "renderer_key": "commercial.invoice_tax_india_1" }
```

Or one-shot:

```http
POST /reports/templates/INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA/bind-renderer
{ "renderer_key": "commercial.invoice_tax_india_1", "activate": true }
```

Then:

```http
POST /reports/generate
{
  "code": "INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA",
  "format": "PDF",
  "parameters": { "invoice_id": "<uuid>" }
}
```

## Auto-bind map

On import (and activate when still `pending.*`), codes matching [`renderer-bind-map.ts`](../src/modules/reports/constants/renderer-bind-map.ts) resolve to a real pack **only if** that pack is in `IMPLEMENTED_RENDERER_KEYS`. Unmatched stay `pending.{CODE}`. Already-bound real keys are never overwritten with `pending.*`.

## Format-1 Tax Invoice India

| Item | Value |
|------|--------|
| Pack | `commercial.invoice_tax_india_1` |
| Template code | `INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA` |
| GST | Line tax mapped to **IGST** bucket; SGST/CGST zero until line-level GST exists |
| Default PDF | `POST /invoices/:id/pdf` **unchanged** |

## Registry + activation

1. On boot: Phase-1 ops_list + Phase-2 sea list packs upserted as **active**; priority document packs upserted with real `renderer_key` but **inactive**.
2. FRESA registry import from [`fresaReportRegistry.json`](../src/modules/reports/seed/fresaReportRegistry.json) (~607 stubs; replace with FE taxonomy when ready).
3. Pack-protected codes are never downgraded by registry import.

## Phase packs

| Phase | Family | Status |
|------:|--------|--------|
| 1 | `ops_list` | Active list packs + `ops.list_generic` |
| 2 | `sea_docs` | List packs + document shells (`sea.hbl_draft`, arrival, DO) |
| 3 | `air_docs` / `quotation` | HAWB/MAWB/AN/DO + `quotation.standard` |
| 4 | `commercial` | Format-1 / Format-2 / Summary India |
| 5 | `finance` | Aging, SOA, TB, voucher, outstanding letter |
| 6 | `wms` | ASN list/detail + warehouse note |

## Env

- `REPORT_MAX_CONCURRENT` (default `3`)
- Report file TTL: 24 hours (`expires_at`)

## P2 / do not implement

- Jasper server / JRXML upload
- Scraping Fresa sample site into the API
- Replacing default invoice/quotation PDF buttons with catalog Format-N
