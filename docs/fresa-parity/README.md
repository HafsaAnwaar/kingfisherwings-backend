# Fresa Exact Parity — Backend field matrices

Living docs for 1A backend parity with [OPERATION TRAINING_BLOGS.pdf](../OPERATION%20TRAINING_BLOGS.pdf).

## Locked decisions

- Staff path: Enquiry → Quotation (Verified → Approved) → **Shipment** → **Job**
- Portal/vendor rewired onto Shipment + Job (hybrid 2C)
- FE consumes OpenAPI; this folder tracks API coverage per training topic

## Modules

| Matrix | Status |
|--------|--------|
| [enquiry.md](./enquiry.md) | Match (5-step wizard + detail actions) |
| [ops-continuum.md](./ops-continuum.md) | Match (shared side panels) |
| [quotation.md](./quotation.md) | Match |
| [quotation-detail.md](./quotation-detail.md) | Match (detail tabs + toolbar) |
| [shipment.md](./shipment.md) | Match |
| [shipment-detail.md](./shipment-detail.md) | Match (detail tabs + toolbar + proxies) |
| [job-console.md](./job-console.md) | Match |
| [costing.md](./costing.md) | Match |
| [docs-reports.md](./docs-reports.md) | Match |
| [masters-crm.md](./masters-crm.md) | Match |
| [portal-vendor.md](./portal-vendor.md) | Match |

## Dual-read / migration

- Migrations: `20261009120000_fresa_shipment_parity`, `20261009190000_quote_shipment_detail_parity`
- Portal `GET /portal/shipments` prefers `Shipment` rows owned by the party; legacy Jobs with no linked Shipment are appended (de-duped by `job_id`) so pre-parity bookings still appear.
- Tracking/docs/workflow resolve Shipment id → `job_id` when present.
- Booking forms remain keyed by `job_id` during dual-read; accept creates Shipment first, Generate Job / convert-to-job creates/links Job.
- Number type: `SHIPMENT` via `NumberGeneratorService`.

## E2E

- Skeleton: `src/test/fresa-flow-smoke.e2e-spec.ts` (enquiry→quote→verify→approve→shipment→job). Requires `DATABASE_URL` with the parity migration applied.

## Parity legend

- **Match** — API exists and matches Fresa semantics
- **Partial** — capability in another shape
- **Missing** — not yet implemented
- **N/A** — FE-only / out of backend scope
