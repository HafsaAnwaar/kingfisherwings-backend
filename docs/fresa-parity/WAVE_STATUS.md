# Fresa parity — Wave status (client demo)

**Supersedes** the July `Fresa-Feature-Specification-Coverage-Report.md` headline % for demos. That PDF binary is **stale**; do not cite its coverage numbers.

Updated: 2026-10-15 (Waves 1–3 backend + FE contracts).

## Headline

| Area | Status | Notes |
|------|--------|-------|
| Job Not Invoiced vs DO | **Shipped** | `GET/POST /operations/job-not-invoiced-do` + pack `finance.job_not_invoice_do` |
| Job Finance by shipment date | **Shipped** | `GET/POST /operations/job-finance-report` + pack `finance.job_finance_shipment_date` |
| Master ↔ house routing/containers | **Shipped** | Push routing / sync & push containers |
| FE shell contracts | **Shipped (BE)** | `path_hints` / `actions` on `GET /jobs/:id/detail` — FE wires separately |
| SABER / RA / ISF + overseas agent | **Shipped** | Typed refs + `OVERSEAS_AGENT` org role |
| Voyage / email To-CC / create-party gate | **Shipped** | Shipment filters, suggest recipients, tenant setting |
| Closed-job overrides | **Shipped** | `PATCH /jobs/:id/closed-overrides` + permission flag |
| Exceptions / KPI / job-list-summary | **Shipped** | Ops endpoints + dedicated report packs |
| Typed docs / track / portal costing | **Shipped earlier** | See [docs-reports.md](./docs-reports.md), [portal-vendor.md](./portal-vendor.md) |

## Beat Fresa (demo talking points)

Capabilities that go beyond classic Fresa UX:

1. **Public track-by-anything** — job number, container, HBL/MBL, barcode, tracking token.
2. **Typed document uploads** with party visibility (staff / customer / vendor) on job, invoice, voucher.
3. **Permission-aware closed overrides** — not a blanket unlock of the closed job.
4. **Shipment-date finance report** with fallback to `job_date` when no linked shipment.
5. **Exception rules engine** — DO uninvoiced, ATD without BL, ATA missing, ETA+N not closed (not a generic list stub).
6. **OpenAPI path_hints** so FE can stay aligned without hard-coded route maps.

## Wave checklist

### Wave 1

- [x] DO-not-invoiced data pack + ops endpoints
- [x] Job finance by shipment date pack + ops endpoints
- [x] Routing push-to-subjobs; containers sync enhance + push
- [x] Detail path_hints + [job-fe-shell.md](./job-fe-shell.md)

### Wave 2

- [x] SABER / RA_CODE / ISF + OVERSEAS_AGENT
- [x] Voyage filters + email suggest + `allow_create_party_from_job`
- [x] Closed overrides + `can_edit_closed_delivery`

### Wave 3

- [x] Exceptions / KPI / job-list-summary packs
- [x] This status doc + Wave 1 e2e smoke

## E2E

- `src/test/fresa-wave1-parity.e2e-spec.ts` — DO-not-invoiced query, finance report, routing push, typed ref upsert
- Requires `DATABASE_URL` with migrations through `20261015120000_wave2_refs_overseas_agent`

## FE remaining

See [job-fe-shell.md](./job-fe-shell.md) “Feels like Fresa” checklist — separate FE repo.
