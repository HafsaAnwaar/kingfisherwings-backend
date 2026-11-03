# Phase-1 visual QA + regression

## Side-by-side (catalog packs)

For each pack: generate with a live id → open PDF/XLSX → compare to `docs/fresa-samples/*`.

| Pack | Code | Context | Checks |
|------|------|---------|--------|
| `sea.hbl_draft` | `SEA_HBL_DRAFT` | `job_id` | Nested BL form, DRAFT watermark, shipper/consignee blocks, POL/POD, no KF title-bar blue |
| `air.hawb_draft` | `AIR_HAWB_DRAFT` | `job_id` (air job) | HAWB form grid, DRAFT watermark, airports, flight |
| `commercial.invoice_tax_india_1` | `INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA` | `invoice_id` | Outer border, TAX INVOICE bar, GST columns, bank block; additive only |
| `ops.list_generic` | `OPS_LIST_GENERIC` | date filters | Header `#1F4E79`, alternating row tint, column labels |

```http
POST /reports/generate
{ "code": "SEA_HBL_DRAFT", "format": "PDF", "parameters": { "job_id": "<uuid>" } }
```

Expect **4xx** when `job_id` / `invoice_id` missing (never invent Fresa demo names).

## Regression (must stay 200)

| Endpoint | Notes |
|----------|--------|
| `POST /invoices/:id/pdf` | Default invoice PDF unchanged |
| `POST /quotations/:id/pdf` | Default quotation PDF unchanged |
| Classic job HBL/HAWB document paths | Keep until FE switches after visual QA |

## Phases 2–5

Repeat pack checklist: sample → rebuild → branding slots → loader → bind/activate → generate → QA. Analytics-only codes → `covered_analytics` via `isCoveredAnalyticsCode` (no fake document PDF).
