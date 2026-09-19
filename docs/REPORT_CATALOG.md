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
| GET | `/reports/templates/renderers` | Implemented pack keys |
| GET | `/reports/templates/:idOrCode` | Detail + `parameters[]` (returns **inactive** for FRESA browse) |
| POST | `/reports/templates/import` | `reports.manage` — body: array **or** `{ templates: [] }`; auto-maps codes → packs when implemented |
| POST | `/reports/templates/:code/bind-renderer` | `reports.manage` — set real `renderer_key` (clears `pending.*`); optional `activate: true` |
| POST | `/reports/templates/:code/activate` | `reports.manage` — activate; optional body `{ "renderer_key": "…" }`; auto-binds from map if pending + pack exists |
| POST | `/reports/templates/:code/deactivate` | `reports.manage` |
| POST | `/reports/generate` | **201**; Redis on → `queued`; Redis off → sync `ready` + `download_url`/`expires_at` |
| GET | `/reports/jobs/:jobId` | Poll status |
| GET | `/reports/jobs/:jobId/download` | Binary blob |
| GET | `/invoices/:id/format-payload?format=` | Debug `InvoiceFormatPayload` (does **not** change default invoice PDF) |

### Search contract (`GET /reports/templates`)

- Query `search` is split on whitespace into **tokens**
- Every token must match (`AND`) across **name OR code OR description** (case-insensitive `contains`)
- Empty search → full list (still filtered by `include_inactive`, `family`, `context`)
- Empty matches → `data: []`, `meta.total: 0` (never 500)
- Example: `GET /reports/templates?search=hbl%20draft&include_inactive=true`

## Permissions

- `reports.read`
- `reports.generate`
- `reports.manage` (import / bind-renderer / activate / deactivate)

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

Unbound `pending.*` generate returns clear **4xx** (no fake PDF).

## Auto-bind map

On import (and activate when still `pending.*`), codes matching [`renderer-bind-map.ts`](../src/modules/reports/constants/renderer-bind-map.ts) resolve to a real pack **only if** that pack is in `IMPLEMENTED_RENDERER_KEYS`. Unmatched stay `pending.{CODE}`. Already-bound real keys are never overwritten with `pending.*`. Pack-protected codes are never downgraded by registry import.

| Pattern family | Target pack |
|----------------|-------------|
| `HBL_DRAFT_*` / `FG_HBL_*` | `sea.hbl_draft` / `sea.hbl_original` |
| `ARRIVAL_NOTICE_*` / air vs sea prefixes | `sea.arrival_notice` / `air.arrival_notice` |
| `DELIVERY_*` / `PROOF_OF_*` | `sea.delivery_order` / `air.delivery_order` |
| `HAWB_*` / `MAWB_*` | `air.hawb_draft` / `air.mawb` |
| `*_LIST_*` / `DSR_*` / `JOB_STATUS_*` | `ops.list_generic` |
| `INVOICE_REPORT_FORMAT_1_*` | `commercial.invoice_tax_india_1` |
| `JOURNAL_*` / `PAYMENT_*` / `RECEIPT_*` | distinct finance voucher packs |
| `ADVANCE_SHIPPING_NOTE*` / `WMS_GRN_*` / `WMS_GDO_*` | `wms.asn` / `wms.grn` / `wms.gdo` |
| `BOOKING_CONFIRMATION_*` / `PRE_ALERT_*` | `other.booking_confirmation` / `other.pre_alert` |
| `QUOTATION_REPORT_FORMAT_*` | `quotation.standard` |

## Format-1 Tax Invoice India

| Item | Value |
|------|--------|
| Pack | `commercial.invoice_tax_india_1` |
| Template code | `INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA` |
| Sections | Header+logo, TAX INVOICE bar, bill-to, invoice meta, shipment grid, containers, SAC+GST columns, tax summary + amount in words, terms+bank, footer |
| GST | `vat_number` → GSTIN; line SAC/HSN from charge_code when present; line `tax_amount` mapped to **IGST**; SGST/CGST zero until line-level GST exists |
| Default PDF | `POST /invoices/:id/pdf` **unchanged** |

## Additive commercial packs

| Pack | Typical codes |
|------|----------------|
| `commercial.invoice_tax_india_2` | Format-2 Tax Invoice India |
| `commercial.invoice_summary_india` | Summary |
| `commercial.invoice_standard` | Format-10 / Standard Invoice |
| `commercial.invoice_simple_india` | Format-6/7 Simple India |
| `commercial.invoice_arabic` | Format-8 Arabic |
| `commercial.invoice_usa` | Format-9 USA |
| `commercial.invoice_warehouse` | Format-21 Warehouse |

## Registry + activation

1. On boot: Phase-1 ops_list + Phase-2 sea list packs upserted as **active**; priority document packs upserted with real `renderer_key` but **inactive**.
2. FRESA registry import from [`fresaReportRegistry.json`](../src/modules/reports/seed/fresaReportRegistry.json) — **852** FE taxonomy entries (`{ templates: [...] }`). Regenerate via `node scripts/generate-fresa-registry.js`.
3. Pack-protected codes are never downgraded by registry import.

## Phase packs

| Phase | Family | Status |
|------:|--------|--------|
| 1 | `ops_list` | Active list packs + `ops.list_generic` with column configs (DSR/status/pending) |
| 2 | `sea_docs` | List packs + `sea.hbl_*`, arrival, DO, `sea.cargo_manifest`, `sea.stuffing_report`, `sea.letter_shell` |
| 3 | `air_docs` / `quotation` | HAWB/MAWB/AN/DO + `quotation.standard` |
| 4 | `commercial` | Format-1 (parity) + Format-2 / Summary / Standard / Simple / Arabic / USA / Warehouse |
| 5 | `finance` | Aging, SOA, TB, `finance.voucher` + journal/payment/receipt splits, outstanding letter |
| 6 | `wms` / `other` | ASN + `wms.grn` / `wms.gdo` + warehouse note; `other.booking_confirmation` / `other.pre_alert` |

## Env

- `REPORT_MAX_CONCURRENT` (default `3`)
- Report file TTL: 24 hours (`expires_at`)

## Smoke / regression

After deploy / restart API (Swagger tag **Reports — Catalog**):

1. `GET /reports/templates?search=hbl%20draft&include_inactive=true` → AND-token matches on name/code/description
2. `POST /reports/templates/import` with full FE body → upsert succeeds; protected packs untouched
3. `GET /reports/templates/renderers` lists every implemented pack
4. Format-1: bind + activate + generate with real `invoice_id` → downloadable PDF
5. Confirm `POST /invoices/:id/pdf` and `POST /quotations/:id/pdf` still work unchanged

## P2 / do not implement

- Jasper server / JRXML upload
- Scraping Fresa sample site into the API
- Replacing default invoice/quotation PDF buttons with catalog Format-N
- Replacing module analytics hubs (`covered_analytics`)
