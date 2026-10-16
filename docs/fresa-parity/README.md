# Fresa Exact Parity — Backend field matrices

Living docs for 1A backend parity with [OPERATION TRAINING_BLOGS.pdf](../OPERATION%20TRAINING_BLOGS.pdf).

> **Client demos:** use [WAVE_STATUS.md](./WAVE_STATUS.md) for current coverage. The July `Fresa-Feature-Specification-Coverage-Report.md` PDF is **stale** — do not cite its headline %.

## Locked decisions

- Staff path: Enquiry → Quotation (Verified → Approved) → **Shipment** → **Job**
- Portal/vendor rewired onto Shipment + Job (hybrid 2C)
- FE consumes OpenAPI; this folder tracks API coverage per training topic

## Modules

| Matrix | Status |
|--------|--------|
| [enquiry.md](./enquiry.md) | Match (5-step wizard + detail actions) |
| [ops-continuum.md](./ops-continuum.md) | Match (shared side panels + comments) |
| [favourites.md](./favourites.md) | Unified `/favourites` (+ masters proxy) |
| [quotation.md](./quotation.md) | Match |
| [quotation-detail.md](./quotation-detail.md) | Match (detail tabs + toolbar) |
| [shipment.md](./shipment.md) | Match |
| [shipment-detail.md](./shipment-detail.md) | Match (detail tabs + toolbar + proxies) |
| [job-console.md](./job-console.md) | Match |
| [job-detail.md](./job-detail.md) | Match (detail tabs + status catalog + GPUM + booking form + thin tabs) |
| [job-fe-shell.md](./job-fe-shell.md) | FE OpenAPI checklist (separate FE repo) |
| [job-organization.md](./job-organization.md) | Organization tab (add/select/create party) |
| [job-dimensions.md](./job-dimensions.md) | Dimension lines + upload |
| [job-containers.md](./job-containers.md) | Container tab (job-scoped) |
| [job-fresa-blog-features.md](./job-fresa-blog-features.md) | Blog → API map (11 topics) |
| [job-module-route-map.md](./job-module-route-map.md) | FE screen → routes |
| [WAVE_STATUS.md](./WAVE_STATUS.md) | Waves 1–3 demo status (supersedes stale PDF %) |
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
- Typed uploads: `src/test/typed-document-uploads.e2e-spec.ts` (staff HAWB → portal download; portal booking commercial_invoice → staff `uploader_side=CUSTOMER`; vendor upload → staff).
- Wave 1 parity: `src/test/fresa-wave1-parity.e2e-spec.ts` (DO-not-invoiced, finance report, routing push, typed refs).
- Continuum + favourites: `src/test/ops-continuum-favourites.e2e-spec.ts` (JOB comments, `/favourites/toggle`, detail path_hints).

## Parity legend

- **Match** — API exists and matches Fresa semantics
- **Partial** — capability in another shape
- **Missing** — not yet implemented
- **N/A** — FE-only / out of backend scope
